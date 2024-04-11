#!/bin/bash

/usr/bin/supervisorctl -c /etc/supervisor/supervisord.conf status | fgrep -q "FATAL"
[[ "$?" == 0 ]] && echo "some service stopped" && exit 1

# Важно явно выйти с 0
exit 0
