package gov.usgs.cida.coastalhazards.rest.security;

/**
 * This exception is different then an unauthorized/forbidden exception in
 * that it signals that a user has not explicitly hit the CCH the login page.
 * 
 * @author thongsav
 *
 */
public class MustLoginException extends RuntimeException {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
}
