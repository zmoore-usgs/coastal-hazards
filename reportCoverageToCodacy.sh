if [ -n "$CODACY_API_TOKEN" ]
then
	if [ -n "$CODACY_PROJECT_TOKEN" ]
	then
		sudo apt-get install jq
		mkdir -p ~/codacy
		if [ ! -f ~/codacy/coverage-reporter-assembly-latest.jar ]
		then
			wget -O ~/codacy/coverage-reporter-assembly-latest.jar $(curl https://api.github.com/repos/codacy/codacy-coverage-reporter/releases/latest | jq -r .assets[0].browser_download_url)
		fi
		find -iname 'jacoco.xml' -exec java -jar ~/codacy/coverage-reporter-assembly-latest.jar report -l Java -r {} --partial \;
		java -jar ~/codacy/coverage-reporter-assembly-latest.jar final
	else
		echo "Skipping coverage reporting -- No codacy project token."
	fi
else
	echo "Skipping coverage reporting -- No codacy API token."
fi
