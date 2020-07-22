rm -rf ./ssl.crt
rm -rf ./ssl.key
keytool -genkey -keyalg RSA -noprompt -alias tomcat -dname "CN=localhost, OU=NA, O=NA, L=NA, S=NA, C=NA" -keystore keystore.jks -validity 9999 -storepass changeit -keypass changeit
keytool -importkeystore -srckeystore keystore.jks -srcstorepass changeit -srckeypass changeit -srcalias tomcat -destalias tomcat -destkeystore keystore.p12 -deststoretype PKCS12 -deststorepass changeit -destkeypass changeit
openssl pkcs12 -in keystore.p12 -passin pass:"changeit" -nodes -nocerts -out ssl.key
openssl pkcs12 -in keystore.p12 -passin pass:"changeit" -nokeys -out ssl.crt
rm -rf ./keystore.jks
rm -rf ./keystore.p12
cp ./ssl.crt ./trust_certs/ssl.crt