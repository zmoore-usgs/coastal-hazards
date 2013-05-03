package gov.usgs.cida.coastalhazards.service;

import gov.usgs.cida.utilities.communication.RequestResponseHelper;
import gov.usgs.cida.utilities.file.FileHelper;
import gov.usgs.cida.coastalhazards.metadata.MetadataValidator;
import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.fileupload.FileItemFactory;
import org.apache.commons.fileupload.FileItemIterator;
import org.apache.commons.fileupload.FileItemStream;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;

/**
 *
 * @author isuftin
 */
public class PublishService extends HttpServlet {

	/**
	 * Processes requests for both HTTP
	 * <code>GET</code> and
	 * <code>POST</code> methods.
	 *
	 * @param request servlet request
	 * @param response servlet response
	 * @throws ServletException if a servlet-specific error occurs
	 * @throws IOException if an I/O error occurs
	 */
	protected void processRequest(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		response.setContentType("text/html;charset=UTF-8");
		File tempFile = File.createTempFile("metadata", ".xml");
		String layer = ""; //request.getParameter("md-layers-select");
        
		Map<String, String> responseMap = new HashMap<String, String>();
		if (tempFile.exists()) {
			tempFile.delete();
		}
		try {
            if (ServletFileUpload.isMultipartContent(request)) {
                FileItemFactory factory = new DiskFileItemFactory();
                ServletFileUpload upload = new ServletFileUpload(factory);
                FileItemIterator iter = upload.getItemIterator(request);
                while (iter.hasNext()) {
                    FileItemStream item = iter.next();
                    if (item.isFormField()) {
                        if ("md-layers-select".equals(item.getFieldName())) {
                            layer = IOUtils.toString(item.openStream());
                        }
                    } else {
                        FileHelper.saveFileFromInputStream(item.openStream(), tempFile);
                    }
                }
            }
            // Do you stuff here
            MetadataValidator validator = new MetadataValidator(tempFile);
			
			RequestResponseHelper.sendSuccessResponse(response, responseMap);
		} catch (FileUploadException ex) {
			responseMap.put("message", ex.getMessage());
			RequestResponseHelper.sendErrorResponse(response, responseMap);
		} finally {
			FileUtils.deleteQuietly(tempFile);
		}
		
		
	}

	// <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
	/**
	 * Handles the HTTP
	 * <code>GET</code> method.
	 *
	 * @param request servlet request
	 * @param response servlet response
	 * @throws ServletException if a servlet-specific error occurs
	 * @throws IOException if an I/O error occurs
	 */
	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		processRequest(request, response);
	}

	/**
	 * Handles the HTTP
	 * <code>POST</code> method.
	 *
	 * @param request servlet request
	 * @param response servlet response
	 * @throws ServletException if a servlet-specific error occurs
	 * @throws IOException if an I/O error occurs
	 */
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		processRequest(request, response);
	}

	/**
	 * Returns a short description of the servlet.
	 *
	 * @return a String containing servlet description
	 */
	@Override
	public String getServletInfo() {
		return "Short description";
	}// </editor-fold>
}
