#!/bin/bash

# Report test coverage data to Codacy

#only report coverage if both API token and project token are defined
if [ -n "$CODACY_API_TOKEN" ]
then
	if [ -n "$CODACY_PROJECT_TOKEN" ]
	then
		mkdir -p ~/codacy
		#if a copy of the code reporter has not already been cached
		if [ ! -f ~/codacy/coverage-reporter-assembly-latest.jar ]
		then
			#install a tool for parsing a REST API response from GitHub
			sudo apt-get install jq curl
			#install the latest release from GitHub
			wget -O ~/codacy/coverage-reporter-assembly-latest.jar $(curl https://api.github.com/repos/codacy/codacy-coverage-reporter/releases/latest | jq -r .assets[0].browser_download_url)
		fi
		
		#find all coverage report files produced during the build, report them to Codacy
		#the jar implicitly looks for the API and project token env vars
		find -iname 'jacoco.xml' -exec java -jar ~/codacy/coverage-reporter-assembly-latest.jar report -l Java -r {} --partial \;
		#now that all partial coverage reports have been uploaded, tell Codacy we are done
		java -jar ~/codacy/coverage-reporter-assembly-latest.jar final
		#TODO: Eliminate the need for partial reporting by using the jacoco maven plugin's `report-aggregate` and/or `merge` goals to produce a single coverage report file. At that point it might be easier to use https://github.com/halkeye/codacy-maven-plugin than manually downloading and invoking the jar.
	else
		echo "Skipping coverage reporting -- No Codacy project token."
	fi
else
	echo "Skipping coverage reporting -- No Codacy API token."
fi
