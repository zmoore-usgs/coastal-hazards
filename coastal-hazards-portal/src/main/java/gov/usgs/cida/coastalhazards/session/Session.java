package gov.usgs.cida.coastalhazards.session;

import gov.usgs.cida.coastalhazards.session.io.SessionFileIO;
import gov.usgs.cida.coastalhazards.session.io.SessionIO;
import java.io.Serializable;

/**
 *
 * @author isuftin
 */
public class Session implements Serializable {
	private static final long serialVersionUID = 1L;
	
	private transient SessionIO sessionIo;
	
	private SessionMap map;
	
	public Session() {
		this.sessionIo = new SessionFileIO();
		this.map = null;
	}
	
	public Session(SessionMap map) {
		this.map = map;
	}
	
	/**
	 * Checks that the session has all required properties set
	 * @return 
	 */
	boolean isValid() {
		boolean isValid = true;
		
		if (this.map == null || !this.map.isValid()) {
			isValid = false;
		}
		
		return isValid;
	}

	public SessionMap getMap() {
		return map;
	}

	public void setMap(SessionMap map) {
		this.map = map;
	}
	
}
