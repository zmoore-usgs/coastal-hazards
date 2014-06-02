package gov.usgs.cida.utilities;

import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import net.glxn.qrgen.QRCode;
import net.glxn.qrgen.image.ImageType;
import net.glxn.qrgen.vcard.VCard;

/**
 * Generates a QR Code with the option to write to a file or an output stream, multiple image type formats, defined sizes ,etc
 *
 * @author Ivan Suftin (isuftin@usgs.gov)
 */
public class QRCodeGenerator {

	private VCard vcard = new VCard();
	final private int DEFAULT_WIDTH = 125;
	final private int DEFAULT_HEIGHT = 125;
	private ImageType type = ImageType.PNG;
	
	private int width = DEFAULT_WIDTH;
	private int height = DEFAULT_HEIGHT;

	public QRCodeGenerator setVCard(VCard card) {
		this.vcard = card;
		return this;
	}

	public QRCodeGenerator setImageType(ImageType type) {
		this.type = type;
		return this;
	}

	public QRCodeGenerator setCompany(String company) {
		this.vcard.setCompany(company);
		return this;
	}

	public QRCodeGenerator setEMail(String email) {
		this.vcard.setEmail(email);
		return this;
	}

	public QRCodeGenerator setAddress(String address) {
		this.vcard.setAddress(address);
		return this;
	}

	public QRCodeGenerator setName(String name) {
		this.vcard.setName(name);
		return this;
	}

	public QRCodeGenerator setPhone(String phone) {
		this.vcard.setPhonenumber(phone);
		return this;
	}

	public QRCodeGenerator seTitle(String title) {
		this.vcard.setTitle(title);
		return this;
	}

	public QRCodeGenerator setUrl(URL url) throws URISyntaxException {
		this.vcard.setWebsite(url.toURI().toString());
		return this;
	}

	public QRCodeGenerator setWidth(int w) {
		this.width = w;
		return this;
	}

	public QRCodeGenerator setHeight(int h) {
		this.height = h;
		return this;
	}

	public File generateToFile() throws IOException {
		return generateQRCode().file();
	}

	public void writeToOutputStream(OutputStream os) {
		generateQRCode().writeTo(os);
	}

	private QRCode generateQRCode() {
		return QRCode
				.from(vcard)
				.withSize(width, height)
				.withCharset(StandardCharsets.UTF_8.name())
				.withErrorCorrection(ErrorCorrectionLevel.L)
				.to(type);
	}

}
