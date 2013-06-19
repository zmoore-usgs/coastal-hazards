//package gov.usgs.cida.coastalhazards.session.io;
//
//import com.google.gson.Gson;
//import com.google.gson.JsonSyntaxException;
//import gov.usgs.cida.coastalhazards.model.Session;
//import java.io.ByteArrayInputStream;
//import java.io.File;
//import java.io.FileNotFoundException;
//import java.io.FileReader;
//import java.io.IOException;
//import java.io.Reader;
//import java.io.UnsupportedEncodingException;
//import java.net.URI;
//import java.security.MessageDigest;
//import java.security.NoSuchAlgorithmException;
//import java.util.UUID;
//import java.util.logging.Level;
//import java.util.logging.Logger;
//import org.apache.commons.codec.digest.DigestUtils;
//import org.apache.commons.io.FileUtils;
//import org.apache.commons.io.IOUtils;
//import org.apache.commons.lang.StringUtils;
//
///**
// *
// * @author isuftin
// */
//public class SessionFileIO implements SessionIO {
//
//	private File sessionDirectory;
//	
//	public SessionFileIO() {
//		this.sessionDirectory = FileUtils.getTempDirectory();
//	}
//	
//	public SessionFileIO(URI sessionDirectory) {
//		this.sessionDirectory = new File(sessionDirectory);
//	}
//	
//	/**
//	 * @see SessionIO#load(java.lang.String) 
//	 * @param sessionID
//	 * @return
//	 * @throws SessionIOException  
//	 * @throws NullPointerException if provided sessionID is blank or null
//	 */
//	@Override
//	public String load(String sessionID) throws SessionIOException {
//		if (StringUtils.isBlank(sessionID)) {
//			throw new NullPointerException("sessionID may not be blank");
//		}
//		
//		String sessionJSON = null;
//		File sessionFileLocation = new File(sessionDirectory, sessionID + ".txt");
//		Reader fileReader = null;
//		
//		if (sessionFileLocation.exists()) {
//			if (sessionFileLocation.isDirectory()) {
//				throw new SessionIOException("Session at " + sessionFileLocation.getPath() + " is a directory.");
//			} else if (!sessionFileLocation.canRead()) {
//				throw new SessionIOException("Session at " + sessionFileLocation.getPath() + " is not readabale.");
//			}
//			
//			try {
//				fileReader = new FileReader(sessionFileLocation);
//				sessionJSON = IOUtils.toString(fileReader);
//			} catch (FileNotFoundException ex) {
//				throw new SessionIOException(ex.getMessage());
//			} catch (JsonSyntaxException ex) {
//				throw new SessionIOException(ex.getMessage());
//			} catch (IOException ex) {
//				throw new SessionIOException(ex.getMessage());
//			} finally {
//				IOUtils.closeQuietly(fileReader);
//			}
//		}
//		
//		return sessionJSON;
//	}
//
//	/**
//	 * @see SessionIO#save(gov.usgs.cida.coastalhazards.session.Session) 
//	 * @param session
//	 * @return
//	 * @throws SessionIOException 
//	 * @throws NullPointerException if provided Session object is blank or null
//	 */
//	@Override
//	public String save(String session) throws SessionIOException {
//		if (session == null) {
//			throw new NullPointerException("Session may not be null");
//		}
//		
//		String sessionID = null;
//		
//		try {
//			sessionID = makeSHA1Hash(session);
//		} catch (NoSuchAlgorithmException ex) {
//			throw new SessionIOException(ex.getMessage());
//		}
//		
//		File sessionFileLocation = new File(sessionDirectory, sessionID + ".txt");
//		if (!sessionFileLocation.exists()) {
//			try {
//				FileUtils.copyInputStreamToFile(new ByteArrayInputStream(session.getBytes()), sessionFileLocation);
//			} catch (IOException ex) {
//				throw new SessionIOException(ex.getMessage());
//			}
//		}
//		
//		return sessionID;
//	}
//	
//
//	
//}
