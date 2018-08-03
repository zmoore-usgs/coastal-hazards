FROM mdillon/postgis:9.6-alpine

LABEL maintainer="gs-w_eto_eb_federal_employees@usgs.gov"

ARG PORTAL_LIQUIBASE_TAG=master
ARG doi_network=false
ARG LIQUIBASE_VERSION=3.4.1
ARG POSTGRES_JDBC_VERSION=42.2.4

ENV JAVA_HOME /usr/lib/jvm/java-1.8-openjdk
ENV PATH $PATH:$JAVA_HOME/bin
ENV POSTGRES_USER=postgres
ENV POSTGRES_DB=cchportal
ENV LIQUIBASE_HOME /opt/liquibase

RUN if [ "${doi_network}" = true ]; then \
		mkdir -p /usr/lib/ssl/certs/ && \
		/usr/bin/wget -O /usr/lib/ssl/certs/DOIRootCA.crt http://sslhelp.doi.net/docs/DOIRootCA2.cer && \
		ln -sf /usr/lib/ssl/certs/DOIRootCA.crt /usr/lib/ssl/certs/`openssl x509 -hash -noout -in /usr/lib/ssl/certs/DOIRootCA.crt`.0 && \
		echo "\\n\\nca-certificate = /usr/lib/ssl/certs/DOIRootCA.crt" >> /etc/wgetrc; \
	fi

# Required for JRE 8 - Java 8 is required to run the Liquibase JAR - lifted from https://github.com/docker-library/openjdk
RUN { \
		echo '#!/bin/sh'; \
		echo 'set -e'; \
		echo; \
		echo 'dirname "$(dirname "$(readlink -f "$(which javac || which java)")")"'; \
	} > /usr/local/bin/docker-java-home \
	&& chmod +x /usr/local/bin/docker-java-home

# Add the Alpine 3.6 repo to get access to plpython designed for postgres 9.6
RUN echo "@v3.6 http://dl-cdn.alpinelinux.org/alpine/v3.6/main/" >> /etc/apk/repositories

RUN set -x \
    && apk update && apk upgrade \
		&& apk add --no-cache python \
			python-dev \
			postgresql-plpython2@v3.6 \
			postgresql-plpython2-contrib@v3.6 \
			git \
    	curl\
    	openjdk8 \
    && [ "$JAVA_HOME" = "$(docker-java-home)" ]

RUN cp /usr/lib/postgresql/*.so /usr/local/lib/postgresql/
RUN mkdir -p $LIQUIBASE_HOME
RUN curl -Lk "https://github.com/liquibase/liquibase/releases/download/liquibase-parent-${LIQUIBASE_VERSION}/liquibase-${LIQUIBASE_VERSION}-bin.tar.gz" > liquibase-bin.tar.gz
RUN tar -xzf liquibase-bin.tar.gz -C "${LIQUIBASE_HOME}/" && \
	rm liquibase-bin.tar.gz
RUN curl -o $LIQUIBASE_HOME/lib/postgresql.jar https://jdbc.postgresql.org/download/postgresql-$POSTGRES_JDBC_VERSION.jar

RUN git clone https://github.com/USGS-CIDA/coastal-hazards.git coastal-hazards
WORKDIR coastal-hazards
RUN git checkout ${PORTAL_LIQUIBASE_TAG}
WORKDIR /

RUN cp -r /coastal-hazards/coastal-hazards-liquibase/src/main/resources/bootstrap .
COPY docker/dbInit/setup_db.sh /docker-entrypoint-initdb.d/z_setup_db.sh

RUN chmod -R 777 $LIQUIBASE_HOME

HEALTHCHECK --interval=2s --timeout=3s \
 CMD PGPASSWORD="${POSTGRES_PASSWORD}" | \
 	echo "SELECT 1+1;" | \
	psql -U "${POSTGRES_USER}" -w > /dev/null || exit 1
