#########################################
# Проверяем наличие yav
#########################################

if ! command -v yav &> /dev/null
then
  echo "Install yav tool before. See https://vault-api.passport.yandex.net/docs/"
  return
fi


#########################################
# Создаем TVM конфиг
#########################################
TVM_SECRET_VER=ver-01ew2r4tk3yf27xa9cxqsyevdf
TVM_SECRET_NAME=client_secret

echo "Getting tvm token..."
TVM_SECRET=$(yav get version ${TVM_SECRET_VER} -o ${TVM_SECRET_NAME})

echo "Creating tvm dev config..."
cat <<EOF > ../../server/.tvm.json
{
  "clients": {
    "pay-front": {
      "secret": "$TVM_SECRET",
      "self_tvm_id": 2025712,
      "dsts": {
        "blackbox": {
          "dst_id": 224
        },
        "addrs": {
          "dst_id": 2008261
        }
      }
    }
  }
}
EOF


#########################################
# Создаем CSRF конфиг
#########################################
CSRF_SECRET_VER=ver-01esww4newk64d6qrj66nrbe1h
CSRF_SECRET_NAME=key

echo "Getting csrf token..."
CSRF_SECRET=$(yav get version ${CSRF_SECRET_VER} -o ${CSRF_SECRET_NAME})

echo "Creating local-env config..."
cat <<EOF > ../../server/.env
CSRF_KEY="$CSRF_SECRET"
EOF

