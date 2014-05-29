/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package gov.usgs.cida.utilities;

import java.util.Date;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;

/**
 *
 * @author cschroed
 */
public class FuzzyDateComparatorTest {
	
	
	
	public FuzzyDateComparatorTest() {
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
	 * Test of compare method, of class FuzzyDateComparator.
	 */
	@Test
	public void testCompare() {
		
		final long testTolerance = 2000;
		FuzzyDateComparator fdc = new FuzzyDateComparator(testTolerance);
		long start = 10000;
		Date baseDate = new Date(start);
		
		//strict equality
		assertEquals(fdc.compare(baseDate, baseDate), 0);
		
		//effective equality
		Date equalToBaseDate = new Date(start);
		assertEquals(fdc.compare(baseDate, equalToBaseDate), 0);
		
		//fuzzy equality
		Date fuzzilyEqualDate1 = new Date(start + testTolerance);
		assertEquals(fdc.compare(baseDate, fuzzilyEqualDate1), 0);
				
		Date fuzzilyEqualDate2 = new Date(start - testTolerance);
		assertEquals(fdc.compare(baseDate, fuzzilyEqualDate2), 0);
		
		//inequality
		Date notEqualDate1 = new Date(start + testTolerance + 1);
		assertEquals(fdc.compare(baseDate, notEqualDate1), -1);
				
		Date notEqualDate2 = new Date((start - testTolerance) - 1);
		assertEquals(fdc.compare(baseDate, notEqualDate2), 1);
	}
	
}
