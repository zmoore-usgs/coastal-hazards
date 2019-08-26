package gov.usgs.cida.coastalhazards.exception;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class CycleIntroductionException extends RuntimeException {
    
    private static final long serialVersionUID = 1L;

    @Override
    public String getMessage() {
        return "Introducing cycles is not allowed";
    }
    
}
