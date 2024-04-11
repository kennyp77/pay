package main

import (
	"crypto/ecdsa"
	"crypto/x509"
	"encoding/json"
	"encoding/pem"
	"flag"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"os"
	"reflect"
	"strconv"
	"time"

	"a.yandex-team.ru/pay/duckgo/paymenttoken"
)

func ensure(err error) {
	if err != nil {
		log.Fatal(err)
	}
}

func main() {
	inputFileName := flag.String("input", "intermediate.json", "path to intermediate.json")
	outputFileName := flag.String("output", "intermediate.json.signed", "path to result signed intermediate.json")
	flag.Parse()

	log.Println("loading", *inputFileName)
	data, err := ioutil.ReadFile(*inputFileName)
	ensure(err)

	signedKey := new(paymenttoken.SignedKey)
	err = json.Unmarshal(data, &signedKey)
	ensure(err)

	ts, err := strconv.ParseInt(signedKey.KeyExpiration, 10, 64)
	ensure(err)
	expirationTime := time.Unix(0, ts*int64(time.Millisecond))

	keys, err := loadSigningKeys(os.Stdin)
	ensure(err)

	log.Println("signing")
	cerFactory, err := paymenttoken.NewIntermediateSigningCertFactory(
		keys,
		paymenttoken.ProtocolVersionECv2,
		paymenttoken.Yandex,
		signedKey.KeyValue,
		expirationTime)
	ensure(err)

	cert, err := cerFactory.CreateIntermediateSigningCert()
	ensure(err)

	result, err := json.Marshal(cert)
	ensure(err)

	err = ioutil.WriteFile(*outputFileName, result, 0644)
	ensure(err)
}

func loadSigningKeys(reader io.Reader) ([]*ecdsa.PrivateKey, error) {
	keysData, err := ioutil.ReadAll(io.LimitReader(reader, 1024*1024))
	ensure(err)

	var keys []*ecdsa.PrivateKey
	for {
		block, rest := pem.Decode(keysData)
		parsedKey, err := x509.ParsePKCS8PrivateKey(block.Bytes)
		ensure(err)

		key, ok := parsedKey.(*ecdsa.PrivateKey)
		if !ok {
			ensure(fmt.Errorf("paymenttoken: unexpected privatekey type: %s", reflect.TypeOf(key)))
		}

		keys = append(keys, key)

		if len(rest) == 0 {
			break
		}
	}

	return keys, nil
}
