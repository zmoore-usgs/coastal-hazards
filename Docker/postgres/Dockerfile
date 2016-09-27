FROM camptocamp/postgis:9.5

MAINTAINER Ivan Suftin <isuftin@usgs.gov>

RUN apt-get update && \
	apt-get -y install openjdk-7-jre wget postgresql-plpython-9.5 && \
	apt-get clean

ENV LIQUIBASE_HOME "/opt/liquibase"

ENV POSTGRES_PASSWORD "postgres"

ENV POSTGRES_USER "postgres"

ENV POSTGRES_DB "public"

ENV CCH_LIQUIBASE_VERSION "1.1.18"

ENV JAVA_HOME "/usr/lib/jvm/java-7-openjdk-amd64"

RUN echo "${LIQUIBASE_HOME}"

# Set up Liquibase
RUN mkdir $LIQUIBASE_HOME
ADD https://github.com/liquibase/liquibase/releases/download/liquibase-parent-3.4.2/liquibase-3.4.2-bin.tar.gz $LIQUIBASE_HOME/liquibase.tar.gz
ADD https://jdbc.postgresql.org/download/postgresql-9.4-1204.jdbc41.jar $LIQUIBASE_HOME/lib/
RUN /bin/tar xzvf $LIQUIBASE_HOME/liquibase.tar.gz -C $LIQUIBASE_HOME && chmod +x $LIQUIBASE_HOME/liquibase

RUN	echo "driver: org.postgresql.Driver" >> $LIQUIBASE_HOME/liquibase.properties && \
	echo "url: jdbc:postgresql://127.0.0.1:5432/${POSTGRES_DB}" >> $LIQUIBASE_HOME/liquibase.properties && \
	echo "username: ${POSTGRES_USER}" >> $LIQUIBASE_HOME/liquibase.properties && \
	echo "password: ${POSTGRES_PASSWORD}" >> $LIQUIBASE_HOME/liquibase.properties && \
	echo "promptOnNonLocalDatabase: false" >> $LIQUIBASE_HOME/liquibase.properties && \
	echo "outputDefaultSchema: true" >> $LIQUIBASE_HOME/liquibase.properties

RUN cp $LIQUIBASE_HOME/liquibase.properties $LIQUIBASE_HOME/liquibase.bootstrap.properties && \
	cp $LIQUIBASE_HOME/liquibase.properties $LIQUIBASE_HOME/liquibase.loadtestdata.properties

RUN echo "changeLogFile: /liquibase/coastal-hazards-liquibase/src/main/liquibase/changeLog.xml" >> $LIQUIBASE_HOME/liquibase.properties && \
	echo "contexts: default" >> $LIQUIBASE_HOME/liquibase.properties && \
	echo "changeLogFile: /liquibase/coastal-hazards-liquibase/src/main/liquibase/bootstrap.xml" >> $LIQUIBASE_HOME/liquibase.bootstrap.properties && \
	echo "contexts: bootstrap" >> $LIQUIBASE_HOME/liquibase.properties && \
	echo "changeLogFile: /liquibase/coastal-hazards-liquibase/src/main/liquibase/test_data.xml" >> $LIQUIBASE_HOME/liquibase.loadtestdata.properties && \
	echo "contexts: test" >> $LIQUIBASE_HOME/liquibase.properties

# Grab CCH Liquibase files
RUN mkdir /liquibase

RUN /usr/bin/wget --no-check-certificate -O /root/cch.zip "https://codeload.github.com/USGS-CIDA/coastal-hazards/tar.gz/coastal-hazards-${CCH_LIQUIBASE_VERSION}" && \
	/bin/tar xzfv /root/cch.zip --strip-components=1 -C /liquibase

RUN ln -s /liquibase/coastal-hazards-liquibase/src/main/resources/bootstrap /liquibase/coastal-hazards-liquibase/src/main/liquibase && \
	ln -s /liquibase/coastal-hazards-liquibase/src/main/resources/data /liquibase/coastal-hazards-liquibase/src/main/liquibase

# Copy in the shell scripts (default and optional files)
COPY postgres_entrypoint.sh /docker-entrypoint-initdb.d/postgres_entrypoint.sh
COPY liquibase_bootstrap.sh /liquibase_bootstrap.sh
COPY liquibase_load_test_data.sh /liquibase_load_test_data.sh

# Set executable bit
RUN chmod +x /docker-entrypoint-initdb.d/postgres_entrypoint.sh && \
	chmod +x /liquibase_bootstrap.sh && \
	chmod +x /liquibase_load_test_data.sh

HEALTHCHECK --interval=15s --timeout=3s \
	CMD /usr/lib/postgresql/9.5/bin/pg_isready -U ${POSTGRES_USER} || exit 1
