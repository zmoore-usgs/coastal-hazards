FROM mdillon/postgis:9.6-alpine

ARG PORTAL_LIQUIBASE_TAG=master

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
ENV JAVA_HOME /usr/lib/jvm/java-1.8-openjdk
ENV PATH $PATH:$JAVA_HOME/bin

# Add the Alpine 3.6 repo to get access to plpython designed for postgres 9.6
RUN echo "@v3.6 http://dl-cdn.alpinelinux.org/alpine/v3.6/main/" >> /etc/apk/repositories

RUN set -x \
    && apk update && apk upgrade \
	&& apk add --no-cache python \
	&& apk add --no-cache python-dev \
	&& apk add --no-cache postgresql-plpython2@v3.6 \
	&& apk add --no-cache postgresql-plpython2-contrib@v3.6 \
	&& apk add --no-cache git \
    && apk add --no-cache bash \
    && apk add --no-cache curl\
    && apk add --no-cache openjdk8 \
    && [ "$JAVA_HOME" = "$(docker-java-home)" ]

# Copy plpython libs to the mdillion/postgis image postgres lib directory
RUN cp /usr/lib/postgresql/*.so /usr/local/lib/postgresql/

# Because of this change in the upstream Postgres image: https://github.com/docker-library/postgres/pull/440/files
# During the init phase, postgres is only listening on local socket.
# That’s why psql works and liquibase, which requires tcp/ip, does not.
RUN sed -i -e "s/listen_addresses=''/listen_addresses='localhost'/g" /usr/local/bin/docker-entrypoint.sh

ENV POSTGRES_USER=postgres
ENV POSTGRES_DB=cchportal

# Install Liquibase

ENV LIQUIBASE_HOME /opt/liquibase
ENV LIQUIBASE_VERSION 3.4.1
ENV POSTGRES_JDBC_VERSION 42.1.4

RUN mkdir -p $LIQUIBASE_HOME
RUN curl -Lk https://github.com/liquibase/liquibase/releases/download/liquibase-parent-$LIQUIBASE_VERSION/liquibase-$LIQUIBASE_VERSION-bin.tar.gz > liquibase-bin.tar.gz
RUN tar -xzf liquibase-bin.tar.gz -C $LIQUIBASE_HOME/

RUN curl -o $LIQUIBASE_HOME/lib/postgresql-$POSTGRES_JDBC_VERSION.jar https://jdbc.postgresql.org/download/postgresql-$POSTGRES_JDBC_VERSION.jar

RUN ls ${LIQUIBASE_HOME}/lib/

# Pull CCH Liquibase

###############
#  Git Build
###############

#RUN git clone https://github.com/USGS-CIDA/coastal-hazards.git
#WORKDIR coastal-hazards
#RUN git checkout ${PORTAL_LIQUIBASE_TAG}
#WORKDIR /

###############
# End Git Build
###############

#################
#  Local Build
#################

RUN mkdir -p /coastal-hazards/coastal-hazards-liquibase/
COPY src /coastal-hazards/coastal-hazards-liquibase/src

#################
# End Local Build
#################

RUN cp -r /coastal-hazards/coastal-hazards-liquibase/src/main/resources/bootstrap .

# Grab DB Setup Script

COPY docker/dbInit/setup_db.sh /docker-entrypoint-initdb.d/z_setup_db.sh

EXPOSE 5432

RUN chmod -R 777 $LIQUIBASE_HOME
