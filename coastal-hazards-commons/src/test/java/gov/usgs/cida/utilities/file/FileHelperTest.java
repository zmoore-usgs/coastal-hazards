package gov.usgs.cida.utilities.file;

import java.io.File;
import java.io.FileFilter;
import java.io.IOException;
import java.io.InputStream;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.zip.ZipEntry;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.StringUtils;
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
public class FileHelperTest {
	
	public FileHelperTest() {
	}
	private static final String tempDir = System.getProperty("java.io.tmpdir");
	private static File workDir;
	
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
		FileUtils.copyDirectory(new File(getClass().getResource("/").toURI()), workDir);
	}
	
	@After
	public void tearDown() {
		for (File file : FileUtils.listFiles(workDir, null, true)) {
			FileUtils.deleteQuietly(file);
		}
	}

	@Test
	public void testCreateTokenFromFileName() throws URISyntaxException {
		System.out.println("createTokenFromFileName");
		URL testFileURL = getClass().getResource("/handpts.zip");
		File testFie = new File(testFileURL.toURI());
		String result = FileHelper.base64EncodeFileName(testFie, false);
		assertTrue(StringUtils.isNotBlank(result));
	}
	
}
