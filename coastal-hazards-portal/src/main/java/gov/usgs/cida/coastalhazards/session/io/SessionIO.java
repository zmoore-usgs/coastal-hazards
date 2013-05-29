package gov.usgs.cida.coastalhazards.session.io;

/**
 *
 * @author isuftin
 */
public interface SessionIO {
	public String load(String sessionID) throws SessionIOException;
	public String save(String session) throws SessionIOException;
 }
