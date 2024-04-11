#!/usr/bin/env bash
set -e

pushd arcadia/pay/duckgo
dpkg-buildpackage
popd

mv arcadia/pay/yandex-duckgo_${VERSION}* .

read -p "Upload package (y/n)? " choice
case "$choice" in
    y|Y ) dupload --nomail
esac

echo "Done"
