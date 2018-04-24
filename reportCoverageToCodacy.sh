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
			echo "no cached coverage reporter jar found"
			#install a tool for parsing a REST API response from GitHub
			sudo apt-get install jq
			#determine URL of latest jar release
			JAR_URL="$(curl https://api.github.com/repos/codacy/codacy-coverage-reporter/releases/latest | jq -r .assets[0].browser_download_url)"
			#download the latest release from GitHub
			echo "downloading the latest release of the coverage jar from $JAR_URL"
			wget -O ~/codacy/coverage-reporter-assembly-latest.jar "$JAR_URL"
		else
			echo "using cached coverage reporter jar"
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
