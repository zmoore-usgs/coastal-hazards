#!/bin/bash

# Restore config from original so replacement keywords are restored
rm /rserve.pwd
cp /rserve-original.pwd /rserve.pwd

# Replace Config File Strings
sed -i -e "s/%RSERVE_PASSWORD%/${RSERVE_PASSWORD}/g" /rserve.pwd

# Launch RServe With Hazard Items
R -e "library(Rserve);library(hazardItems);setBaseURL('${PORTAL_BASE_URL}');run.Rserve(config.file=\"/rserve.conf\")";