#!/bin/bash

PGPASSWORD="${POSTGRES_PASSWORD}" psql -v ON_ERROR_STOP=1 --dbname "${POSTGRES_DB}" --username "${POSTGRES_USER}"  <<-EOSQL
	CREATE OR REPLACE LANGUAGE plpythonu;
EOSQL

cd /liquibase/coastal-hazards-liquibase/src/main/liquibase

echo "Initializing database schema..."
$LIQUIBASE_HOME/liquibase --defaultsFile="${LIQUIBASE_HOME}/liquibase.properties" update

if [ "${BOOTSTRAP_PROFILE}" = "true" ]; then
	echo "Running Bootstrap..."
	/liquibase_bootstrap.sh
fi

if [ "${LOAD_DATA_PROFILE}" = "true" ]; then
	echo "Loading Test Data..."
	/liquibase_load_test_data.sh
fi
