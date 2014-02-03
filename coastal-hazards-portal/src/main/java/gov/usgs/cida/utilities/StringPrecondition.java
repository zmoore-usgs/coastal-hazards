package gov.usgs.cida.utilities;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class StringPrecondition {

    public static boolean willFit(String string, int length) {
        boolean willFit = true;
        if (null != string && string.length() > length) {
            willFit = false;
        }
        return willFit;
    }
    
    public static void checkStringArgument(String string, int length) {
        if (!willFit(string, length)) {
            throw new IllegalArgumentException("Max length is: " + length);
        }
    }
    
}
