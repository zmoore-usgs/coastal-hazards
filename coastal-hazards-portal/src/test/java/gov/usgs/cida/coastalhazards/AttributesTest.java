package gov.usgs.cida.coastalhazards;

import org.junit.Test;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.*;

/**
 *
 * @author jiwalker
 */
public class AttributesTest {

	@Test
	public void testSetCreation() {
		assertThat(Attributes.contains(Attributes.PACCRETION), is(true));
		assertThat(Attributes.contains("foo"), is(false));
		assertThat(Attributes.set.size(), is(equalTo(63)));
	}
	
}
