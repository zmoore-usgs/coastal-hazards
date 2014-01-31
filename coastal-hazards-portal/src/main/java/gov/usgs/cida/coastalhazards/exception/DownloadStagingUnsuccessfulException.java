package gov.usgs.cida.coastalhazards.exception;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class DownloadStagingUnsuccessfulException extends Exception {
    
    @Override
    public String getMessage() {
        return "Unable to stage download from remote source";
    }
    
}
