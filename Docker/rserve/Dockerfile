FROM rserve:latest

MAINTAINER Jordan Walker <jiwalker@usgs.gov>

USER root

ARG doi_network=false

RUN echo $doi_network

RUN if [ "${doi_network}" = true ]; then \
		/usr/bin/wget -O /usr/lib/ssl/certs/DOIRootCA.crt http://blockpage.doi.gov/images/DOIRootCA.crt && \
		ln -s /usr/lib/ssl/certs/DOIRootCA.crt /usr/lib/ssl/certs/`openssl x509 -hash -noout -in /usr/lib/ssl/certs/DOIRootCA.crt`.0; \
	fi

# Docker image r-base has moved to Debian Testing. Need to add Jessie repos
# in order to get older versions of lib* packages 
RUN echo "deb http://httpredir.debian.org/debian jessie main" >> /etc/apt/sources.list
RUN echo "deb-src http://httpredir.debian.org/debian jessie main" >> /etc/apt/sources.list
RUN echo "deb http://httpredir.debian.org/debian jessie-updates main" >> /etc/apt/sources.list
RUN echo "deb-src http://httpredir.debian.org/debian jessie-updates main" >> /etc/apt/sources.list
RUN echo "deb http://security.debian.org/ jessie/updates main" >> /etc/apt/sources.list
RUN echo "deb-src http://security.debian.org/ jessie/updates main" >> /etc/apt/sources.list

RUN apt-get update && \
	apt-get install -y --allow-downgrades --allow-remove-essential --allow-change-held-packages \
	git \
	libssl1.0.0=1.0.1k-3+deb8u5 \
	libssl-dev \
	libcurl3=7.38.0-4+deb8u3 \
	libcurl3-gnutls=7.38.0-4+deb8u3 \
	libcurl4-openssl-dev=7.38.0-4+deb8u3 \
	libxml2-dev
 
RUN install.r devtools && R -e 'library(devtools); install_github("USGS-R/hazarditems");'

USER rserve
