package gov.usgs.cida.coastalhazards.service.util;

import gov.usgs.cida.owsutils.commons.communication.RequestResponse;
import gov.usgs.cida.owsutils.commons.io.FileHelper;
import java.io.File;
import java.io.IOException;
import java.util.Collection;
import javax.servlet.http.HttpServletRequest;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.filefilter.HiddenFileFilter;
import org.apache.commons.lang.StringUtils;
import org.slf4j.LoggerFactory;

/**
 *
 * @author isuftin
 */
public class ImportUtil {

	private static final org.slf4j.Logger LOGGER = LoggerFactory.getLogger(ImportUtil.class);

	/**
	 *
	 * @param request
	 * @param defaultFileParam
	 * @param workDir
	 * @param overwrite
	 * @return
	 * @throws IOException
	 * @throws FileUploadException
	 */
	public static File saveShapefileFromRequest(HttpServletRequest request, String defaultFileParam, String workDir, boolean overwrite) throws IOException, FileUploadException {
		String filenameParam = defaultFileParam;
		String fnReqParam = request.getParameter("filename.param");
		if (StringUtils.isNotBlank(fnReqParam)) {
			filenameParam = fnReqParam;
		}
		LOGGER.debug("Filename parameter set to: {}", filenameParam);
		LOGGER.debug("Cleaning file name.\nWas: {}", filenameParam);
		String zipFileName = cleanFileName(request.getParameter(filenameParam));
		LOGGER.debug("Is: {}", zipFileName);
		if (filenameParam.equals(zipFileName)) {
			LOGGER.debug("(No change)");
		}
		String shapefileName = zipFileName.substring(0, zipFileName.lastIndexOf("."));
		File saveDirectory = new File(workDir + File.separator + shapefileName);
		if (!saveDirectory.exists()) {
			FileUtils.forceMkdir(saveDirectory);
		}
		if (overwrite) {
			try {
				FileUtils.cleanDirectory(saveDirectory);
			} catch (IOException ex) {
				LOGGER.debug("Could not clean save directory at " + saveDirectory.getAbsolutePath(), ex);
			}
			LOGGER.debug("File already existed on server. Deleted before re-saving.");
		}
		File shapeZipFile = new File(saveDirectory, zipFileName);
		LOGGER.debug("Temporary file set to {}", shapeZipFile.getAbsolutePath());
		try {
			RequestResponse.saveFileFromRequest(request, shapeZipFile, filenameParam);
			LOGGER.debug("Shapefile saved");
			FileHelper.flattenZipFile(shapeZipFile.getAbsolutePath());
			LOGGER.debug("Shapefile zip structure flattened");
			FileHelper.validateShapefileZip(shapeZipFile);
			LOGGER.debug("Shapefile verified");
			gov.usgs.cida.utilities.file.FileHelper.unzipFile(saveDirectory.getAbsolutePath(), shapeZipFile);
			LOGGER.debug("Shapefile unzipped");
			if (shapeZipFile.delete()) {
				LOGGER.debug("Deleted zipped shapefile");
			} else {
				LOGGER.debug("Could not delete shapefile zip at {}", shapeZipFile.getAbsolutePath());
			}
			Collection<File> shapeFileParts = FileUtils.listFiles(saveDirectory, HiddenFileFilter.VISIBLE, null);
			for (File file : shapeFileParts) {
				String oldFilename = file.getName();
				String newFilename = shapefileName + "." + FilenameUtils.getExtension(file.getName());
				gov.usgs.cida.utilities.file.FileHelper.renameFile(file, newFilename);
				LOGGER.debug("Renamed {} to {}", oldFilename, newFilename);
			}
		} catch (FileUploadException | IOException ex) {
			FileUtils.deleteQuietly(saveDirectory);
			throw ex;
		}
		return new File(saveDirectory, shapefileName + ".shp");
	}

	/**
	 *
	 * @param input
	 * @return
	 */
	public static String cleanFileName(String input) {
		String updated = input;
		if (input.substring(0, 1).matches("[0-9]")) {
			updated = "_" + input;
		}
		char[] inputArr = updated.toCharArray();
		for (int cInd = 0; cInd < inputArr.length; cInd++) {
			if (!Character.isLetterOrDigit(inputArr[cInd]) && !(inputArr[cInd] == '.')) {
				inputArr[cInd] = '_';
			}
		}
		return String.valueOf(inputArr);
	}

	private ImportUtil() {
	}

}
