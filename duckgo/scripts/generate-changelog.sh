#! /bin/bash

NEW_VERSION=$1

[ -z "$NEW_VERSION" ] && echo "Need to provide NEW_VERSION" && exit 1;

# Extract info from arc
AUTHOR_NAME=`arc info --json | jq -r .author`
AUTHOR_EMAIL="$AUTHOR_NAME@yandex-team.ru"
DATE=`date -R`

SOURCE=`grep Source debian/control | cut -f2 -d' '`
PREV_TAG=$(arc describe --match 'tags/releases/pay/duckgo/*' | sed -E 's/(.*v[0-9\.]+)\-.*$/\1/')
CURRENT_TAG="tags/releases/pay/duckgo/v$VERSION"


echo "$SOURCE ($NEW_VERSION) unstable; urgency=low"
echo
echo "   See arc diff $PREV_TAG $CURRENT_TAG for full log"

echo " -- "$AUTHOR_NAME "<"$AUTHOR_EMAIL">  "$DATE
