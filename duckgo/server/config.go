package server

import (
	"io/ioutil"
	"os"
	"strings"

	"a.yandex-team.ru/library/go/yandex/tvm"

	"gopkg.in/yaml.v2"
)

// Config is duckgo configuration format
type Config struct {
	InternalAPI  ConfigInternalAPI  `yaml:"internal_api"`
	ExternalAPI  ConfigExternalAPI  `yaml:"external_api"`
	Mastercard   ConfigMastercard   `yaml:"mastercard"`
	Visa         ConfigVisa         `yaml:"visa"`
	PaymentToken ConfigPaymentToken `yaml:"payment_token"`
	Wallet       ConfigWallet       `yaml:"wallet"`
	Logger       ConfigLogger       `yaml:"logger"`
}

type ConfigAuth string

var (
	ConfigAuthTVM       = ConfigAuth("tvm")
	ConfigAuthSharedKey = ConfigAuth("shared_key")
)

type ConfigInternalAPI struct {
	ListenAddr string     `yaml:"listen_addr"`
	Auth       ConfigAuth `yaml:"auth"`

	SharedKey ConfigSharedKey `yaml:"shared_key"`
}

type ConfigExternalAPI struct {
	CertFile   string     `yaml:"cert_file"`
	KeyFile    string     `yaml:"key_file"`
	ListenAddr string     `yaml:"listen_addr"`
	DisableTLS bool       `yaml:"disable_tls"`
	Auth       ConfigAuth `yaml:"auth"`

	SharedKey ConfigSharedKey `yaml:"shared_key"`
	TVM       ConfigTVM       `yaml:"tvm"`
}

type ConfigSharedKey struct {
	SharedKey     string `yaml:"shared_key"`
	SharedKeyPath string `yaml:"shared_key_path"`
}

type ConfigNamedSharedKey struct {
	KeyID  string `yaml:"key_id"`
	Secret string `yaml:"secret"`

	KeyIDPath  string `yaml:"key_id_path"`
	SecretPath string `yaml:"secret_path"`
}

type ConfigTVM struct {
	Self          string         `yaml:"self"`
	TVMToolURL    string         `yaml:"tvmtool_url"`
	AuthToken     string         `yaml:"auth_token"`
	AuthTokenPath string         `yaml:"auth_token_path"`
	Allowed       []tvm.ClientID `yaml:"allowed"`
}

type ConfigVisa struct {
	IsEnabled     bool   `yaml:"is_enabled"`
	APIHostURL    string `yaml:"api_host_url"`
	ClientAppID   string `yaml:"client_app_id"`
	EnrollTimeout string `yaml:"enroll_timeout"`

	SigningKey    ConfigNamedSharedKey   `yaml:"signing_key"`
	VerifyingKeys []ConfigNamedSharedKey `yaml:"verifying_keys"`
	EncryptionKey ConfigNamedSharedKey   `yaml:"encryption_key"`
}

type ConfigMastercard struct {
	APIHostURL              string `yaml:"api_host_url"`
	PublicKeysURL           string `yaml:"public_keys_url"`
	KeysUpdatePeriod        string `yaml:"keys_update_period"`
	KeysInitDownloadTimeout string `yaml:"keys_init_download_timeout"`
	KeysCachePath           string `yaml:"keys_cache_path"`
	ConsumerKey             string `yaml:"consumer_key"`
	ConsumerKeyPath         string `yaml:"consumer_key_path"`
	ClientID                string `yaml:"client_id"`
	ClientIDPath            string `yaml:"client_id_path"`
	ServiceID               string `yaml:"service_id"`
	ServiceIDPath           string `yaml:"service_id_path"`
	SigningKeyPath          string `yaml:"signing_key_path"`
	EncryptionKeyPath       string `yaml:"encryption_key_path"`
}

type ConfigPaymentToken struct {
	SigningKeyPath       string `yaml:"signing_key_path"`
	IntermediateCertPath string `yaml:"intermediate_cert_path"`

	RecipientVerificationPublicKeys []string `yaml:"recipient_verification_public_keys"`
}

