FROM mdillon/postgis:9.6-alpine

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

RUN set -x \
    && apk update && apk upgrade \
	&& apk add --no-cache git \
    && apk add --no-cache bash \
    && apk add --no-cache curl\
    && apk add --no-cache openjdk8 \
    && [ "$JAVA_HOME" = "$(docker-java-home)" ]

ENV POSTGRES_USER=postgres
ENV POSTGRES_DB=cchportal
ENV PYCSW_DB=pycsw

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

RUN git clone https://github.com/USGS-CIDA/coastal-hazards.git
WORKDIR coastal-hazards
RUN git checkout ${CCH_LIQUIBASE_VERSION}
WORKDIR /
RUN cp -r /coastal-hazards/coastal-hazards-liquibase/src/main/resources/bootstrap .

###############
# End Git Build
###############

#################
#  Local Build
#################

#ADD src coastal-hazards/coastal-hazards-liquibase/src 
#RUN cp -r /coastal-hazards/coastal-hazards-liquibase/src/main/resources/bootstrap .

#################
# End Local Build
#################

# Grab DB Setup Script

COPY ./dbInit/setup_db.sh /docker-entrypoint-initdb.d/z_setup_db.sh

EXPOSE 5432

RUN chmod -R 777 $LIQUIBASE_HOME
