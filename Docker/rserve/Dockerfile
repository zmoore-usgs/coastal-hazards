FROM rocker/r-base

ARG doi_network=false

RUN if [ "${doi_network}" = true ]; then \
		/usr/bin/wget -O /usr/lib/ssl/certs/DOIRootCA.crt http://sslhelp.doi.net/docs/DOIRootCA2.cer && \
		ln -sf /usr/lib/ssl/certs/DOIRootCA.crt /usr/lib/ssl/certs/`openssl x509 -hash -noout -in /usr/lib/ssl/certs/DOIRootCA.crt`.0; \
	fi

COPY rserve.conf rserve.conf
COPY rserve.pwd rserve.pwd
COPY rserve.pwd rserve-original.pwd
COPY profile.conf profile.conf
COPY run.sh run.sh

RUN apt-get update
RUN apt-get install -y libcurl4-openssl-dev
RUN apt-get install -y libssl-dev
RUN apt-get install -y libxml2-dev
RUN mkdir work
RUN R -e "install.packages('devtools');library(devtools);install.packages(c('Rserve','RCurl','XML'));install_github('USGS-R/hazardItems');"

EXPOSE 6311

ENTRYPOINT [ "sh", "-c", "sh run.sh" ]