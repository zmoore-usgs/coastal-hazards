package gov.usgs.cida.utilities;

import java.util.Date;

/**
 * Limitation is that it uses current time (in milliseconds) to get the id This
 * is not good for lots of items generated quickly, but should be alright for
 * slow creation
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class IdGenerator {

	private static final String alphabet = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
	private static final int size = alphabet.length();

	public static String generate() {
		long time = new Date().getTime();
		StringBuilder str = new StringBuilder();
		while (time > size) {
			long div = (long) (time / size);
			int mod = (int) (time % size);
			time = div;
			str.append(alphabet.charAt(mod));
		}
		str.append(alphabet.charAt((int) time));
		return str.reverse().toString();
	}
}
