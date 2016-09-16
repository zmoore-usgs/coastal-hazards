FROM python:2

MAINTAINER Ivan Suftin <isuftin@usgs.gov>

ARG doi_network=false

ARG PYCSW_VERSION="1.6.0"

ENV POSTGRES_PASSWORD "postgres"

ENV POSTGRES_USER "postgres"

ENV POSTGRES_DB "public"

RUN apt-get update && \
	apt-get install -y git libgeos-c1 gettext

RUN if [ "${doi_network}" = true ]; then \
		/usr/bin/wget -O /usr/lib/ssl/certs/DOIRootCA.crt http://blockpage.doi.gov/images/DOIRootCA.crt && \
		ln -sf /usr/lib/ssl/certs/DOIRootCA.crt /usr/lib/ssl/certs/`openssl x509 -hash -noout -in /usr/lib/ssl/certs/DOIRootCA.crt`.0 && \
		git config --global http.sslCAInfo /usr/lib/ssl/certs/DOIRootCA.crt; \
	fi

RUN git clone https://github.com/geopython/pycsw.git

WORKDIR pycsw

RUN git checkout ${PYCSW_VERSION}

RUN pip install --trusted-host pypi.python.org -e . && pip install --trusted-host pypi.python.org -r requirements.txt

COPY default.cfg ./default.cfg

COPY run.sh ./run.sh

RUN chmod u+x run.sh

EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=3s \
	CMD curl -f http://localhost:8000/csw?service=CSW&request=GetCapabilities || exit 1

CMD [ "/bin/sh", "run.sh" ]