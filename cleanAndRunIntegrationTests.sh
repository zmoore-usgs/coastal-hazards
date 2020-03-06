#!/bin/bash
sudo ./cleanIntegrationTestResults.sh
docker-compose -f docker-compose.yml -f docker-compose-it.yml up jmeter