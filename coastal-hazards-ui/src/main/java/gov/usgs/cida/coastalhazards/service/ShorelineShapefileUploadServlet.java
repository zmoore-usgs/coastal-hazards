package gov.usgs.cida.coastalhazards.service;

import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.geoutils.geoserver.servlet.ShapefileUploadServlet;
import gov.usgs.cida.owsutils.commons.properties.JNDISingleton;
import java.io.File;
import java.io.IOException;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.slf4j.LoggerFactory;

/**
 * Service to handle shoreline shapefile uploads
 * @author isuftin
 */
public class ShorelineShapefileUploadServlet extends ShapefileUploadServlet {
	private static final long serialVersionUID = 4407484936443705946L;
	private static final org.slf4j.Logger LOG = LoggerFactory.getLogger(ShorelineShapefileUploadServlet.class);
	private ServletConfig servletConfig;
	private final DynamicReadOnlyProperties props = JNDISingleton.getInstance();
	
	/**
	 * 
	 *
	 * @param request servlet request
	 * @param response servlet response
	 * @throws ServletException if a servlet-specific error occurs
	 * @throws IOException if an I/O error occurs
	 */
	protected void processRequest(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		response.setContentType("text/html;charset=UTF-8");
		
		
		
	}

//	@Override
//	protected File cleanUploadedFile(File shapefileZip) throws IOException {
//		FileHelper.flattenZipFile(shapefileZip.getPath());
//		LOG.debug("Zip file directory structure flattened");
//		return shapefileZip;
//	}
	
//	@Override
//	protected void validateUploadedFile(File shapefileZip) throws Exception {
//		FileHelper.validateShapefileZip(shapefileZip);
//		LOG.debug("Zip file seems to be a valid shapefile");
//	}
	
	@Override
	protected File transformUploadedFile(File shapefileZip) throws Exception {
		ZipInterpolator interpolator = new ZipInterpolator();
		File explodedShapeZip = interpolator.explode(shapefileZip);
		return explodedShapeZip;
	}
	
	/**
	 * Returns a short description of the servlet.
	 *
	 * @return a String containing servlet description
	 */
	@Override
	public String getServletInfo() {
		return "Service to handle shoreline shapefile uploads";
	}

}
