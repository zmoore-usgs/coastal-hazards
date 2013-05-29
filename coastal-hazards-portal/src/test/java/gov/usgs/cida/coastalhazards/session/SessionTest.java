package gov.usgs.cida.coastalhazards.session;

import gov.usgs.cida.coastalhazards.session.io.SessionFileIO;
import gov.usgs.cida.coastalhazards.session.io.SessionIO;
import gov.usgs.cida.coastalhazards.session.io.SessionIOException;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;

/**
 *
 * @author isuftin
 */
public class SessionTest {
	String sessionJSON =  "{\"map\":{\"baselayer\":\"ESRI World Imagery\",\"scale\":13867008.52318302,\"extent\":[-14879968.140907,3626269.4777222,-6470672.0382553,7755091.9969996],\"center\":{\"lat\":5690680.7373609,\"lon\":-10675320.089581}}}";

	public SessionTest() {
	}
	
	@BeforeClass
	public static void setUpClass() {
	}
	
	@AfterClass
	public static void tearDownClass() {
	}
	
	@Before
	public void setUp() {
	}
	
	@After
	public void tearDown() {
	}
	
	@Test
	public void sessionReadWriteTest() throws SessionIOException {
		SessionIO sessionio = new SessionFileIO();
		String sessionID;
		
		sessionID = sessionio.save(sessionJSON);
		assertNotNull(sessionID);
		
		String json = sessionio.load(sessionID);
		assertNotNull(json);
	}
}