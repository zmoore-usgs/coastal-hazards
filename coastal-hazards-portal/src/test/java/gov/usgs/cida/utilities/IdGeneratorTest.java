package gov.usgs.cida.utilities;

import org.junit.Test;
import static org.junit.Assert.*;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class IdGeneratorTest {
   
    /**
     * Test of generate method, of class IdGenerator.
     */
    @Test
    public void testGenerate() throws InterruptedException {
        String a = IdGenerator.generate();
        Thread.sleep(2);
        String b = IdGenerator.generate();
        assertNotEquals(a, b);
    }
}