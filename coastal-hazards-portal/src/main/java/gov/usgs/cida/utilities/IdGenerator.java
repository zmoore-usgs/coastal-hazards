package gov.usgs.cida.utilities;

import java.util.Date;
import java.util.Random;

/**
 * Limitation is that it uses current time (in milliseconds) to get the id This
 * is not good for lots of items generated quickly, but should be alright for
 * slow creation
 *
 * I'm adding an incremental bit to this so that ids generated within close
 * time frame will not end up with the same id, "warning" this will not be great
 * for distributed loads as it depends on synchronization.
 * 
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class IdGenerator {

	private static final String alphabet = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
	private static final int size = alphabet.length();
	private static int index = new Random().nextInt(size);

	public static String generate() {
		long time = new Date().getTime();
		String head = stringify(time);
		return head + nextTail();
	}
	
	private static String stringify(long sequence) {
		StringBuilder str = new StringBuilder();
		while (sequence > size) {
			long div = (long) (sequence / size);
			int mod = (int) (sequence % size);
			sequence = div;
			str.append(alphabet.charAt(mod));
		}
		str.append(alphabet.charAt((int) sequence));
		return str.reverse().toString();
	}
	
	private static synchronized char nextTail() {
		index = (index + 1) % size;
		return alphabet.charAt(index);
	}
}
