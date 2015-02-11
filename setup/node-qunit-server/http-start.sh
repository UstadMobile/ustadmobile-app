#!/bin/bash
http-server ../test-assets/ -p 8621 &
echo $! > ./http-server.pid

