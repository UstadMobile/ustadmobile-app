#!/bin/bash

kill $(cat http-server.pid)
rm http-server.pid

