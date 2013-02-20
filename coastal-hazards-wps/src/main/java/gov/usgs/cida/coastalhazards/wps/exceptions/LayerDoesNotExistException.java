package gov.usgs.cida.coastalhazards.wps.exceptions;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class LayerDoesNotExistException extends RuntimeException {

    public LayerDoesNotExistException() {
        super();
    }

    public LayerDoesNotExistException(String message) {
        super(message);
    }
    
}
