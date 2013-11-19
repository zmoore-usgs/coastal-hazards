package gov.usgs.cida.coastalhazards.gson.serializer;

import gov.usgs.cida.coastalhazards.gson.adapter.DoubleSerializer;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.io.Serializable;
import org.junit.Test;
import static org.junit.Assert.*;

/**
 *
 * @author isuftin
 */
public class DoubleSerializerTest {

	private class MyClass implements Serializable {

		private double dbl = 55468034.09273208;
		private double dbl2 = -55468034.09273208;
		private double[] dblArray = {55468034.09273208, -55468034.09273208};

		public double getDbl() {
			return dbl;
		}

		public void setDbl(double dbl) {
			this.dbl = dbl;
		}

		public double getDbl2() {
			return dbl2;
		}

		public void setDbl2(double dbl2) {
			this.dbl2 = dbl2;
		}

		public double[] getDblArray() {
			return dblArray;
		}

		public void setDblArray(double[] dblArray) {
			this.dblArray = dblArray;
		}
	}

	public DoubleSerializerTest() {
	}

	@Test
	public void testSerializeWithoutDoubleSerializer() {
		Gson gson = new Gson();
		String result = gson.toJson(new MyClass());
		assertTrue(result.contains("E"));
	}

	@Test
	public void testSerializeWithDoubleSerializer() {
		String result = new GsonBuilder()
				.registerTypeAdapter(Double.class, new DoubleSerializer(5))
				.create()
				.toJson(new MyClass());

		assertFalse(result.contains("E"));
		assertTrue(result.contains("55468034.09273"));
		assertTrue(result.contains("-55468034.09273"));
		assertTrue(result.contains("\"dblArray\":[55468034.09273,-55468034.09273]"));
	}
}