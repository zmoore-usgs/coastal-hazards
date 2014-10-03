package gov.usgs.cida.coastalhazards.service.exception;

/**
 * Exception gets thrown when a file does not meet expected format for DSAS defined
 * lidar zip files.
 * 
 * @author thongsav
 *
 */
public class LidarFileFormatException extends Exception {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public LidarFileFormatException(String message) {
		super(message);
	}
}
