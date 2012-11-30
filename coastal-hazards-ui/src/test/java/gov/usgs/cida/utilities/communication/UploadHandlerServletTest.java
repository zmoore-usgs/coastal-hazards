/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.utilities.communication;

import com.google.gson.Gson;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
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
public class UploadHandlerServletTest {
    
    public UploadHandlerServletTest() {
    }
    
    @BeforeClass
    public static void setUpClass() {
    }
    
    @AfterClass
    public static void tearDownClass() {
    }
    
    @Before
    public void setUp() {
    }
    
    @After
    public void tearDown() {
    }

    /**
     * Test of init method, of class UploadHandlerServlet.
     */
    @Test
    public void testInit() throws Exception {
        Gson gson = new Gson();
        Map<String, String> map = new HashMap<String, String>();
        map.put("key1", "val1");
        map.put("key2", "val2");
        String test = gson.toJson(map);
        assert(!test.isEmpty());
    }
}
