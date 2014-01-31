package gov.usgs.cida.coastalhazards.model.summary;

import org.junit.Test;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.*;

/**
 *
 * @author jiwalker
 */
public class TinyTest {

    /**
     * Test of setText method, of class Tiny.
     */
    @Test
    public void testSetTextOk() {
        Tiny tiny = new Tiny();
        tiny.setText("test");
        assertThat("test", is(equalTo(tiny.getText())));
    }
    
    @Test(expected = AssertionError.class)
    public void testSetTextTooBig() {
        Tiny tiny = new Tiny();
        // String is 110 chars long
        tiny.setText("12345678902234567890323456789042345678905234567890623456789072345678908234567890923456789002345678901234567890");
        assertThat(true, is(false));
    }
    
}
