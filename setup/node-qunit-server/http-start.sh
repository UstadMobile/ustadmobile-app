#!/bin/bash
http-server ../test-assets/ -p 6821 &
echo $! > ./http-server.pid

