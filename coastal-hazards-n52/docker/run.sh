# Restore config from original so replacement keywords are restored
rm /wps_config.xml
cp /wps_config-original.xml /wps_config.xml

# Replace Config File Strings
sed -i -e "s/%RSERVE_PASSWORD%/${RSERVE_PASSWORD}/g" /wps_config.xml
sed -i -e "s/%RSERVE_HOST%/${RSERVE_HOST}/g" /wps_config.xml

# Start Tomcat
catalina.sh run