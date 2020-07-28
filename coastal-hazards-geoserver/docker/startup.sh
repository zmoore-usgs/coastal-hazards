#!/usr/bin/env bash

# Manually explode GeoServer WAR
mkdir -p /usr/local/tomcat/webapps/geoserver
cd /usr/local/tomcat/webapps/geoserver
jar xvf ../geoserver.war
mv /usr/local/tomcat/webapps/geoserver.war /usr/local/tomcat/webapps/geoserver.war.old

# If GeoServer data dir exists and is empty then copy overlay data files into it
if [[ -d "$CCH_GEOSERVER_DATA_DIR" ]] && [[ -z "$(ls -A $CCH_GEOSERVER_DATA_DIR)" ]]; then
    echo "Found empty GeoServer data directory. Moving exploded GeoServer WAR overlay data."
    cp -r data/* $CCH_GEOSERVER_DATA_DIR
elif [[ ! -d "$CCH_GEOSERVER_DATA_DIR" ]]; then
    echo "GeoServer data directory '$CCH_GEOSERVER_DATA_DIR' not found! Falling back to embedded directory."
else 
    echo "Found populated GeoServer data directory. Not moving exploded WAR overlay contents."
fi

cd /

exit 0