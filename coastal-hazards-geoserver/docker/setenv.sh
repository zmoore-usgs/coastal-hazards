export CATALINA_OPTS="$CATALINA_OPTS -DGEOSERVER_DATA_DIR=/data/geoserver"
export JAVA_OPTS="$JAVA_OPTS -XX:HeapDumpPath=/heapdumps"
export JAVA_OPTS="$JAVA_OPTS -XX:+HeapDumpOnOutOfMemoryError"
