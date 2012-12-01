/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.utilities.communication;

import com.google.gson.Gson;
import gov.usgs.cida.coastalhazards.service.UploadService;
import java.io.IOException;
import java.io.Writer;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.http.HttpServletResponse;

/**
 *
 * @author isuftin
 */
public class RequestResponseHelper {

    public static void sendErrorResponse(HttpServletResponse response, Map<String, String> responseMap) {
        responseMap.put("success", "false");
        sendJSONResponse(response, responseMap);
    }

    public static void sendSuccessResponse(HttpServletResponse response, Map<String, String> responseMap) {
        responseMap.put("success", "true");
        sendJSONResponse(response, responseMap);
    }

    public static void sendJSONResponse(HttpServletResponse response, Map<String, String> responseMap) {
        String responseContent = new Gson().toJson(responseMap);
        response.setContentType("application/json");
        response.setCharacterEncoding("utf-8");
        response.setHeader("Content-Length", Integer.toString(responseContent.length()));
        try {
            Writer writer = response.getWriter();
            writer.write(responseContent);
            writer.close();
        } catch (IOException ex) {
            Logger.getLogger(UploadService.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
    
}
