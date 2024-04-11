function copy-ssl {
  if [[ $1 =~ ^-----BEGIN ]]; then
    echo "$1" > $2
  else
    echo "$1" | base64 --decode > $2
  fi
}
