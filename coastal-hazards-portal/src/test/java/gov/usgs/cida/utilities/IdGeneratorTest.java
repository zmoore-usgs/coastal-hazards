package gov.usgs.cida.utilities;

import java.util.HashSet;
import java.util.Set;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.*;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class IdGeneratorTest {

	/**
	 * Test of generate method, of class IdGenerator.
	 */
	@Test
	public void testGenerate() throws InterruptedException {
		String a = IdGenerator.generate();
		Thread.sleep(2);
		String b = IdGenerator.generate();
		assertNotEquals(a, b);
	}

	@Test
	public void testQuickGenerate() {
		Set<String> ids = new HashSet<>();
		// Currently 58 is the limit within the same millisecond
		for (int i=0; i<58; i++) {
			String id = IdGenerator.generate();
			assertThat(ids.add(id), is(true));
		}
	}
}
