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
	
	private SessionMap sessionMap;
	private ViewMap viewMap;
	
	public Session() {
		this.sessionIo = new SessionFileIO();
		this.sessionMap = null;
	}
	
	public Session(SessionMap sessionMap) {
		this.sessionMap = sessionMap;
	}
	
	/**
	 * Checks that the session has all required properties set
	 * @return 
	 */
	boolean isValid() {
		boolean isValid = true;
		
		if (this.sessionMap == null || !this.sessionMap.isValid()) {
			isValid = false;
		}
		
		if (this.viewMap == null || !this.viewMap.isValid()) {
			isValid = false;
		}
		
		return isValid;
	}

	public SessionMap getMap() {
		return sessionMap;
	}

	public void setMap(SessionMap map) {
		this.sessionMap = map;
	}
	
	public ViewMap getView() {
		return viewMap;
	}
	
	public void setView(ViewMap viewMap) {
		this.viewMap = viewMap;
	}
	
}
