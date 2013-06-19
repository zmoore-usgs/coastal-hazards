package gov.usgs.cida.coastalhazards.uncy;

import java.io.File;
import java.nio.charset.Charset;
import java.util.HashMap;
import java.util.Map;

import org.geotools.data.DataStore;
import org.geotools.data.DataStoreFinder;
import org.geotools.data.shapefile.dbf.DbaseFileHeader;
import org.geotools.data.shapefile.dbf.DbaseFileReader;
import org.geotools.data.shapefile.files.ShpFiles;
import org.geotools.data.shapefile.shp.ShapeType;
import org.geotools.data.shapefile.shp.ShapefileReader;
import org.geotools.data.shapefile.shp.ShapefileReader.Record;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.data.simple.SimpleFeatureIterator;
import org.geotools.data.simple.SimpleFeatureSource;
import org.opengis.feature.Feature;
import org.opengis.feature.GeometryAttribute;
import org.opengis.metadata.identification.CharacterSet;

import com.vividsolutions.jts.geom.CoordinateSequence;
import com.vividsolutions.jts.geom.CoordinateSequenceFactory;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.LineString;
import com.vividsolutions.jts.geom.MultiLineString;

/** Read a shoreline shapefile and the associated uncertainty map.
 * 
 * @author rhayes
 *
 */
public class Reader {

	public Map<Integer,Double> readDBF(String fn) throws Exception {
		
		ShpFiles shpFile = new ShpFiles(fn);
		Charset charset = Charset.defaultCharset();
		
		DbaseFileReader rdr = new DbaseFileReader(shpFile, false, charset);
		
		DbaseFileHeader hdr = rdr.getHeader();
		System.out.println("Header: " + hdr);
		
		Map<Integer,Double> value = new HashMap<Integer,Double>();
		
		while (rdr.hasNext()) {
			Object[] ff = rdr.readEntry();
			
			// System.out.printf("%s\n", ff[2]);
			Integer i = ((Number)ff[0]).intValue();
			Double d = (Double)ff[1];
			
			value.put(i, d);
		}
		
		return value;
	}
	
	public void readM(String fn) throws Exception {

		File file = new File(fn);

		ShpFiles shpFile = new ShpFiles(file);
		CoordinateSequenceFactory x = com.vividsolutions.jtsexample.geom.ExtendedCoordinateSequenceFactory.instance();
		GeometryFactory gf = new GeometryFactory(x);

		ShapefileReader rdr = new ShapefileReader(shpFile,false, false, gf);
		rdr.setHandler(new MultiLineZHandler(ShapeType.ARCM, gf));

		while (rdr.hasNext()) { 
			Record rec = rdr.nextRecord();

			System.out.printf("%s\n", rec);
			
			Object thing = rec.shape();
			System.out.printf("shape %s\n", thing);
			
			MultiLineString mls = (MultiLineString) thing;
			for (int g = 0; g < mls.getNumGeometries(); g++) {
				Geometry geom = mls.getGeometryN(g);
				
				LineString ls = (LineString) geom;
				CoordinateSequence cs = ls.getCoordinateSequence();
				
				System.out.printf("Geom %d: %s\n", g, cs);
				
				for (int i = 0; i < 10 && i < cs.size(); i++) {
					System.out.printf("\tX %f Y %f M %f\n", cs.getX(i), cs.getY(i), cs.getOrdinate(i, 3));
				}
			}
		}

	}

	public void read(String fn) throws Exception {

		File file = new File(fn);

		Map connect = new HashMap();
		connect.put("url", file.toURL());

		DataStore dataStore = DataStoreFinder.getDataStore(connect);

		String[] typeNames = dataStore.getTypeNames();

		System.out.println("Type names:");
		for (String tn : typeNames) {
			System.out.println(tn);
		}

		String typeName = typeNames[0];

		System.out.println("Reading content " + typeName);

		SimpleFeatureSource featureSource = dataStore.getFeatureSource(typeName);

		SimpleFeatureCollection collection = featureSource.getFeatures();

		SimpleFeatureIterator iterator = collection.features();


		try {
			while (iterator.hasNext()) {
				Feature feature = iterator.next();
				GeometryAttribute sourceGeometry = feature.getDefaultGeometryProperty();
				System.out.printf("Geometry %s\n", sourceGeometry);
			}
		} finally {
			iterator.close();
		}
	}

	public static void main(String[] args) throws Exception {
		for (String fn : args) {
			Reader ego = new Reader();

			Map<Integer,Double> xx = ego.readDBF(fn + "_uncertainty.dbf");
			System.out.printf("Got map size %d\n", xx.size());
			
			ego.readM(fn+".shp");
			
		}
	}

}
