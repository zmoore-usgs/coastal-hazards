#!/bin/bash

# Add any trust certs to R CA Stores
if [ -n "${CERT_IMPORT_DIRECTORY}" ] && [ -d "${CERT_IMPORT_DIRECTORY}" ]; then
  # Add cert files to trust store
  for c in "$CERT_IMPORT_DIRECTORY"/*.crt; do
    FILENAME="${c}"

    # Add to /usr/lib/ssl/certs/
    cp $FILENAME "/usr/lib/ssl/certs/`basename $FILENAME`"
    ln -sf "/usr/lib/ssl/certs/`basename $FILENAME`" /usr/lib/ssl/certs/`openssl x509 -hash -noout -in $FILENAME`.0
    
    echo "Added $FILENAME to '/usr/lib/ssl/certs'"
  done

else
  echo "WARNING: Cert import directory not found at '$CERT_IMPORT_DIRECTORY'. No additional certs will be imported into R."
fi

# Launch RServe With Hazard Items
R -e "library(Rserve);library(hazardItems);setBaseURL('https://${PORTAL_INTERNAL_HOST}:${PORTAL_INTERNAL_HTTPS_PORT}/coastal-hazards-portal/');run.Rserve(config.file=\"/rserve.conf\")";
