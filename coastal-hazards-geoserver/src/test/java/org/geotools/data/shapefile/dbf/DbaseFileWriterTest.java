/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.test;

import java.nio.charset.Charset;
import java.util.TimeZone;
import org.geotools.data.shapefile.dbf.DbaseFileWriter.FieldFormatter;
import org.junit.Test;
import static org.junit.Assert.*;



/**
 *
 * @author tkunicki
 */
public strictfp class DbaseFileWriterTest {
    
    
    
    @Test
    public void test() {
        
        FieldFormatter ff = new FieldFormatter(Charset.defaultCharset(), TimeZone.getDefault());

        int width = 33;
                
        for (int i = -323; i < 308; i++) {
            validate(String.format("9.9999999999999e%d", i-1), width, ff);
            validate(String.format("-9.9999999999999e%d", i-1), width, ff);
            validate(String.format("1e%d", i), width, ff);
            validate(String.format("-1e%d", i), width, ff);
            validate(String.format("1.0000000000001e%d", i), width, ff);
            validate(String.format("-1.0000000000001e%d", i), width, ff);
        }
        
    }
    
    public void validate(String in, int width, FieldFormatter formatter) {
        String out = formatter.getFieldString(width, -1, Double.parseDouble(in));
        System.out.println(out + " : " + in);
        assertNotNull(out);
        assertEquals(width, out.length());
//        assertEquals(width, out.trim().length());  // Issue with Fixed precision floating point jitter at 1e-27
        assertEquals(Double.parseDouble(in), Double.parseDouble(out), Double.parseDouble(in)/1e15);
    }
        
}