type ConfigThales struct {
	CardEncryptionCertPath string `yaml:"card_encryption_cert_path"`
}

type ConfigWallet struct {
	Thales ConfigThales `yaml:"thales"`
}

type ConfigLogger struct {
	Level  string       `yaml:"level"`
	Sink   string       `yaml:"sink"` // syslog or console.
	Syslog ConfigSyslog `yaml:"syslog"`
}

type ConfigSyslog struct {
	Network    string `yaml:"network"`
	RemoteAddr string `yaml:"raddr"`
}

// NewConfig allocates new Config with default values
func NewConfig() *Config {
	return &Config{
		InternalAPI: ConfigInternalAPI{
			ListenAddr: "localhost:2020",
			Auth:       "shared_key",
		},
		ExternalAPI: ConfigExternalAPI{
			Auth: "shared_key",
			TVM: ConfigTVM{
				Self: "duckgo",
			},
		},
		Mastercard: ConfigMastercard{
			KeysUpdatePeriod:        "168h",
			KeysInitDownloadTimeout: "15s",
		},
		Visa: ConfigVisa{
			IsEnabled:     true,
			EnrollTimeout: "16s",
		},
		Wallet: ConfigWallet{
			Thales: ConfigThales{},
		},
		Logger: ConfigLogger{
			Level: "info",
			Sink:  "stdout",
		},
	}
}

// ParseFromFile parse config from file by provided path.
func (cfg *Config) ParseFromFile(path string) error {
	r, err := os.Open(path)
	if err != nil {
		return err
	}
	defer func() {
		_ = r.Close()
	}()

	dec := yaml.NewDecoder(r)
	if err = dec.Decode(cfg); err != nil {
		return err
	}

	if cfg.Mastercard.ConsumerKey == "" && cfg.Mastercard.ConsumerKeyPath != "" {
		cfg.Mastercard.ConsumerKey, err = readSecretFromFile(cfg.Mastercard.ConsumerKeyPath)
		if err != nil {
			return err
		}
	}
	if cfg.Mastercard.ServiceID == "" && cfg.Mastercard.ServiceIDPath != "" {
		cfg.Mastercard.ServiceID, err = readSecretFromFile(cfg.Mastercard.ServiceIDPath)
		if err != nil {
			return err
		}
	}
	if cfg.Mastercard.ClientID == "" && cfg.Mastercard.ClientIDPath != "" {
		cfg.Mastercard.ClientID, err = readSecretFromFile(cfg.Mastercard.ClientIDPath)
		if err != nil {
			return err
		}
	}

	if cfg.InternalAPI.SharedKey.SharedKey == "" && cfg.InternalAPI.SharedKey.SharedKeyPath != "" {
		cfg.InternalAPI.SharedKey.SharedKey, err = readSecretFromFile(cfg.InternalAPI.SharedKey.SharedKeyPath)
		if err != nil {
			return err
		}
	}
	if cfg.ExternalAPI.SharedKey.SharedKey == "" && cfg.ExternalAPI.SharedKey.SharedKeyPath != "" {
		cfg.ExternalAPI.SharedKey.SharedKey, err = readSecretFromFile(cfg.ExternalAPI.SharedKey.SharedKeyPath)
		if err != nil {
			return err
		}
	}

	if cfg.ExternalAPI.TVM.AuthToken == "" && cfg.ExternalAPI.TVM.AuthTokenPath != "" {
		cfg.ExternalAPI.TVM.AuthToken, err = readSecretFromFile(cfg.ExternalAPI.TVM.AuthTokenPath)
		if err != nil {
			return err
		}
	}

	if cfg.Visa.IsEnabled {
		if cfg.Visa.EncryptionKey.KeyID == "" && cfg.Visa.EncryptionKey.KeyIDPath != "" {
			cfg.Visa.EncryptionKey.KeyID, err = readSecretFromFile(cfg.Visa.EncryptionKey.KeyIDPath)
			if err != nil {
				return err
			}
		}

		if cfg.Visa.EncryptionKey.Secret == "" && cfg.Visa.EncryptionKey.SecretPath != "" {
			cfg.Visa.EncryptionKey.Secret, err = readSecretFromFile(cfg.Visa.EncryptionKey.SecretPath)
			if err != nil {
				return err
			}
		}

		if cfg.Visa.SigningKey.KeyID == "" && cfg.Visa.SigningKey.KeyIDPath != "" {
			cfg.Visa.SigningKey.KeyID, err = readSecretFromFile(cfg.Visa.SigningKey.KeyIDPath)
			if err != nil {
				return err
			}
		}

		if cfg.Visa.SigningKey.Secret == "" && cfg.Visa.SigningKey.SecretPath != "" {
			cfg.Visa.SigningKey.Secret, err = readSecretFromFile(cfg.Visa.SigningKey.SecretPath)
			if err != nil {
				return err
			}
		}

		for i, key := range cfg.Visa.VerifyingKeys {
			if key.KeyID == "" && key.KeyIDPath != "" {
				cfg.Visa.VerifyingKeys[i].KeyID, err = readSecretFromFile(key.KeyIDPath)
				if err != nil {
					return err
				}
			}
			if key.Secret == "" && key.SecretPath != "" {
				cfg.Visa.VerifyingKeys[i].Secret, err = readSecretFromFile(key.SecretPath)
				if err != nil {
					return err
				}
			}
		}
	}

	return nil
}

