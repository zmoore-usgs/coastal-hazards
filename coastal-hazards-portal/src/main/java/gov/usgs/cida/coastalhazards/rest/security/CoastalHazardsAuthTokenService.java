package gov.usgs.cida.coastalhazards.rest.security;

import java.util.List;

import gov.usgs.cida.auth.client.AuthClientSingleton;
import gov.usgs.cida.auth.client.IAuthClient;
import gov.usgs.cida.auth.ws.rs.service.AbstractAuthTokenService;


public class CoastalHazardsAuthTokenService extends AbstractAuthTokenService {

	@Override
	public IAuthClient getAuthClient() {
		return AuthClientSingleton.getAuthClient();
	}

	@Override
	public List<String> getAdditionalRoles() {
		return CoastalHazardsTokenBasedSecurityFilter.ACCEPTED_ROLES;
	}
}
