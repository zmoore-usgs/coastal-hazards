package gov.usgs.cida.coastalhazards.model;

import com.vividsolutions.jts.geom.Envelope;
import com.vividsolutions.jts.geom.Polygon;
import org.apache.commons.lang3.tuple.Pair;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertEquals;
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

	@Test
	public void testGetPoints() {
		Bbox testBox = new Bbox();
		testBox.setBbox(10, 11, 20, 21);
		Pair<Pair<Double,Double>,Pair<Double,Double>> points = Bbox.getPoints(testBox);
		assertEquals(new Double(10), points.getLeft().getLeft());
		assertEquals(new Double(11), points.getLeft().getRight());
		assertEquals(new Double(20), points.getRight().getLeft());
		assertEquals(new Double(21), points.getRight().getRight());
	}
	
	@Test
	public void testCopyToSquareBoxLatExtend() {
		Bbox testBox = new Bbox();
		testBox.setBbox(1, 1, 2, 3);
		Bbox resultBox = Bbox.copyToSquareBox(testBox);
		Pair<Pair<Double,Double>,Pair<Double,Double>> points = Bbox.getPoints(resultBox);
		assertEquals(new Double(0.506531), points.getLeft().getLeft());
		assertEquals(new Double(1.0), points.getLeft().getRight());
		assertEquals(new Double(2.493469), points.getRight().getLeft());
		assertEquals(new Double(3.0), points.getRight().getRight());
	}

	@Test
	public void testCopyToSquareBoxLongExtend() {
		Bbox testBox = new Bbox();
		testBox.setBbox(1, 1, 3, 2);
		Bbox resultBox = Bbox.copyToSquareBox(testBox);
		Pair<Pair<Double,Double>,Pair<Double,Double>> points = Bbox.getPoints(resultBox);
		assertEquals(new Double(1.0), points.getLeft().getLeft());
		assertEquals(new Double(0.493417), points.getLeft().getRight());
		assertEquals(new Double(3.0), points.getRight().getLeft());
		assertEquals(new Double(2.506576), points.getRight().getRight());
	}

	@Test
	public void testCopyToSquareBoxEqual() {
		Bbox testBox = new Bbox();
		testBox.setBbox(1, 1, 1, 1);
		Bbox resultBox = Bbox.copyToSquareBox(testBox);
		Pair<Pair<Double,Double>,Pair<Double,Double>> points = Bbox.getPoints(resultBox);
		assertEquals(new Double(1.0), points.getLeft().getLeft());
		assertEquals(new Double(1.0), points.getLeft().getRight());
		assertEquals(new Double(1.0), points.getRight().getLeft());
		assertEquals(new Double(1.0), points.getRight().getRight());
	}

	@Test
	public void testCopyToSquareBoxNullEmpty() {
		Bbox testBox = new Bbox();
		Bbox resultBox = Bbox.copyToSquareBox(testBox);
		assertEquals(null, resultBox.getBbox());

		testBox = null;
		resultBox = Bbox.copyToSquareBox(testBox);
		assertEquals(null, resultBox);
	}

	@Test
	public void testCopyToCRS() {
		Bbox testBox = new Bbox();
		testBox.setBbox(1, 1, 3, 2);
		Bbox resultBox = Bbox.copyToCRS(testBox, "EPSG:3857");
		Pair<Pair<Double,Double>,Pair<Double,Double>> points = Bbox.getPoints(resultBox);
		assertEquals(new Double(111319.490793), points.getLeft().getLeft());
		assertEquals(new Double(111325.142866), points.getLeft().getRight());
		assertEquals(new Double(333958.47238), points.getRight().getLeft());
		assertEquals(new Double(222684.208506), points.getRight().getRight());
	}

	@Test
	public void testCopyToCRSEqual() {
		Bbox testBox = new Bbox();
		testBox.setBbox(1, 1, 1, 1);
		Bbox resultBox = Bbox.copyToCRS(testBox, "EPSG:4326");
		Pair<Pair<Double,Double>,Pair<Double,Double>> points = Bbox.getPoints(resultBox);
		assertEquals(new Double(1.0), points.getLeft().getLeft());
		assertEquals(new Double(1.0), points.getLeft().getRight());
		assertEquals(new Double(1.0), points.getRight().getLeft());
		assertEquals(new Double(1.0), points.getRight().getRight());
	}

	@Test
	public void testCopyToCRSInvalid() {
		Bbox testBox = new Bbox();
		testBox.setBbox(1, 1, 3, 2);
		Bbox resultBox = Bbox.copyToCRS(testBox, "invalid");
		assertEquals(null, resultBox.getBbox());
	}

	@Test
	public void testCopyToCRSNullEmpty() {
		Bbox testBox = new Bbox();
		Bbox resultBox = Bbox.copyToCRS(testBox, "EPSG:3857");
		assertEquals(null, resultBox.getBbox());
		
		testBox = null;
		resultBox = Bbox.copyToCRS(testBox, "EPSG:3857");
		assertEquals(null, resultBox);
	}
}
