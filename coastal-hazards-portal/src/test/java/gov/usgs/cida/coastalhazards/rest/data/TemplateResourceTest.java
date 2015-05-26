package gov.usgs.cida.coastalhazards.rest.data;

import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.model.summary.Summary;
import java.util.List;
import java.util.Set;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.*;

/**
 *
 * @author jiwalker
 */
public class TemplateResourceTest {

	/**
	 * Test of keywordsFromString method, of class TemplateResource.
	 */
	@Test
	public void testKeywordsFromString() {
		String keywords = "test|a list|of|keywords";
		TemplateResource instance = new TemplateResource();
		Set<String> result = instance.keywordsFromString(keywords);
		assertThat(result.size(), is(equalTo(4)));
	}
	
}