func (cfg *Config) PopulateFromEnv() {
	if cfg.Mastercard.ConsumerKey == "" {
		cfg.Mastercard.ConsumerKey = os.Getenv("MASTERCARD_CONSUMER_KEY")
	}
	if cfg.Mastercard.ServiceID == "" {
		cfg.Mastercard.ServiceID = os.Getenv("MASTERCARD_SERVICE_ID")
	}
	if cfg.Mastercard.ClientID == "" {
		cfg.Mastercard.ClientID = os.Getenv("MASTERCARD_CLIENT_ID")
	}
	if cfg.InternalAPI.SharedKey.SharedKey == "" {
		cfg.InternalAPI.SharedKey.SharedKey = os.Getenv("DUCKGO_INTERNAL_API_SHARED_KEY")
	}
	if cfg.ExternalAPI.SharedKey.SharedKey == "" {
		cfg.ExternalAPI.SharedKey.SharedKey = os.Getenv("DUCKGO_EXTERNAL_API_SHARED_KEY")
	}
	if cfg.ExternalAPI.TVM.TVMToolURL == "" {
		cfg.ExternalAPI.TVM.TVMToolURL = os.Getenv("TVMTOOL_URL")
	}
	if cfg.ExternalAPI.TVM.AuthToken == "" {
		cfg.ExternalAPI.TVM.AuthToken = os.Getenv("TVMTOOL_LOCAL_AUTHTOKEN")
	}
	if cfg.Visa.IsEnabled {
		if cfg.Visa.SigningKey.Secret == "" {
			cfg.Visa.SigningKey.Secret = os.Getenv("VISA_SIGNING_KEY_SECRET")
		}
		if cfg.Visa.SigningKey.KeyID == "" {
			cfg.Visa.SigningKey.KeyID = os.Getenv("VISA_SIGNING_KEY_ID")
		}
		if cfg.Visa.EncryptionKey.Secret == "" {
			cfg.Visa.EncryptionKey.Secret = os.Getenv("VISA_ENCRYPTION_KEY_SECRET")
		}
		if cfg.Visa.EncryptionKey.KeyID == "" {
			cfg.Visa.EncryptionKey.KeyID = os.Getenv("VISA_ENCRYPTION_KEY_ID")
		}
		if len(cfg.Visa.VerifyingKeys) == 0 {
			cfg.Visa.VerifyingKeys = []ConfigNamedSharedKey{
				{
					KeyID:  os.Getenv("VISA_VERIFYING_KEY_ID"),
					Secret: os.Getenv("VISA_VERIFYING_KEY_SECRET"),
				},
			}
		}
	}
}

func readSecretFromFile(path string) (string, error) {
	buf, err := ioutil.ReadFile(path)
	if err != nil {
		return "", err
	}

	return strings.TrimSpace(string(buf)), nil
}
