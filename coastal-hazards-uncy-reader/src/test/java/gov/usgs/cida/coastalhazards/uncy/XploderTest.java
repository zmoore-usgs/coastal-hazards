package gov.usgs.cida.coastalhazards.uncy;

import static org.junit.Assert.*;

import org.junit.Test;

public class XploderTest {

	@Test
	public void testExplode() throws Exception {
		Xploder ego = new Xploder();

		ego.explode("src/test/resources/test_data");
		
		assertTrue("survived", true);
	}

}
