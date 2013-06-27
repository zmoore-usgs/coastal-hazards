package gov.usgs.cida.coastalhazards.gson.serializer;

import com.google.gson.JsonElement;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;
import java.lang.reflect.Type;
import java.math.BigDecimal;

/**
 * GSON serializes doubles using Double.toString() which may produce scientific
 * notation in the JSON object. Often, this is not ideal for the consumer.
 * Adding this serializer in the Gson build process creates output in standard
 * decimal format.
 *
 * Example use:
 * <pre>
 * {@code
 *
 * class MyClass implements Serializable {
 *	private double dbl = 55468034.09273208;
 *	private double dbl2 = -55468034.09273208;
 *	private double[] dblArray = {55468034.09273208, -55468034.09273208};
 *	public double getDbl() {return dbl;}
 *	public void setDbl(double dbl) {this.dbl = dbl;}
 *	public double getDbl2() {return dbl2;}
 *	public void setDbl2(double dbl2) {this.dbl2 = dbl2;}
 * 	public double[] getDblArray() {return dblArray;}
 * 	public void setDblArray(double[] dblArray) {this.dblArray = dblArray;}
 * }
 *
 * Without the DoubleSerializer:
 *
 * String json = new Gson().toJson(new MyClass());
 *
 * Result: {"dbl":5.546803409273208E7,"dbl2":-5.546803409273208E7,"dblArray":[5.546803409273208E7,-5.546803409273208E7]}
 *
 * With DoubleSerializer:
 *
 * String json = new GsonBuilder()
 *					.registerTypeAdapter(Double.class, new DoubleSerializer(2))
 *					.create()
 *					.toJson(new MyClass());
 *
 * Result: {"dbl":"55468034.09273","dbl2":"-55468034.09273","dblArray":["55468034.09273","-55468034.09273"]}
 *
 * }
 * <pre>
 *
 * Note the use of the precision parameter in the constructor. The default
 * precision is 4.
 *
 * @author isuftin
 */
public class DoubleSerializer implements JsonSerializer<Double> {

	private int precision = 0;
	/**
	 * DoubleSerializer with a default precision of 4
	 */
	public DoubleSerializer() {
		super();
		precision = 4;
	}

	/**
	 * DoubleSerializer with a specified precision
	 *
	 * @param precision A positive integer denoting how many decimal places will
	 * be used in the json output
	 */
	public DoubleSerializer(int precision) {
		super();
		this.precision = Math.abs(precision);
	}

	@Override
	public JsonElement serialize(Double src, Type typeOfSrc, JsonSerializationContext context) {
		return new JsonPrimitive(new BigDecimal(src).setScale(precision, BigDecimal.ROUND_HALF_EVEN));
	}
}
