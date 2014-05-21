package gov.usgs.cida.utilities.colors;

import java.awt.Color;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class ColorUtility {

    public static String toHex(Color color) {
        return String.format("#%06X", (0xFFFFFF & color.getRGB()));
    }
    
    public static String toHexLowercase(Color color) {
        return toHex(color).toLowerCase();
    }
}
