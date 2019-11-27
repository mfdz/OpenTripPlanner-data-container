FROM maven:3-jdk-8-openj9
MAINTAINER Holger Bruch MFDZ version: 0.1

RUN ln -fs /usr/share/zoneinfo/Europe/Berlin /etc/localtime && \
  apt-get update && \
  apt-get -y install \
    git build-essential python-dev protobuf-compiler libprotobuf-dev \
    make swig g++ python-dev libreadosm-dev \
    libboost-graph-dev libproj-dev libgoogle-perftools-dev \
    osmctools unzip zip python-pyproj wget python-argh \
    python-scipy python-sklearn python-pip python-numpy curl && \
  rm -rf /var/lib/apt/lists/* && \
  wget https://bootstrap.pypa.io/get-pip.py && \
    python get-pip.py && \
  pip install imposm.parser && \
  pip install argh && \
  pip install future && \
  pip install grequests && \
  pip install unicodecsv && \
  pip install cffi && \
  pip install utm

ADD build-otp-data-tools.sh ${WORK}
VOLUME /data
RUN ./build-otp-data-tools.sh && rm build-otp-data-tools.sh
