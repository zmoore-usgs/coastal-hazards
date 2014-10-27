package gov.usgs.cida.coastalhazards.exceptions;

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
