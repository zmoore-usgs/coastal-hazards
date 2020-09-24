#!/usr/bin/env bash

# Replace placeholders in wps_config.xml with ENVs
echo "Replacing placeholers in ${CCH_WPS_CONFIG_LOCATION} with ENVs"
sed -e "s/%%CCH_WPS_RSERVE_HOST%%/${CCH_WPS_RSERVE_HOST}/" \
    -e "s/%%CCH_WPS_RSERVE_PORT%%/${CCH_WPS_RSERVE_PORT}/" \
    -e "s/%%CCH_WPS_RSERVE_USER%%/${CCH_WPS_RSERVE_USER}/" \
    -e "s/%%CCH_WPS_RSERVE_PASSWORD%%/${CCH_WPS_RSERVE_PASSWORD}/" \
    "${CCH_WPS_CONFIG_LOCATION}" > /temp.xml

mv /temp.xml "${CCH_WPS_CONFIG_LOCATION}"

exit 0