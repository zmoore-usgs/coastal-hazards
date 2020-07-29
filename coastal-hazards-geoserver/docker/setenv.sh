# Server Config Values
export CATALINA_OPTS="$CATALINA_OPTS -DGEOSERVER_DATA_DIR=$CCH_GEOSERVER_DATA_DIR"
export CATALINA_OPTS="$CATALINA_OPTS -Xmx${CATALINA_OPTS_XMX}"
export CATALINA_OPTS="$CATALINA_OPTS -Xms${CATALINA_OPTS_XMS}"
export CATALINA_OPTS="$CATALINA_OPTS -XX:+HeapDumpOnOutOfMemoryError"
export CATALINA_OPTS="$CATALINA_OPTS -XX:+CMSClassUnloadingEnabled"
export CATALINA_OPTS="$CATALINA_OPTS -XX:HeapDumpPath=/heapdumps"
export CATALINA_OPTS="$CATALINA_OPTS -XX:SoftRefLRUPolicyMSPerMB=36000"
export CATALINA_OPTS="$CATALINA_OPTS -XX:+UseParallelGC"
export CATALINA_OPTS="$CATALINA_OPTS -Djava.awt.headless=true"
export CATALINA_OPTS="$CATALINA_OPTS -Djavax.net.ssl.trustStore=$JAVA_TRUSTSTORE -Djavax.net.ssl.trustStorePassword=$JAVA_TRUSTSTORE_PASS"
export CATALINA_OPTS="$CATALINA_OPTS -Dtomcat_keystoreLocation=$JAVA_KEYSTORE -Dtomcat_keystorePassword=$JAVA_KEYSTORE_PASS"
export JAVA_OPTS="$JAVA_OPTS -XX:HeapDumpPath=/heapdumps"
export JAVA_OPTS="$JAVA_OPTS -XX:+HeapDumpOnOutOfMemoryError"

# Context Config Values
export JAVA_OPTS="$JAVA_OPTS -Dcch_wpsFetchUnzipBaseDir='$CCH_WPS_FETCH_UNZIP_BASE_DIR'"
export JAVA_OPTS="$JAVA_OPTS -Dcch_wpsFetchUnzipToken='$CCH_WPS_FETCH_UNZIP_TOKEN'"