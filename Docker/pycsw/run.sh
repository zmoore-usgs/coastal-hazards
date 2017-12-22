#!/bin/sh

# Wait until the PyCSW PostgreSQL user is available or we time out
WAIT_ITERATION=0
MAX_WAIT_ITERATIONS=36

until  ( ( PGPASSWORD=${POSTGRES_PASSWORD} psql -U postgres -h ${POSTGRES_HOST} --quiet -tAc "SELECT 1 FROM pg_roles WHERE rolname='pycsw'" | grep -q 1 ) || [ $WAIT_ITERATION -eq $MAX_WAIT_ITERATIONS ] ) ; do
  WAIT_ITERATION=$(($WAIT_ITERATION+1));
  echo "Postgres is unavailable - retrying (${WAIT_ITERATION}/${MAX_WAIT_ITERATIONS})"
  sleep 5
done

if (  [ $WAIT_ITERATION -eq $MAX_WAIT_ITERATIONS ] ); then
echo "Failed to connect to PostgreSQL db on (host:port): $POSTGRES_HOST:5432";

else
echo "Postgres is up - continuing setup";

# Restore config from original so replacement keywords are restored
rm default.cfg
cp default-original.cfg default.cfg

# Replace replacement keywords in the default config file
sed -i -e "s/%POSTGRES_USER%/pycsw/g" default.cfg
sed -i -e "s/%POSTGRES_PASSWORD%/${POSTGRES_PYCSW_PASSWORD}/g" default.cfg
sed -i -e "s/%POSTGRES_HOST%/${POSTGRES_HOST}/g" default.cfg

# Setup the database using the admin config file
python bin/pycsw-admin.py -c setup_db -f default.cfg;

python csw.wsgi;

fi;