package gov.usgs.cida.coastalhazards.rest.security;

import java.io.IOException;

import javax.annotation.Priority;
import javax.annotation.security.DenyAll;
import javax.annotation.security.PermitAll;
import javax.ws.rs.ForbiddenException;
import javax.ws.rs.Priorities;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.container.DynamicFeature;
import javax.ws.rs.container.ResourceInfo;
import javax.ws.rs.core.FeatureContext;

import org.apache.commons.lang.StringUtils;
import org.glassfish.jersey.server.model.AnnotatedMethod;

import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.utilities.properties.JNDISingleton;

/**
 * THIS WAS MOSTLY COPIED FROM {@link org.glassfish.jersey.server.filter.RolesAllowedDynamicFeature}.
 * Could not extend due to Private scoping of the RolesAllowedPastLoginFilter class
 * @author thongsav, zmoore
 *
 */
public class ConfiguredRolesAllowedDynamicFeature implements DynamicFeature {
	private static final String DEFAULT_ADMIN_ROLE = "CCH_ADMIN";
	public static final String CCH_ADMIN_USER_PROP = "coastal-hazards.portal.auth.admin.role";
 
	@Override
	public void configure(final ResourceInfo resourceInfo, final FeatureContext configuration) {
		AnnotatedMethod am = new AnnotatedMethod(resourceInfo.getResourceMethod());

		// DenyAll on the method take precedence over ConfiguredRolesAllowed and PermitAll
		if (am.isAnnotationPresent(DenyAll.class)) {
			configuration.register(new ConfiguredRolesAllowedPastLoginFilter());
			return;
		}

		// ConfiguredRolesAllowed on the method takes precedence over PermitAll
		ConfiguredRolesAllowed ra = am.getAnnotation(ConfiguredRolesAllowed.class);
		if (ra != null) {
			configuration.register(new ConfiguredRolesAllowedPastLoginFilter(loadRoles(ra.value())));
			return;
		}

		// PermitAll on the method takes precedence over ConfiguredRolesAllowed on the class
		if (am.isAnnotationPresent(PermitAll.class)) {
			// Do nothing.
			return;
		}

		// DenyAll can't be attached to classes

		// ConfiguredRolesAllowed on the class takes precedence over PermitAll
		ra = resourceInfo.getResourceClass().getAnnotation(ConfiguredRolesAllowed.class);
		if (ra != null) {
			configuration.register(new ConfiguredRolesAllowedPastLoginFilter(loadRoles(ra.value())));
		}
	}

	@Priority(Priorities.AUTHORIZATION - 1) // authorization filter - should go after any authentication filters
	private static class ConfiguredRolesAllowedPastLoginFilter implements ContainerRequestFilter {
		private final String[] rolesAllowed;

		ConfiguredRolesAllowedPastLoginFilter() {
			this.rolesAllowed = null;
		}

		ConfiguredRolesAllowedPastLoginFilter(String[] rolesAllowed) {
			this.rolesAllowed = (rolesAllowed != null) ? rolesAllowed : null;
		}

		@Override
		public void filter(ContainerRequestContext requestContext) throws IOException {
			if (rolesAllowed != null) {
				for (String role : rolesAllowed) {
					if (requestContext.getSecurityContext().isUserInRole(role)) {
						return;
					}
				}
			}
			
			throw new ForbiddenException();
		}
	}

	protected String[] loadRoles(String property) {
		DynamicReadOnlyProperties props = JNDISingleton.getInstance();
		
		// Default value in getProperty doesn't assign to empty values, so we have to do a maunal check after
		String adminRole = props.getProperty(property, "");
		
		if(StringUtils.isBlank(adminRole)) {
			adminRole = DEFAULT_ADMIN_ROLE;
		}

		return new String[] {adminRole};
	}
}