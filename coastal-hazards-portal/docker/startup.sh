#!/usr/bin/env bash

# Replace placeholders in keycloak.json with ENVs
echo "Replacing placeholers in ${CCH_KEYCLOAK_CONFIG_FILE} with ENVs"
sed -e "s|%%CCH_KEYCLOAK_REALM%%|${CCH_KEYCLOAK_REALM}|" \
    -e "s|%%CCH_KEYCLOAK_AUTH_URL%%|${CCH_KEYCLOAK_AUTH_URL}|" \
    -e "s|%%CCH_KEYCLOAK_RESOURCE%%|${CCH_KEYCLOAK_RESOURCE}|" \
    -e "s|%%CCH_KEYCLOAK_PUBLIC_CLIENT%%|${CCH_KEYCLOAK_PUBLIC_CLIENT}|" \
    -e "s|%%CCH_KEYCLOAK_CONFIDENTIAL_PORT%%|${CCH_KEYCLOAK_CONFIDENTIAL_PORT}|" \
    -e "s|%%CCH_KEYCLOAK_REDIRECT_RULES%%|${CCH_KEYCLOAK_REDIRECT_RULES}|" \
    -e "s|%%CCH_KEYCLOAK_SECRET%%|${CCH_KEYCLOAK_SECRET}|" \
    "${CCH_KEYCLOAK_CONFIG_FILE}" > /temp.xml

mv /temp.xml "${CCH_KEYCLOAK_CONFIG_FILE}"

exit 0