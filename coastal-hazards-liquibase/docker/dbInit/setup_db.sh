#!/bin/bash 
set -e

# create pycsw DB
psql -v ON_ERROR_STOP=1 --dbname "postgres" --username "${POSTGRES_USER}" -c "CREATE DATABASE pycsw;"

# create users and change ownership and privileges
psql -v ON_ERROR_STOP=1 --dbname "postgres" --username "${POSTGRES_USER}" -c "
	CREATE USER cchportal WITH PASSWORD '${POSTGRES_CCH_PASSWORD}';
    ALTER DATABASE ${POSTGRES_DB} OWNER TO cchportal;
	GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB} TO cchportal;
"

# configure pycsw DB
psql -v ON_ERROR_STOP=1 --dbname "pycsw" --username "${POSTGRES_USER}" -c "
	CREATE OR REPLACE LANGUAGE plpythonu;
	CREATE USER pycsw WITH SUPERUSER PASSWORD '${POSTGRES_PYCSW_PASSWORD}';
	GRANT ALL PRIVILEGES ON DATABASE pycsw TO pycsw;
    ALTER DATABASE pycsw OWNER TO pycsw;
	ALTER LANGUAGE plpythonu OWNER TO pycsw;
"

# do base database update
${LIQUIBASE_HOME}/liquibase \
--classpath="${LIQUIBASE_HOME}/lib/postgresql-${POSTGRES_JDBC_VERSION}.jar" \
--changeLogFile=coastal-hazards/coastal-hazards-liquibase/src/main/liquibase/changeLog.xml \
--username=cchportal \
--password=${POSTGRES_CCH_PASSWORD} \
--driver=org.postgresql.Driver \
--url=jdbc:postgresql://127.0.0.1:5432/${POSTGRES_DB} \
--logLevel=warning \
update \
> ${LIQUIBASE_HOME}/liquibase-cch.log

# do bootstrap data load
if [ "${POSTGRES_LOAD_BOOTSTRAP}" = true ]; then \
${LIQUIBASE_HOME}/liquibase \
--classpath="${LIQUIBASE_HOME}/lib/postgresql-${POSTGRES_JDBC_VERSION}.jar" \
--changeLogFile=coastal-hazards/coastal-hazards-liquibase/src/main/liquibase/bootstrap.xml \
--username=cchportal \
--password=${POSTGRES_CCH_PASSWORD} \
--driver=org.postgresql.Driver \
--url=jdbc:postgresql://127.0.0.1:5432/${POSTGRES_DB} \
--logLevel=warning \
update \
> ${LIQUIBASE_HOME}/liquibase-cch-bootstrap.log; \
fi
