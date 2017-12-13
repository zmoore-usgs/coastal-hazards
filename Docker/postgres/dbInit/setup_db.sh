#!/bin/bash 
# create users, setup pycsw database, change ownership and privileges
psql -v ON_ERROR_STOP=1 --dbname "postgres" --username "${POSTGRES_USER}" --password "${POSTGRES_PASSWORD}"  <<-EOSQL
	CREATE OR REPLACE LANGUAGE plpythonu;
    CREATE DATABASE pycsw;
	CREATE USER cchportal WITH PASSWORD '${CCH_POSTGRES_PASSWORD}';
	CREATE USER pycsw WITH PASSWORD '${PYCSW_POSTGRES_PASSWORD}';
    ALTER DATABASE ${POSTGRES_DB} OWNER TO cchportal;
    ALTER DATABASE ${PYCSW_DB} OWNER TO pycsw;
	GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB} TO cchportal;
	GRANT ALL PRIVILEGES ON DATABASE ${PYCSW_DB} TO pycsw;
EOSQL

# do base database update
${LIQUIBASE_HOME}/liquibase \
--classpath="${LIQUIBASE_HOME}/lib/postgresql-${POSTGRES_JDBC_VERSION}.jar" \
--changeLogFile=coastal-hazards/coastal-hazards-liquibase/src/main/liquibase/changeLog.xml \
--username=cchportal \
--password=${CCH_POSTGRES_PASSWORD} \
--driver=org.postgresql.Driver \
--url=jdbc:postgresql://127.0.0.1:5432/${POSTGRES_DB} \
--logLevel=warning \
update \
> ${LIQUIBASE_HOME}/liquibase-cch.log

# do bootstrap data load
if [ "${CCH_LOAD_BOOTSTRAP}" = true ]; then \
${LIQUIBASE_HOME}/liquibase \
--classpath="${LIQUIBASE_HOME}/lib/postgresql-${POSTGRES_JDBC_VERSION}.jar" \
--changeLogFile=coastal-hazards/coastal-hazards-liquibase/src/main/liquibase/bootstrap.xml \
--username=cchportal \
--password=${CCH_POSTGRES_PASSWORD} \
--driver=org.postgresql.Driver \
--url=jdbc:postgresql://127.0.0.1:5432/${POSTGRES_DB} \
--logLevel=warning \
update \
> ${LIQUIBASE_HOME}/liquibase-cch-bootstrap.log; \
fi
