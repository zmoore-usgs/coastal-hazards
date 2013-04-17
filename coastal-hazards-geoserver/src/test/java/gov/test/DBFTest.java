/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.test;

import org.junit.Test;
import static org.junit.Assert.*;



/**
 *
 * @author tkunicki
 */
public strictfp class DBFTest {
    
    @Test
    public void test() {

        int width = 33;
                
        for (int i = -323; i < 308; i++) {
            validate(String.format("9.9999999999999e%d", i-1), width);
            validate(String.format("-9.9999999999999e%d", i-1), width);
            validate(String.format("1e%d", i), width);
            validate(String.format("-1e%d", i), width);
            validate(String.format("1.0000000000001e%d", i), width);
            validate(String.format("-1.0000000000001e%d", i), width);
        }
        
    }
    
    public void validate(String in, int width) {
        String out = format(Double.parseDouble(in), width);
        System.out.println(out + " : " + in);
        assertNotNull(out);
        assertEquals(width, out.length());
//        assertEquals(width, out.trim().length());
        assertEquals(Double.parseDouble(in), Double.parseDouble(out), Double.parseDouble(in)/1e15);
    }
    
    public String format(Number n, int width) {
        
        double d = n.doubleValue();
        double da = d < 0d ? 0d - d : d;
        int precision = width;
        if (d < 0) {
            precision -= 1; // negative sign
        }
        boolean scientificNotation = (da >= Math.pow(10, precision - 2) || da <= Math.pow(10, -2));
        if (scientificNotation) {
            precision -= getExponentCharacterCount(d);
            precision -= 2; // e.g. "0."
        } else {
            precision -= (int)Math.max(2, Math.floor(Math.log10(da)) + 2);
        }
        return String.format( scientificNotation ? 
                        String.format("%%%d.%de", width, precision) :
                        String.format("%%%d.%df", width, precision),
                    n.doubleValue() );
                
    }
    
    public int getExponentCharacterCount(double value) {
        int exponentWidth = 2; // [Ee][-+]
        double valueAbs = value < 0d ? 0d - value : value;
        if (valueAbs < 1d) {
            if (valueAbs >= 1E-99) {
                return exponentWidth + 2;
            } else {
                return exponentWidth + 3;
            } 
        } else {
             if (valueAbs < 1E100) {
                return exponentWidth + 2;
            } else {
                return exponentWidth + 3;
            }
        }
    }
    
}
