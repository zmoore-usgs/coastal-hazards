package gov.usgs.cida.coastalhazards.exception;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class CycleIntroductionException extends RuntimeException {
    
    @Override
    public String getMessage() {
        return "Introducing cycles is not allowed";
    }
    
}
