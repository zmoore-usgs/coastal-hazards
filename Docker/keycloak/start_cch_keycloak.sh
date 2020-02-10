#!/bin/sh

# Executed on JBoss startup, starts the load_cch_realm script in the background
/tmp/load_cch_realm.sh & 
echo Done