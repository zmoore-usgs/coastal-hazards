package gov.usgs.cida.coastalhazards.model.summary;

import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.net.URISyntaxException;
import java.net.URL;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertThat;

/**
 *
 * @author jiwalker
 */
public class SummaryTest {
	
	private URL json = this.getClass().getResource("/summary.json");
	
	@Test
	public void testJson() throws URISyntaxException, FileNotFoundException {
		File jsonFile = new File(json.toURI());
		Summary summary = GsonUtil.getDefault().fromJson(new FileReader(jsonFile), Summary.class);
		assertThat(summary.getMedium().getTitle(), is(equalTo("Mean water levels during a category 1 hurricane")));
		assertThat(summary.getKeywords().contains("Massachusetts"), is(true));
	}
	
	@Test
	public void testCopyToWithNullFrom() {
		Summary from = null;
		Summary to = null;
		Summary actual = Summary.copyValues(from, to);
		//it should return null rather than throwing an NPE
		assertNull(actual);
	}
}
