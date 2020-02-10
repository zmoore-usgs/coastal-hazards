#!/bin/sh

# Waits until the keycloak server is fully up and running and then uses the CLI to import the CCH realm
cd ~/keycloak/bin
until curl "keycloak:8083" | grep -q "html"; do sleep 4; done
./kcadm.sh config credentials --server http://keycloak:8083/auth --realm master --user admin --password admin
./kcadm.sh create realms --server http://keycloak:8083/auth -f /tmp/cch_realm.json