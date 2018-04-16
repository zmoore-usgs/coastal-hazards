package gov.usgs.cida.coastalhazards.jpa;

import gov.usgs.cida.coastalhazards.model.Item;
import java.util.Arrays;
import java.util.List;
import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.*;

public class ItemManagerTest {

	private ItemManager instance;
	private Item orphan;
	
	@Before
	public void setUp() {
		instance = new ItemManager();
		orphan = new Item();
		orphan.setId("H2O");
	}

	@Test
	public void testStripOrphanFromEmptyAncestorsList() {
		List<Item> expectedItems = Arrays.asList();
		List<Item> emptyAncestors = Arrays.asList();
		List<Item> actualItems = instance.stripOrphanFromAncestors(orphan, emptyAncestors);
		assertEquals(expectedItems, actualItems);
	}
	
	@Test
	public void testStripOrphanFromOneAncestorWithNullChildren() {
		List<Item> expectedItems = Arrays.asList();
		Item orphanTestParent = new Item();
		orphanTestParent.setChildren(null);
		
		List<Item> ancestors = Arrays.asList(orphanTestParent);
		List<Item> actualItems = instance.stripOrphanFromAncestors(orphan, ancestors);
		assertEquals(expectedItems, actualItems);
	}
	
	@Test
	public void testStripOrphanFromOneAncestorWithEmptyChildren() {
		List<Item> expectedItems = Arrays.asList();
		Item orphanTestParent = new Item();
		orphanTestParent.setChildren(Arrays.asList());
		
		List<Item> ancestors = Arrays.asList(orphanTestParent);
		List<Item> actualItems = instance.stripOrphanFromAncestors(orphan, ancestors);
		assertEquals(expectedItems, actualItems);
	}
	
	@Test
	public void testStripOrphanFromUnrelatedAncestor() {
		Item orphanTestParent = new Item();
		orphanTestParent.setId("parent");
		Item unrelatedChild = new Item();
		unrelatedChild.setId("unrelated child");
		
		orphanTestParent.setChildren(Arrays.asList(unrelatedChild));
		
		List<Item> expectedItems = Arrays.asList(orphanTestParent);
		
		List<Item> ancestors = Arrays.asList(orphanTestParent);
		List<Item> actualItems = instance.stripOrphanFromAncestors(orphan, ancestors);
		assertEquals(expectedItems, actualItems);
	}


}
