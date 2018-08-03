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
  echo "Failed to connect to PostgreSQL db on (host:port): $POSTGRES_HOST:5432"
  exit 1
else
  echo "Postgres is up - continuing setup";

  # Setup the database using the admin config file
  python bin/pycsw-admin.py -c setup_db -f default.cfg;

  python csw.wsgi $PYCSW_PORT;
fi;
