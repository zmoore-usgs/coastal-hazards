package gov.usgs.cida.coastalhazards.model.util;

import gov.usgs.cida.coastalhazards.model.Item;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import org.junit.Before;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.*;

/**
 *
 * @author jiwalker
 */
public class ItemLastUpdateComparatorTest {
    
    public Item o1;
    public Item o2;
    
    @Before
    public void setup() {
        // Before the other
        o1 = new Item();
        o1.setId("Object1");
        o1.setLastModified(new Date(12345678));
        
        // After the other
        o2 = new Item();
        o2.setId("Object2");
        o2.setLastModified(new Date(45678901));
    }

    /**
     * Test of compare method, of class ItemLastUpdateComparator.
     */
    @Test
    public void testCompare() {
        ItemLastUpdateComparator comparator = new ItemLastUpdateComparator();
        int result = comparator.compare(o1, o2);
        assertThat(-1, is(equalTo(result)));
    }
    
    @Test
    public void testMax() {
        ItemLastUpdateComparator comparator = new ItemLastUpdateComparator();
        List<Item> items = new ArrayList<>();
        items.add(o1);
        items.add(o2);
        Item max = Collections.max(items, comparator);
        assertThat(o2.getId(), is(equalTo(max.getId())));
    }
    
    @Test
    public void testMin() {
        ItemLastUpdateComparator comparator = new ItemLastUpdateComparator();
        List<Item> items = new ArrayList<>();
        items.add(o1);
        items.add(o2);
        Item min = Collections.min(items, comparator);
        assertThat(o1.getId(), is(equalTo(min.getId())));
    }
    
}
