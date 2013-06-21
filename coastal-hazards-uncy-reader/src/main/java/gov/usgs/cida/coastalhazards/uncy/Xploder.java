package gov.usgs.cida.coastalhazards.uncy;

import java.io.File;
import java.io.IOException;
import java.io.Serializable;
import java.net.MalformedURLException;
import java.nio.charset.Charset;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

import org.geotools.data.DataStore;
import org.geotools.data.DataStoreFinder;
import org.geotools.data.DefaultTransaction;
import org.geotools.data.FeatureWriter;
import org.geotools.data.Transaction;
import org.geotools.data.shapefile.ShapefileDataStore;
import org.geotools.data.shapefile.ShapefileDataStoreFactory;
import org.geotools.data.shapefile.ShpFiles;
import org.geotools.data.shapefile.dbf.DbaseFileHeader;
import org.geotools.data.shapefile.dbf.DbaseFileReader;
import org.geotools.data.shapefile.shp.ShapeType;
import org.geotools.data.shapefile.shp.ShapefileReader;
import org.geotools.data.shapefile.shp.ShapefileReader.Record;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.data.simple.SimpleFeatureIterator;
import org.geotools.data.simple.SimpleFeatureSource;
import org.geotools.feature.simple.SimpleFeatureBuilder;
import org.geotools.feature.simple.SimpleFeatureTypeBuilder;
import org.geotools.geometry.jts.JTSFactoryFinder;
import org.opengis.feature.Feature;
import org.opengis.feature.GeometryAttribute;
import org.opengis.feature.Property;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.feature.type.AttributeDescriptor;
import org.opengis.feature.type.AttributeType;
import org.opengis.feature.type.GeometryType;

import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.CoordinateSequence;
import com.vividsolutions.jts.geom.CoordinateSequenceFactory;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.LineString;
import com.vividsolutions.jts.geom.MultiLineString;
// which Point class to use?
import com.vividsolutions.jts.geom.Point;
import com.vividsolutions.jtsexample.geom.ExtendedCoordinate;


/** Write a copy of the input shapefile, with lines exploded to their constituent points
 * and with the M columns used to look up the point-by-point uncertainty (if available).
 * 
 * @author rhayes
 *
 */
public class Xploder {

	private int geomIdx = -1;
	private FeatureWriter<SimpleFeatureType, SimpleFeature> featureWriter;
	private Map<Integer,Double>  uncyMap;
	private int dfltUncyIdx = -1;
	private DbaseFileHeader dbfHdr;
	private Transaction tx;
    private GeometryFactory geometryFactory = JTSFactoryFinder.getGeometryFactory(null);

	private static int locateField(DbaseFileHeader hdr, String nm, Class<?> expected) {
		int idx = -1;
		
		for (int x = 0; x < hdr.getNumFields(); x++) {
			String fnm = hdr.getFieldName(x);
			if (nm.equalsIgnoreCase(fnm)) {
				idx = x;
			}
		}
		if (idx < 0) {
			throw new RuntimeException("did not find column named " + nm);
		}
		
		Class<?> idClass = hdr.getFieldClass(idx);		
		if ( ! expected.isAssignableFrom(idClass)) {
			throw new RuntimeException("Actual class " + idClass + " is not assignable to expected " + expected);
		}

		return idx;
	}
	
	private static Map<Integer,Double> readUncyFromDBF(String fn) throws Exception {
		
		ShpFiles shpFile = new ShpFiles(fn);
		Charset charset = Charset.defaultCharset();
		
		DbaseFileReader rdr = new DbaseFileReader(shpFile, false, charset);
		
		DbaseFileHeader hdr = rdr.getHeader();
		// System.out.println("Header: " + hdr);
		
		int uncyIdx = locateField(hdr, "uncy", Double.class);
		int idIdx = locateField(hdr, "id", Number.class);
		
		Map<Integer,Double> value = new HashMap<Integer,Double>();
		
		while (rdr.hasNext()) {
			Object[] ff = rdr.readEntry();
			
			Integer i = ((Number)ff[idIdx]).intValue();
			Double d = (Double)ff[uncyIdx];
			
			value.put(i, d);
		}
		
		rdr.close();
		
		return value;
	}
	
