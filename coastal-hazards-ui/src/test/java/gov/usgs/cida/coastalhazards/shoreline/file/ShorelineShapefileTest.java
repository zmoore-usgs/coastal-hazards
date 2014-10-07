package gov.usgs.cida.coastalhazards.shoreline.file;

import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.Date;
import org.apache.commons.io.FileUtils;
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
public class ShorelineShapefileTest {

	private static final String tempDir = System.getProperty("java.io.tmpdir");
	private static File workDir;
	private static File validShapeZip;

	public ShorelineShapefileTest() {
	}

	@BeforeClass
	public static void setUpClass() throws IOException {
		workDir = new File(tempDir, String.valueOf(new Date().getTime()));
		FileUtils.deleteQuietly(workDir);
		FileUtils.forceMkdir(workDir);
	}

	@AfterClass
	public static void tearDownClass() {
		FileUtils.deleteQuietly(workDir);
	}

	@Before
	public void setUp() throws URISyntaxException, IOException {
		String packagePath = "/";
		FileUtils.copyDirectory(new File(getClass().getResource(packagePath).toURI()), workDir);
		validShapeZip = new File(workDir, "valid_shapezip.zip");
	}

	@After
	public void tearDown() {
		for (File file : FileUtils.listFiles(workDir, null, true)) {
			FileUtils.deleteQuietly(file);
		}
	}

	@Test
	public void testValidate() throws Exception {
		System.out.println("testValidate");
		File zipFile = validShapeZip;
		ShorelineShapefile.validate(zipFile);
		assertTrue("Validated without exception", true);
	}

}
