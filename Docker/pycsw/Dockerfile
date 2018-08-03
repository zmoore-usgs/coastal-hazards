FROM python:2.7-stretch

LABEL maintainer="gs-w_eto_eb_federal_employees@usgs.gov"

ENV PYCSW_VERSION="1.10.0"
ENV PYCSW_PORT=8000

<<<<<<< HEAD
RUN apt-get update && \
	apt-get install -y git libgeos-c1v5 gettext postgresql-client
=======
ARG doi_network=false
>>>>>>> ea77b99b2b015e58daecba32380b410e58a6f505

RUN if [ "${doi_network}" = true ]; then \
		mkdir -p /usr/lib/ssl/certs/ && \
		/usr/bin/wget -O /usr/lib/ssl/certs/DOIRootCA.crt http://sslhelp.doi.net/docs/DOIRootCA2.cer && \
		ln -sf /usr/lib/ssl/certs/DOIRootCA.crt /usr/lib/ssl/certs/`openssl x509 -hash -noout -in /usr/lib/ssl/certs/DOIRootCA.crt`.0 && \
		echo "\\n\\nca-certificate = /usr/lib/ssl/certs/DOIRootCA.crt" >> /etc/wgetrc; \
	fi

RUN apt-get update && \
	apt-get install -y \
	git \
	libgeos-c1v5 \
	gettext \
	postgresql-client && \
	rm -rf /var/lib/apt/lists/* && \
	apt-get clean

RUN git clone https://github.com/geopython/pycsw.git

WORKDIR pycsw

RUN git checkout ${PYCSW_VERSION}

RUN pip install --trusted-host pypi.python.org -e . && \
	pip install --trusted-host pypi.python.org -r requirements.txt && \
	pip install --trusted-host pypi.python.org -r requirements-standalone.txt

COPY run.sh run.sh
RUN chmod +x run.sh

CMD ./run.sh

HEALTHCHECK --interval=2s --timeout=3s \
 CMD sleep 1 | \
 		curl -s "localhost:8000/csw/" | grep -q "pycsw ${PYCSW_VERSION}" || exit 1
