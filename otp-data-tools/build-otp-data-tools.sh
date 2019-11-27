#!/bin/bash
# this script is run inside the otp-data-tools container
set +e

echo https://github.com/mfdz/onebusaway-gtfs-modules.git
git clone https://github.com/mfdz/onebusaway-gtfs-modules.git
cd onebusaway-gtfs-modules
# TODO OBA_BRANCH 
mvn package -Dmaven.test.skip=true
cd ..
# Copy oba artifacts
mkdir -p one-busaway-gtfs-merge && \
  cp onebusaway-gtfs-modules/onebusaway-gtfs-merge-cli/target/onebusaway-gtfs-merge-cli*.jar one-busaway-gtfs-merge/onebusaway-gtfs-merge-cli.jar
mkdir -p one-busaway-gtfs-transformer && \
  cp onebusaway-gtfs-modules/onebusaway-gtfs-transformer-cli/target/onebusaway-gtfs-transformer-cli*.jar one-busaway-gtfs-transformer/onebusaway-gtfs-transformer-cli.jar


git clone https://github.com/jswhit/pyproj.git
cd pyproj
git checkout ec9151e8c6909f7fac72bb2eab927ff18fa4cf1d
python setup.py build
python setup.py install
cd ..

git clone --recursive -b fastmapmatch https://github.com/HSLdevcom/gtfs_shape_mapfit.git
cd gtfs_shape_mapfit
make -C pymapmatch
cd ..

git clone https://github.com/HSLdevcom/OTPQA.git

