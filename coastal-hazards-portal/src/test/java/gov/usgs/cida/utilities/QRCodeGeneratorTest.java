package gov.usgs.cida.utilities;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Date;
import org.apache.commons.io.IOUtils;
import static org.junit.Assert.*;
import org.junit.Test;

/**
 *
 * @author isuftin
 */
public class QRCodeGeneratorTest {

	public QRCodeGeneratorTest() {
	}

	@Test
	public void testGenerateToFile() throws Exception {
		System.out.println("generateToFile");
		File result = new QRCodeGenerator()
				.setUrl(new URL("http://cida.usgs.gov"))
				.generateToFile();

		assertNotNull(result);
		assertTrue(result.exists());
		assertNotEquals(0, result.length());
	}

	@Test
	public void testWriteToOutputStream() throws IOException, URISyntaxException {
		System.out.println("testWriteToOutputStream");
		QRCodeGenerator instance = new QRCodeGenerator().setUrl(new URL("http://cida.usgs.gov"));
		File result = File.createTempFile(String.valueOf((new Date()).getTime()), "deleteme");
		result.deleteOnExit();

		OutputStream os = null;

		try {
			os = new FileOutputStream(result);
			instance.writeToOutputStream(os);
		} finally {
			IOUtils.closeQuietly(os);
		}

		assertNotNull(result);
		assertTrue(result.exists());
		assertNotEquals(0, result.length());
		
	}

}
