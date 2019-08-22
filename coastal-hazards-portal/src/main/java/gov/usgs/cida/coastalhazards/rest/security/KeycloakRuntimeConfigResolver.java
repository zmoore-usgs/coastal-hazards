package gov.usgs.cida.coastalhazards.rest.security;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

import java.lang.IllegalStateException;

import org.keycloak.adapters.KeycloakConfigResolver;
import org.keycloak.adapters.KeycloakDeployment;
import org.keycloak.adapters.KeycloakDeploymentBuilder;
import org.keycloak.adapters.spi.HttpFacade.Request;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.utilities.properties.JNDISingleton;

/**
 * KeycloakRuntimeConfigResolver - Loads the keycloak config JSON at runtime, rather than bundling it with the JAR
 */
public class KeycloakRuntimeConfigResolver implements KeycloakConfigResolver {

    private static transient final Logger LOG = LoggerFactory.getLogger(KeycloakRuntimeConfigResolver.class);
    private KeycloakDeployment keycloakDeployment;

    @Override
    public KeycloakDeployment resolve(Request request) {
        if(keycloakDeployment == null) {
            DynamicReadOnlyProperties props = JNDISingleton.getInstance();
            String keycloakConfigFile = props.getProperty("coastal-hazards.portal.auth.config.file", "");

            if(keycloakConfigFile == null || keycloakConfigFile.isEmpty()) {
                String errorString = "No keycloak config file path provided. Property 'coastal-hazards.portal.auth.config.file'";
                LOG.error(errorString);
                throw new IllegalStateException();
            }

            try {
                InputStream is = new FileInputStream(new File(keycloakConfigFile));
                keycloakDeployment = KeycloakDeploymentBuilder.build(is);
            } catch(IOException e) {
                String errorString = "Unable to load configuration file for KeyCloak: " + keycloakConfigFile;
                LOG.error(errorString, e);
                throw new IllegalStateException();
            }
        }

        return keycloakDeployment;
	}
}