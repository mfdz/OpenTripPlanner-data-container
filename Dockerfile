FROM       node:10-alpine
MAINTAINER Digitransit version: 0.1

RUN apk add --update --no-cache \
  bash \
  curl \
  git \
  python3 \
  py-pip \
  && rm -rf /var/cache/apk/*

WORKDIR /opt/otp-data-builder

ADD https://download.docker.com/linux/static/stable/x86_64/docker-18.06.1-ce.tgz /opt/otp-data-builder
RUN cd /opt/otp-data-builder ; tar xzf docker-18.06.1-ce.tgz ; cp docker/docker /usr/bin/docker ; rm -rf docker*

ADD package-lock.json package.json *.js *.sh  gulpfile.js /opt/otp-data-builder/

ADD task /opt/otp-data-builder/task
# To run the Herrenberg configuration we don't need all the other configs.
#ADD router-finland /opt/otp-data-builder/router-finland
#ADD router-hsl /opt/otp-data-builder/router-hsl
#ADD router-waltti /opt/otp-data-builder/router-waltti
ADD router-hb /opt/otp-data-builder/router-hb
ADD otp-data-container /opt/otp-data-builder/otp-data-container

RUN npm install

# Clone the layer generator repo and install requirements.
RUN git clone https://github.com/mfdz/digitransit-overpass-layers.git
RUN pip3 install --upgrade pip
RUN pip3 install -r digitransit-overpass-layers/requirements.txt

CMD ENV_ICONSRC="digitransit-overpass-layers/layer-icons/" python3 digitransit-overpass-layers/generate-hb-layers.py ;  bash ./run-builder.sh
