#!/usr/bin/env bash
set -e

pushd arcadia/pay/duckgo
dpkg-buildpackage -uc -us
popd

mv arcadia/pay/yandex-duckgo_${VERSION}* .

apt update

REMOTE=`apt-cache show yandex-duckgo=$VERSION | grep SHA256 | head -1 | awk '{print $2}'`
LOCAL=`sha256sum yandex-duckgo_${VERSION}_amd64.deb | awk '{print $1}'`

echo
echo "Local  SHA256: $LOCAL"
echo "Remote SHA256: $REMOTE"
echo

if [ $LOCAL == $REMOTE ]; then
    echo "Success. Local and remote packages are equal."
else
    echo "FAILURE. Local and remot packages are different."
fi
