package gov.usgs.cida.utilities.colors;

import java.awt.Color;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.core.Is.is;
import static org.junit.Assert.*;

/**
 *
 * @author jiwalker
 */
public class RainbowColorMapTest {
    
    private static String getHex(Color color) {
        return String.format("#%06X", (0xFFFFFF & color.getRGB()));
    }

    @Test
    public void testRed() {
        AttributeRange range = new AttributeRange(1900, 1975);

        RainbowColorMap instance = new RainbowColorMap(range);
        Color result = instance.valueToColor(1900);
        String hex = getHex(result);
        assertThat("#FF0000", is(equalTo(hex)));
    }
    
    @Test
    public void testGreenish() {
        AttributeRange range = new AttributeRange(1900, 1975);

        RainbowColorMap instance = new RainbowColorMap(range);
        Color result = instance.valueToColor(1933);
        String hex = getHex(result);
        assertThat("#05FF00", is(equalTo(hex)));
    }
    
    @Test
    public void testBlueish() {
        AttributeRange range = new AttributeRange(1900, 1975);

        RainbowColorMap instance = new RainbowColorMap(range);
        Color result = instance.valueToColor(1967);
        String hex = getHex(result);
        assertThat("#0400FF", is(equalTo(hex)));
    }
    
    @Test
    public void testPurple() {
        AttributeRange range = new AttributeRange(1900, 1975);

        RainbowColorMap instance = new RainbowColorMap(range);
        Color result = instance.valueToColor(1975);
        String hex = getHex(result);
        assertThat("#7F00FF", is(equalTo(hex)));
    }
    
    @Test
    public void testSingleDate() {
        AttributeRange range = new AttributeRange(1900, 1900);

        RainbowColorMap instance = new RainbowColorMap(range);
        Color result = instance.valueToColor(1900);
        String hex = getHex(result);
        assertThat("#FF0000", is(equalTo(hex)));
    }
}
