package gov.usgs.cida.coastalhazards.wps.exceptions;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class UnsupportedCoordinateReferenceSystemException extends RuntimeException {

    public UnsupportedCoordinateReferenceSystemException() {
        super();
    }

    public UnsupportedCoordinateReferenceSystemException(String message) {
        super(message);
    }
    
}
