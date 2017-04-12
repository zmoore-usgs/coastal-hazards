package gov.usgs.cida.coastalhazards.wps.ppio;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import org.bouncycastle.util.encoders.Base64;
import org.geoserver.wps.ppio.ShapeZipPPIO;
import org.geoserver.wps.resource.WPSResourceManager;

public class Base64ShapeZipPPIO extends ShapeZipPPIO {
	public Base64ShapeZipPPIO(WPSResourceManager resources) {
		super(resources);
	}

	@Override
	public Object decode(Object input) throws Exception {
		// TODO:  Assumes base64; should test encoding...  base64? binary-inline? etc...
		if (input instanceof String) {
			File f = null;
			OutputStream os = null;
			InputStream is = null;
			try {
				f = File.createTempFile(Base64ShapeZipPPIO.class.getSimpleName(), ".tmp");
				os = new BufferedOutputStream(new FileOutputStream(f));
				try {
					Base64.decode((String)input, os);
				} finally {
					if (os != null) try { os.close(); } catch (IOException e) { /* ignore */ }
				}
				is = new BufferedInputStream(new FileInputStream(f));
				return decode(is);
			} finally {
				if (is != null) try { is.close(); } catch (IOException e) { /* ignore */ } 
				if (f != null) f.delete();
			}
		}
		return null;
	}
}
