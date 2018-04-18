package gov.usgs.cida.coastalhazards.rest.data.util;

import gov.usgs.cida.coastalhazards.model.Item;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.*;

public class ItemUtilTest {

	private Item orphan;
	
	@Before
	public void setUp() {
		orphan = new Item();
		orphan.setId("H2O");
	}

	@Test
	public void testStripOrphanFromEmptyAncestorsList() {
		List<Item> expectedItems = new ArrayList<>();
		List<Item> emptyAncestors = new ArrayList<>();
		List<Item> actualItems = ItemUtil.stripOrphanFromAncestors(orphan, emptyAncestors);
		assertEquals(expectedItems, actualItems);
	}
	
	@Test
	public void testStripOrphanFromOneAncestorWithNullChildren() {
		Item orphanTestParent = new Item();
		orphanTestParent.setChildren(null);
		
		Item expectedParent = Item.copyValues(orphanTestParent, null);
		List<Item> expectedItems = new ArrayList<>(Arrays.asList(expectedParent));
		List<Item> ancestors = new ArrayList<>(Arrays.asList(orphanTestParent));
		List<Item> actualItems = ItemUtil.stripOrphanFromAncestors(orphan, ancestors);
		assertEquals(expectedItems, actualItems);
	}
	
	@Test
	public void testStripOrphanFromOneAncestorWithEmptyChildren() {
		
		Item testParent = new Item();
		testParent.setChildren(new ArrayList<>());
		Item expectedParent = Item.copyValues(testParent, null);
		List<Item> expectedItems = new ArrayList<>(Arrays.asList(expectedParent));
		
		List<Item> ancestors = new ArrayList<>(Arrays.asList(testParent));
		List<Item> actualItems = ItemUtil.stripOrphanFromAncestors(orphan, ancestors);
		assertEquals(expectedItems, actualItems);
	}
	
	@Test
	public void testStripOrphanFromUnrelatedAncestor() {
		Item orphanTestParent = new Item();
		orphanTestParent.setId("parent");
		Item unrelatedChild = new Item();
		unrelatedChild.setId("unrelated child");
		
		orphanTestParent.setChildren(new ArrayList<>(Arrays.asList(unrelatedChild)));
		
		List<Item> expectedItems = new ArrayList<>(Arrays.asList(orphanTestParent));
		
		List<Item> ancestors = new ArrayList<>(Arrays.asList(orphanTestParent));
		List<Item> actualItems = ItemUtil.stripOrphanFromAncestors(orphan, ancestors);
		assertEquals(expectedItems, actualItems);
	}

	@Test
	public void testStripOrphanFromOneAncestor() {
		Item parent = new Item();
		parent.setId("parent");
		parent.setChildren(
			new ArrayList<>(Arrays.asList(orphan))
		);
		
		Item expectedParent = Item.copyValues(parent, null);
		//remove child
		expectedParent.setChildren(null);
		
		List<Item> expectedItems = new ArrayList<>(Arrays.asList(expectedParent));
		
		List<Item> ancestors = new ArrayList<>(Arrays.asList(parent));
		List<Item> actualItems = ItemUtil.stripOrphanFromAncestors(orphan, ancestors);
		assertEquals(expectedItems, actualItems);
	}
	
	@Test
	public void testStripOrphanFromTwoAncestors() {
		Item unrelatedChild1 = new Item();
		unrelatedChild1.setId("unrelated");
		
		Item unrelatedChild2 = new Item();
		unrelatedChild2.setId("unrelated");
		
		
		Item parent1 = new Item();
		parent1.setId("parent1");
		parent1.setChildren(
			new ArrayList<>(Arrays.asList(unrelatedChild1, orphan))
		);
		
		Item parent2 = new Item();
		parent2.setId("parent2");
		parent2.setChildren(
			new ArrayList<>(Arrays.asList(orphan, unrelatedChild2))
		);
		
		
		Item expectedParent1 = Item.copyValues(parent1, null);
		expectedParent1.setChildren(
			new ArrayList<>(Arrays.asList(unrelatedChild1))
		);
		
		Item expectedParent2 = Item.copyValues(parent2, null);
		expectedParent2.setChildren(
			new ArrayList<>(Arrays.asList(unrelatedChild2))
		);
		
		List<Item> expectedItems = new ArrayList<>(Arrays.asList(
			expectedParent1, expectedParent2
		));
		
		List<Item> ancestors = new ArrayList<>(Arrays.asList(parent1, parent2));
		List<Item> actualItems = ItemUtil.stripOrphanFromAncestors(orphan, ancestors);
		assertEquals(expectedItems, actualItems);
	}
	
}
