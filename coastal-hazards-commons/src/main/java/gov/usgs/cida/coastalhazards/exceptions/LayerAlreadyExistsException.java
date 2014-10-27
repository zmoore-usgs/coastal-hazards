package gov.usgs.cida.coastalhazards.exceptions;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class LayerAlreadyExistsException extends RuntimeException {

    public LayerAlreadyExistsException() {
        super();
    }

    public LayerAlreadyExistsException(String message) {
        super(message);
    }
    
}
