#!/usr/bin/env bash

TOMCAT_CERT_PATH="$SSL_CERT_DIR/$TOMCAT_CERT_FILE"
TOMCAT_KEY_PATH="$SSL_CERT_DIR/$TOMCAT_KEY_FILE"
TOMCAT_CHAIN_PATH="$SSL_CERT_DIR/$TOMCAT_CHAIN_FILE"

# Because I am not the root user, I cannot write to the system java keystore.
# Therefore I copy the Java keystore to a local area. The source location
# for the Java keystore is /etc/ssl/certs/java/cacerts for this image
keytool -importkeystore -srckeystore "$JAVA_HOME/lib/security/cacerts" -srcstorepass "$JAVA_TRUSTSTORE_PASS" -destkeystore "$JAVA_TRUSTSTORE" -deststorepass "$JAVA_TRUSTSTORE_PASS" -deststoretype jks

if [ -n "${TOMCAT_CERT_PATH}" ] && [ -n "${TOMCAT_KEY_PATH}" ] && [ -f "${TOMCAT_CERT_PATH}" ] && [ -f "${TOMCAT_KEY_PATH}" ]; then
  echo "Found Tomcat cert and key. Building keystore."

  # If the previous keystore location exists, remove it as I will create a new file there
  if [ -f "$JAVA_KEYSTORE" ]; then
    rm "$JAVA_KEYSTORE"
  fi

  # Build PEM file
  cat "${TOMCAT_KEY_PATH}" >"$JAVA_SSL_DIR/tomcat.pem"
  cat "${TOMCAT_CERT_PATH}" >>"$JAVA_SSL_DIR/tomcat.pem"
  if [ -n "${TOMCAT_CHAIN_PATH}" ] && [ -f "${TOMCAT_CHAIN_PATH}" ]; then
    echo "Found intermediate cert, including in PEM creation."
    cat "${TOMCAT_CHAIN_PATH}" >>"$JAVA_SSL_DIR/tomcat.pem"
  fi

  # Import the PEM
  openssl pkcs12 -export -in "$JAVA_SSL_DIR/tomcat.pem" -inkey "$TOMCAT_KEY_PATH" -name "tomcat" -out "$JAVA_SSL_DIR/tomcat.pkcs12" -password "pass:${JAVA_KEYSTORE_PASS}"
  keytool -v -importkeystore -deststorepass "$JAVA_KEYSTORE_PASS" -destkeystore "$JAVA_KEYSTORE" -deststoretype JKS -srckeystore "$JAVA_SSL_DIR/tomcat.pkcs12" -srcstorepass "$JAVA_KEYSTORE_PASS" -srcstoretype PKCS12 -noprompt
  echo "Created: $JAVA_KEYSTORE"
else
  echo "WARNING: Tomcat SSL cert and/or key not found at '$TOMCAT_CERT_PATH' and/or '$TOMCAT_KEY_PATH'. Keystore will not be created."
fi

if [ -n "${CERT_IMPORT_DIRECTORY}" ] && [ -d "${CERT_IMPORT_DIRECTORY}" ]; then
  # Add cert files to trust store
  for c in "$CERT_IMPORT_DIRECTORY"/*.crt; do
    FILENAME="${c}"

    echo "Checking for certificate $FILENAME already existing  in Java keystore."
    if keytool -list -keystore "$JAVA_TRUSTSTORE" -alias "$FILENAME" -storepass "$JAVA_TRUSTSTORE_PASS"; then
      echo "Alias ${FILENAME} already exists in keystore. Skipping."
    else
      echo "Importing ${FILENAME}"
      keytool -importcert -noprompt -trustcacerts -file "$FILENAME" -alias "$FILENAME" -keystore "$JAVA_TRUSTSTORE" -storepass "$JAVA_TRUSTSTORE_PASS" -noprompt
    fi

  done

else
  echo "WARNING: Cert import directory not found at '$CERT_IMPORT_DIRECTORY'. No additional certs will be imported into '$JAVA_TRUSTSTORE'."
fi

# Start Tomcat
/usr/local/tomcat/bin/catalina.sh $@
