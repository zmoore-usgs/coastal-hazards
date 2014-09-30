package gov.usgs.cida.coastalhazards.uncy;

import gov.usgs.cida.owsutils.commons.io.FileHelper;
import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.Date;
import java.util.logging.Logger;
import org.apache.commons.io.FileUtils;
import org.junit.After;
import org.junit.AfterClass;
import static org.junit.Assert.assertTrue;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

public class XploderTest {

	private static final Logger LOG = Logger.getLogger(XploderTest.class.getName());
	private static final String tempDir = System.getProperty("java.io.tmpdir");
	private static File workDir;
	private static final String testDataName = "test_data";
	private static final String testShorelinesName = "test_shorelines";
	private static File testDataShapefile;
	private static File testShorelinesShapefile;

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
		testDataShapefile = new File(workDir, testDataName + ".zip");
		testShorelinesShapefile = new File(workDir, testShorelinesName + ".zip");
		FileHelper.unzipFile(workDir.toString(), testDataShapefile);
		FileHelper.unzipFile(workDir.toString(), testShorelinesShapefile);
	}
	
	@After
	public void tearDown() {
		for (File file : FileUtils.listFiles(workDir, null, true)) {
			FileUtils.deleteQuietly(file);
		}
	}

	@Test
	public void testExplode() throws Exception {
		LOG.info("testExplode()");
		Xploder x = new Xploder("ACCURACY", Double.class);
		File result = x.explode(workDir + "/" + testShorelinesName);
		assertTrue("survived", true);
		assertTrue(result.exists());
		assertTrue(result.length() > 0);
	}

}
