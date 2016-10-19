FROM rserve:latest

MAINTAINER Jordan Walker <jiwalker@usgs.gov>

USER root

ARG doi_network=false

RUN if [ "${doi_network}" = true ]; then \
		/usr/bin/wget -O /usr/lib/ssl/certs/DOIRootCA.crt http://blockpage.doi.gov/images/DOIRootCA.crt && \
		ln -sf /usr/lib/ssl/certs/DOIRootCA.crt /usr/lib/ssl/certs/`openssl x509 -hash -noout -in /usr/lib/ssl/certs/DOIRootCA.crt`.0; \
	fi

# Docker image r-base has moved to Debian Testing. Need to add Jessie repos
# in order to get older versions of lib* packages 
RUN echo "deb http://httpredir.debian.org/debian jessie main" >> /etc/apt/sources.list
RUN echo "deb-src http://httpredir.debian.org/debian jessie main" >> /etc/apt/sources.list
RUN echo "deb http://httpredir.debian.org/debian jessie-updates main" >> /etc/apt/sources.list
RUN echo "deb-src http://httpredir.debian.org/debian jessie-updates main" >> /etc/apt/sources.list
RUN echo "deb http://security.debian.org/ jessie/updates main" >> /etc/apt/sources.list
RUN echo "deb-src http://security.debian.org/ jessie/updates main" >> /etc/apt/sources.list

# Debian is rolling update versions for these libraries. If library not found, run last known
# built container via `/bin/bash` and check using `apt-cache madison <package-name>`
# Example:
# $ apt-cache madison libcurl3
#  libcurl3 |   7.50.1-1 | http://httpredir.debian.org/debian testing/main amd64 Packages
#  libcurl3 |   7.50.1-1 | http://http.debian.net/debian sid/main amd64 Packages
#  libcurl3 | 7.38.0-4+deb8u4 | http://httpredir.debian.org/debian jessie/main amd64 Packages
#  libcurl3 | 7.38.0-4+deb8u4 | http://security.debian.org jessie/updates/main amd64 Packages
#      curl | 7.38.0-4+deb8u4 | http://httpredir.debian.org/debian jessie/main Sources
#      curl | 7.38.0-4+deb8u4 | http://security.debian.org jessie/updates/main Sources
RUN apt-get update && \
	apt-get install -y --allow-downgrades --allow-remove-essential --allow-change-held-packages \
	git \
	libssl1.0.0=1.0.1t-1+deb8u5 \
	libssl-dev \
	libcurl3=7.38.0-4+deb8u4 \
	libcurl3-gnutls=7.38.0-4+deb8u4 \
	libcurl4-openssl-dev=7.38.0-4+deb8u4 \
	libxml2-dev
 
RUN install.r devtools && R -e 'library(devtools); install_github("USGS-R/hazarditems");'

USER rserve
