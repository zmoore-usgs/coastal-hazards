package gov.usgs.cida.coastalhazards.model;

import com.vividsolutions.jts.geom.Envelope;
import com.vividsolutions.jts.geom.Polygon;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertThat;

/**
 *
 * @author jiwalker
 */
public class BboxTest {
	
	public BboxTest() {
	}
	
	@Test
	public void testMakeEnvelopeNull() {
		Bbox instance = new Bbox();
		instance.setBbox(null);
		Envelope expResult = null;
		Envelope result = instance.makeEnvelope();
		assertThat(expResult, is(equalTo(result)));
	}
	
	@Test
	public void testMakeEnvelopeEmpty() {
		Bbox instance = new Bbox();
		instance.setBbox("");
		Envelope expResult = null;
		Envelope result = instance.makeEnvelope();
		assertThat(expResult, is(equalTo(result)));
	}

	/**
	 * Test of envelopeToPolygon method, of class Bbox.
	 */
	@Test
	public void testEnvelopeToPolygon() {
		Envelope e = new Envelope(1.0, 2.0, 3.0, 4.0);
		Polygon result = Bbox.envelopeToPolygon(e);
		assertThat(result.getArea(), is(equalTo(1.0)));
	}
	
}