	public void processShape(ShapeAndAttributes sap) throws Exception {

		Double defaultUncertainty = (Double)sap.row.read(dfltUncyIdx);
		
		for (Point p : sap) {
			ExtendedCoordinate ec = (ExtendedCoordinate)p.getCoordinate();
			
			double uncy = defaultUncertainty;
			
			double md = ec.getM();
			if ( ! Double.isNaN(md)) {
				int mi = (int)md;
				
				uncy = uncyMap.get(mi);
			}
			
			// write new point-thing-with-uncertainty
			writePoint(p, sap.row, uncy);
		}
		
	}

	public void writePoint(Point p, DbaseFileReader.Row row, double uncy) throws Exception {
		
		SimpleFeature writeFeature = featureWriter.next();
		
		// geometry field is first, otherwise we lose.
		Point np = geometryFactory.createPoint(p.getCoordinate());
		writeFeature.setAttribute(0, np);

		// copy them other attributes over, replacing uncy
		for (int i = 0; i < dbfHdr.getNumFields(); i++) {
			Object value;
			if (i == dfltUncyIdx) {
				value = uncy;
			} else {
				value = row.read(i);
			}
			writeFeature.setAttribute(i+1, value);
		}
		
		featureWriter.write();
	}
	
	private void initWriter(String fn) throws Exception {
		// read input to get attributes
		SimpleFeatureType sourceSchema = readSourceSchema(fn);
		
		// duplicate input schema, except replace geometry with Point
		SimpleFeatureTypeBuilder typeBuilder = new SimpleFeatureTypeBuilder();
		typeBuilder.setName(sourceSchema.getName());
		typeBuilder.setCRS(sourceSchema.getCoordinateReferenceSystem());
		
		geomIdx = -1;
		// dfltUncyIdx = -1;
		int idx = 0;
		for (AttributeDescriptor ad : sourceSchema.getAttributeDescriptors()) {
			AttributeType at = ad.getType();
			if (at instanceof GeometryType) {
				typeBuilder.add(ad.getLocalName(), Point.class);
				geomIdx = idx;
			} else {
				typeBuilder.add(ad.getLocalName(), ad.getType().getBinding());
				
				// Do not use this index for uncy column, as this include the geometry column in the count
				// while the dbf record does not.
				
				/*if ("uncy".equalsIgnoreCase(ad.getLocalName())) {
					dfltUncyIdx = idx;
				}*/
			}
			idx++;
		}
		SimpleFeatureType outputFeatureType = typeBuilder.buildFeatureType();

		File fout = new File(fn + "_copy.shp");
		
		Map<String, Serializable> connect = new HashMap<String, Serializable> ();
		connect.put("url", fout.toURL());
        connect.put("create spatial index", Boolean.TRUE);
        
        ShapefileDataStoreFactory dataStoreFactory = new ShapefileDataStoreFactory();
        ShapefileDataStore outputStore = (ShapefileDataStore) dataStoreFactory.createNewDataStore(connect);
        
		outputStore.createSchema(outputFeatureType);

        featureWriter = outputStore.getFeatureWriterAppend(tx);
	}

	private static SimpleFeatureType readSourceSchema(String fn)
			throws MalformedURLException, IOException
	{
		File fin = new File(fn+".shp");

		Map<String, Serializable> connect = new HashMap<String, Serializable> ();
		connect.put("url", fin.toURL());

		DataStore inputStore = DataStoreFinder.getDataStore(connect);

		String[] typeNames = inputStore.getTypeNames();
		String typeName = typeNames[0];

		SimpleFeatureSource featureSource = inputStore.getFeatureSource(typeName);
		SimpleFeatureType sourceSchema = featureSource.getSchema();
		
		// this might kill the source schema.
		inputStore.dispose();
		
		return sourceSchema;
	}
	
	public void explode(String fn) throws Exception {
		MyShapefileReader rdr = initReader(fn);
		
		tx = new DefaultTransaction("create");
		initWriter(fn);
		
		for (ShapeAndAttributes saa : rdr) {
			processShape(saa);
		}
		
		tx.commit();
	}

	private MyShapefileReader initReader(String fn) throws Exception {
		MyShapefileReader rdr = new MyShapefileReader(fn);
		
		dbfHdr = rdr.getDbfHeader();
		dfltUncyIdx = locateField(dbfHdr, "uncy", Double.class);
		
		uncyMap = readUncyFromDBF(fn + "_uncertainty.dbf");
		return rdr;
	}

	public static void main(String[] args) throws Exception {
		for (String fn : args) {
			Xploder ego = new Xploder();

			ego.explode(fn);
			
		}
	}

}
