#!/bin/sh

#
# Script for cleanup node_modules dir
#

NPM_CLEANUP_FILES="
Makefile
"

for file in $NPM_CLEANUP_FILES ; do
    find ./node_modules -type f -name "$file" -exec rm {} \;
done
