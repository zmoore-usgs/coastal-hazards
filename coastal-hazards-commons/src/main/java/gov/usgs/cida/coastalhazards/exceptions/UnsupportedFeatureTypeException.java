package gov.usgs.cida.coastalhazards.exceptions;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class UnsupportedFeatureTypeException extends RuntimeException {

    public UnsupportedFeatureTypeException() {
        super();
    }

    public UnsupportedFeatureTypeException(String message) {
        super(message);
    }
    
}
