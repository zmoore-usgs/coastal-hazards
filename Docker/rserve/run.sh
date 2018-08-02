#!/bin/bash

# Launch RServe With Hazard Items
R -e "library(Rserve);library(hazardItems);setBaseURL('https://${PORTAL_INTERNAL_HOST}:${PORTAL_INTERNAL_HTTPS_PORT}/coastal-hazards-portal/');run.Rserve(config.file=\"/rserve.conf\")";
