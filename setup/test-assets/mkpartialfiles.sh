#!/bin/bash

dd if=phonepic-large.png of=phonepic-large.png.part bs=1024 count=250
dd if=phonepic-large.png of=phonepic-large.png.inprogress bs=1024 count=200 skip=250

