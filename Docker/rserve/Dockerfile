FROM rocker/r-ver:3.4.3

LABEL maintainer="gs-w_eto_eb_federal_employees@usgs.gov"

ARG doi_network=false

RUN if [ "${doi_network}" = true ]; then \
		/usr/bin/wget -O /usr/lib/ssl/certs/DOIRootCA.crt http://sslhelp.doi.net/docs/DOIRootCA2.cer && \
		ln -sf /usr/lib/ssl/certs/DOIRootCA.crt /usr/lib/ssl/certs/`openssl x509 -hash -noout -in /usr/lib/ssl/certs/DOIRootCA.crt`.0; \
	fi

RUN apt-get update
RUN apt-get install --no-install-recommends -y \
	telnet \
	libcurl4-openssl-dev \
	libssl1.0-dev \
	zlib1g-dev \
	libssh2-1-dev \
	libpng-dev \
	libxml2-dev && \
	rm -rf /var/lib/apt/lists/* && \
	apt-get clean

RUN mkdir work

RUN R -e "install.packages('devtools');library(devtools);install.packages(c('Rserve','RCurl','XML'));install_github('USGS-R/hazardItems');"

COPY profile.conf profile.conf
COPY rserve.conf rserve.conf
COPY rserve.pwd rserve.pwd
COPY run.sh run.sh
RUN chmod +x ./run.sh

ENV PORTAL_INTERNAL_HOST=portal
ENV PORTAL_INTERNAL_HTTPS_PORT=8443

CMD ./run.sh

HEALTHCHECK --interval=2s --timeout=3s \
 CMD sleep 1 | \
 		telnet localhost 6311 | \
		grep -q Rsrv0103QAP1 || exit 1
