FROM r-base:3.3.3

ARG doi_network=false

# Excluding certain packages
RUN for package in r-base-core r-cran-boot r-cran-class \
	r-cran-cluster r-cran-codetools r-cran-foreign r-cran-kernsmooth \
	r-cran-lattice r-cran-mass r-cran-matrix r-cran-mgcv r-cran-nlme r-cran-nnet \
	r-cran-rpart r-cran-spatial r-cran-survival r-cran-littler r-base-dev; do \
		echo "${package} hold" | dpkg --set-selections; \
	done

RUN if [ "${doi_network}" = true ]; then \
		/usr/bin/wget -O /usr/lib/ssl/certs/DOIRootCA.crt http://sslhelp.doi.net/docs/DOIRootCA2.cer && \
		ln -sf /usr/lib/ssl/certs/DOIRootCA.crt /usr/lib/ssl/certs/`openssl x509 -hash -noout -in /usr/lib/ssl/certs/DOIRootCA.crt`.0; \
	fi

COPY rserve.conf rserve.conf
COPY rserve.pwd rserve.pwd
COPY rserve.pwd rserve-original.pwd
COPY profile.conf profile.conf
COPY run.sh run.sh

RUN apt-get update && \
  apt-get install -y --allow-downgrades --allow-remove-essential \
    telnet \
    libcurl3 \
    libgdal-dev \
    libxml2-dev \
    libssl-dev \
    git \
    p7zip-full && \
apt-get clean
RUN mkdir work
RUN R -e "install.packages('devtools');library(devtools);install.packages(c('Rserve','RCurl','XML'));install_github('USGS-R/hazardItems');"

EXPOSE 6311

ENTRYPOINT [ "sh", "-c", "sh run.sh" ]
