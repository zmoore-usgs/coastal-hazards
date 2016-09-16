#!/bin/bash

if [ -z ${POSTGRES_PASSWORD} ]; then
	echo "Must provide db password \$POSTGRES_PASSWORD"
	exit 1
fi

if [ -z ${POSTGRES_USER} ]; then
	echo "Using default postgres user: postgres"
	POSTGRES_USER=postgres
fi

cat default.cfg | envsubst > tmp.xml; mv tmp.xml default.cfg

python sbin/pycsw-admin.py -c setup_db -f default.cfg

python csw.wsgi