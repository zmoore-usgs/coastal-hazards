FROM python:2.7

ARG doi_network=false

ENV PYCSW_VERSION="1.10.0"

RUN apt-get update && \
	apt-get install -y git libgeos-c1 gettext postgresql-client

RUN if [ "${doi_network}" = true ]; then \
		mkdir -p /usr/lib/ssl/certs/ && \
		/usr/bin/wget -O /usr/lib/ssl/certs/DOIRootCA.crt http://sslhelp.doi.net/docs/DOIRootCA2.cer && \
		ln -sf /usr/lib/ssl/certs/DOIRootCA.crt /usr/lib/ssl/certs/`openssl x509 -hash -noout -in /usr/lib/ssl/certs/DOIRootCA.crt`.0 && \
		echo "\\n\\nca-certificate = /usr/lib/ssl/certs/DOIRootCA.crt" >> /etc/wgetrc; \
	fi

RUN git clone https://github.com/geopython/pycsw.git

WORKDIR pycsw

RUN git checkout ${PYCSW_VERSION}

RUN pip install --trusted-host pypi.python.org -e . && \
	pip install --trusted-host pypi.python.org -r requirements.txt && \
	pip install --trusted-host pypi.python.org -r requirements-standalone.txt

COPY run.sh ./run.sh
COPY default.cfg ./default.cfg

RUN cp default.cfg default-original.cfg

RUN chmod -R 777 run.sh

EXPOSE 8000

ENTRYPOINT ["sh", "-c", "sh run.sh"]

HEALTHCHECK --interval=60s --timeout=3s \
	CMD curl -f http://localhost:8000/csw?service=CSW&request=GetCapabilities || exit 1