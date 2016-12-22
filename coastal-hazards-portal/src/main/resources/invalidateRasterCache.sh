#!/bin/bash
set -e
CCH_BASE_URL="${1}" #CCH base url without the trailing slash. Ex: https://cida-test.er.usgs.gov/dev/coastalchangehazardsportal
BEARER_ID=${2} #The bearer token from a logged-in session. Ex: e20a4c07-84ac-4a57-90f2-15bda6e8c318

#./seedAllRasters.sh https://cida-test.er.usgs.gov/dev/coastalchangehazardsportal e20a4c07-84ac-4a57-90f2-15bda6e8c318

curl -v -s -o /dev/null -X DELETE "${CCH_BASE_URL}/data/cache" -H "Authorization: Bearer ${BEARER_ID}"

