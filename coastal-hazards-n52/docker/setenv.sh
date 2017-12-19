export CATALINA_OPTS="$CATALINA_OPTS -Dcch_fetch_and_unzip_token=${FETCH_AND_UNZIP_TOKEN}"

export JAVA_OPTS="$JAVA_OPTS -Djavax.net.ssl.trustStore=/usr/local/tomcat/ssl/trust-store.jks" 
export JAVA_OPTS="$JAVA_OPTS -Djavax.net.ssl.trustStorePassword=${TRUST_STORE_PASSWORD}"