#!/bin/bash
# make の略（超短いコマンド）
case "$1" in
    "") echo "使い方: ./m [機能名]" ;;
    *) ./auto "$@" ;;
esac
