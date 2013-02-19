package gov.usgs.cida.coastalhazards.service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import sun.misc.BASE64Decoder;

/**
 *
 * @author isuftin
 */
public class ExportService extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String filename = request.getParameter("filename");
        String data =  request.getParameter("data");
        String type = request.getParameter("type");
        
        if (StringUtils.isBlank(filename) || StringUtils.isBlank(data)) {
            response.sendError(500, "Either 'filename' or 'data' elements were empty.");
            return;
        }
        
        byte[] dataByteArr;
        if ("image/png;base64".equalsIgnoreCase(type) || "image/tiff;base64".equalsIgnoreCase(type)) {
            dataByteArr = new BASE64Decoder().decodeBuffer(data.toString());
        } else {
            dataByteArr = data.toString().getBytes("UTF-8");
        }
        int length = dataByteArr.length;
        
        InputStream in = null;
        OutputStream out = null;
        try {
            response.setContentType("application/octet-stream");
            response.setContentLength(length);
            response.setHeader("Content-Disposition", "attachment;filename=" + filename);
            response.setHeader("Pragma", "no-cache");
            response.setHeader("Expires", "0");
            
            in = new ByteArrayInputStream(dataByteArr);
            out = response.getOutputStream();
            IOUtils.copy(in, out);
            out.flush();
            out.close();
        } finally {
            IOUtils.closeQuietly(out);
            IOUtils.closeQuietly(in);
        }
    }

    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /** 
     * Returns a short description of the servlet.
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Exports posted data via a file back to the client";
    }// </editor-fold>
}
