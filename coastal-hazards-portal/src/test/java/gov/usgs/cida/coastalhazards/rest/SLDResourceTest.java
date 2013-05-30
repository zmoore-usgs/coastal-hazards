/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.coastalhazards.rest;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;

/**
 *
 * @author jordan
 */
public class SLDResourceTest {
   
    /**
     * Test of getRedWhiteSLD method, of class SLDResource.
     */
    @Test
    public void testMakeSteps2() {
        float[] steps = SLDResource.makeSteps(0, 10, 2);
        assertEquals(0, steps[0], 0.01);
        assertEquals(10, steps[1], 0.01);
    }
    
    /**
     * Test of getRedWhiteSLD method, of class SLDResource.
     */
    @Test
    public void testMakeSteps4() {
        float[] steps = SLDResource.makeSteps(0, 10, 4);
        assertEquals(0, steps[0], 0.01);
        assertEquals(3.33, steps[1], 0.01);
        assertEquals(6.66, steps[2], 0.01);
        assertEquals(10, steps[3], 0.01);
    }
}