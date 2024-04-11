package mastercard

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"sync"
	"time"

	"github.com/go-resty/resty/v2"
	"gopkg.in/square/go-jose.v2"

	"a.yandex-team.ru/library/go/core/log"
)

type PublicKeysManager struct {
	logger       log.Logger
	url          string
	updatePeriod time.Duration
	cachePath    string

	httpClient       *http.Client
	retryCount       int
	retryWaitTime    time.Duration
	maxRetryWaitTime time.Duration
	rc               *resty.Client

	initDownloadTimeout time.Duration

	keys    chan *jose.JSONWebKeySet
	updates chan *jose.JSONWebKeySet
	cancel  context.CancelFunc
	wg      sync.WaitGroup
}

const (
	defaultRetryCount          = 128
	defaultRetryWaitTime       = 1 * time.Second
	defaultMaxRetryWaitTime    = 30 * time.Minute
	defaultUpdatePeriod        = time.Hour
	defaultInitDownloadTimeout = 15 * time.Second
)

type PublicKeysManagerOption interface {
	apply(manager *PublicKeysManager)
}

func WithHTTPClient(client *http.Client) PublicKeysManagerOption {
	return publicKeyManagerOptionFunc(
		func(manager *PublicKeysManager) {
			manager.httpClient = client
		})
}

func WithRetryParams(retryCount int, retryWaitTime time.Duration, maxRetryWaitTime time.Duration) PublicKeysManagerOption {
	return publicKeyManagerOptionFunc(
		func(manager *PublicKeysManager) {
			manager.retryCount = retryCount
			manager.retryWaitTime = retryWaitTime
			manager.maxRetryWaitTime = maxRetryWaitTime
		})
}

func WithKeysUpdatePeriod(period time.Duration) PublicKeysManagerOption {
	return publicKeyManagerOptionFunc(
		func(manager *PublicKeysManager) {
			manager.updatePeriod = period
		})
}

func WithInitialTimeout(timeout time.Duration) PublicKeysManagerOption {
	return publicKeyManagerOptionFunc(
		func(manager *PublicKeysManager) {
			manager.initDownloadTimeout = timeout
		})
}

func WithCachePath(cachePath string) PublicKeysManagerOption {
	return publicKeyManagerOptionFunc(
		func(manager *PublicKeysManager) {
			manager.cachePath = cachePath
		})
}

func NewPublicKeysManager(logger log.Logger, keysURL string, options ...PublicKeysManagerOption) *PublicKeysManager {
	ctx, cancel := context.WithCancel(context.Background())

	m := &PublicKeysManager{
		logger: logger,
		url:    keysURL,

		httpClient:          &http.Client{},
		retryWaitTime:       defaultRetryWaitTime,
		retryCount:          defaultRetryCount,
		maxRetryWaitTime:    defaultMaxRetryWaitTime,
		initDownloadTimeout: defaultInitDownloadTimeout,
		updatePeriod:        defaultUpdatePeriod,

		keys:    make(chan *jose.JSONWebKeySet),
		cancel:  cancel,
		updates: make(chan *jose.JSONWebKeySet),
	}

	for _, opt := range options {
		opt.apply(m)
	}

	rc := resty.NewWithClient(m.httpClient)
	rc.SetRetryMaxWaitTime(m.maxRetryWaitTime)
	rc.SetRetryCount(m.retryCount)
	rc.SetRetryWaitTime(m.retryWaitTime)
	m.rc = rc

	go m.worker(ctx)
	go m.updater(ctx)
	m.wg.Add(2)

	return m
}

func (m *PublicKeysManager) Close() {
	m.cancel()
	m.wg.Wait()
}

func (m *PublicKeysManager) Get() *jose.JSONWebKeySet {
	return <-m.keys
}

func getKids(ks *jose.JSONWebKeySet) []string {
	kids := make([]string, len(ks.Keys))
	for i := range ks.Keys {
		kids[i] = ks.Keys[i].KeyID
	}

	return kids
}

func (m *PublicKeysManager) worker(ctx context.Context) {
	initContext, cancelInitCtx := context.WithTimeout(ctx, m.initDownloadTimeout)
	keys, err := m.download(initContext)
	cancelInitCtx()
	if err != nil {
		m.logger.Error("download failed", log.Error(err))
		keys, err = m.readCache()
		if err == nil {
			m.logger.Info("read keys from cache")
		} else {
			m.logger.Error("can't obtain mastercard keys; cache failed", log.Error(err))
		}
	} else {
		m.logger.Info("got new mastercard keys", log.Strings("keys_ids", getKids(keys)))
		m.updateCache(keys)
	}

	for {
		select {
		case <-ctx.Done():
			m.wg.Done()
			return
		case m.keys <- keys:
		case keys = <-m.updates:
			m.logger.Info("download new mastercard keys", log.Strings("keys_ids", getKids(keys)))
		}
	}
}

func (m *PublicKeysManager) download(ctx context.Context) (*jose.JSONWebKeySet, error) {
	resp, err := m.rc.R().
		SetResult(jose.JSONWebKeySet{}).
		SetContext(ctx).
		Get(m.url)
	if err != nil {
		return nil, err
	}

	if resp.IsError() {
		return nil, fmt.Errorf("mastercard keys manager: response status: %s", resp.Status())
	}

	if ct := resp.Header().Get("Content-Type"); !resty.IsJSONType(ct) {
		return nil, fmt.Errorf("mastercard keys manager: unknown content type: %s", ct)
	}

	keyset := resp.Result().(*jose.JSONWebKeySet)
	if len(keyset.Keys) == 0 {
		return nil, fmt.Errorf("mastercard keys manager: empty keyset: %s", resp.Body())
	}

	return resp.Result().(*jose.JSONWebKeySet), nil
}

func (m *PublicKeysManager) updater(ctx context.Context) {
	ticker := time.NewTicker(m.updatePeriod)
	m.logger.Debug("start updater with interval", log.Duration("interval", m.updatePeriod))

	for {
		select {
		case <-ticker.C:
			m.updateKeys(ctx)
		case <-ctx.Done():
			m.wg.Done()
			ticker.Stop()
			return
		}
	}
}

func (m *PublicKeysManager) updateKeys(ctx context.Context) {
	keySet, err := m.download(ctx)
	if err != nil {
		m.onUpdateError(err)
		return
	}
	m.updateCache(keySet)

	select {
	case m.updates <- keySet:
	case <-ctx.Done():
	}
}

func (m *PublicKeysManager) onUpdateError(err error) {
	m.logger.Error("can't download public keys", log.Error(err))
}

func (m *PublicKeysManager) readCache() (*jose.JSONWebKeySet, error) {
	if m.cachePath == "" {
		return nil, fmt.Errorf("mastercard keys manager: cachePath not set")
	}
	cachedData, err := ioutil.ReadFile(m.cachePath)
	if err != nil {
		return nil, err
	}
	var keys jose.JSONWebKeySet
	err = json.Unmarshal(cachedData, &keys)
	return &keys, err
}

func (m *PublicKeysManager) updateCache(keys *jose.JSONWebKeySet) {
	if m.cachePath == "" {
		return
	}
	data, err := json.Marshal(keys)
	if err == nil {
		err = ioutil.WriteFile(m.cachePath, data, 0640)
	}
	if err != nil {
		m.logger.Error("can't update cache", log.Error(err))
	}
}

type publicKeyManagerOptionFunc func(manager *PublicKeysManager)

func (f publicKeyManagerOptionFunc) apply(manager *PublicKeysManager) {
	f(manager)
}
