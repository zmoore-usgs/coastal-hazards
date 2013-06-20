package gov.usgs.cida.coastalhazards.uncy;

import java.io.File;
import java.io.Serializable;
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
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.data.simple.SimpleFeatureIterator;
import org.geotools.data.simple.SimpleFeatureSource;
import org.geotools.feature.simple.SimpleFeatureBuilder;
import org.opengis.feature.Feature;
import org.opengis.feature.Property;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;

/** Write a copy of the input shapefile.
 * 
 * @author rhayes
 *
 */
public class Writer {

	public void copy(String fn) throws Exception {

		File fin = new File(fn+".shp");

		Map<String, Serializable> connect = new HashMap<String, Serializable> ();
		connect.put("url", fin.toURL());

		DataStore inputStore = DataStoreFinder.getDataStore(connect);

		File fout = new File(fn + "_copy.shp");
		connect.put("url", fout.toURL());
        connect.put("create spatial index", Boolean.TRUE);
        ShapefileDataStoreFactory dataStoreFactory = new ShapefileDataStoreFactory();
        ShapefileDataStore outputStore = (ShapefileDataStore) dataStoreFactory.createNewDataStore(connect);

		String[] typeNames = inputStore.getTypeNames();

		System.out.println("Type names:");
		for (String tn : typeNames) {
			System.out.println(tn);
		}

		String typeName = typeNames[0];

		System.out.println("Reading content " + typeName);

		SimpleFeatureSource featureSource = inputStore.getFeatureSource(typeName);
		SimpleFeatureType sourceSchema = featureSource.getSchema();
		outputStore.createSchema(sourceSchema);

        SimpleFeatureBuilder featureBuilder = new SimpleFeatureBuilder(outputStore.getSchema());

		SimpleFeatureCollection collection = featureSource.getFeatures();
		
		SimpleFeatureIterator iterator = collection.features();

        Transaction tx = new DefaultTransaction("create");
		FeatureWriter<SimpleFeatureType, SimpleFeature> featureWriter = outputStore.getFeatureWriterAppend(tx);

		int featureCt = 0;
		
		try {
			while (iterator.hasNext()) {
				Feature feature = iterator.next();
				// GeometryAttribute sourceGeometry = feature.getDefaultGeometryProperty();
				// System.out.printf("Geometry %s\n", sourceGeometry);
								
				SimpleFeature f = (SimpleFeature) feature;
				Feature outputFeature = SimpleFeatureBuilder.deep(f);
				
				// DefaultFeatureCollection featureCollection = new DefaultFeatureCollection();
				// featureCollection.add((SimpleFeature) outputFeature);
				// outSFS.addFeatures(featureCollection);
		        
				SimpleFeature writeFeature = featureWriter.next();
				Collection<Property> fpp = outputFeature.getProperties();
				Property[] properties = fpp.toArray(new Property[fpp.size()]);
				for (int i = 0; i < properties.length; i++) {
					writeFeature.setAttribute(i, properties[i].getValue());
				}
				// writeFeature.setValue(fpp);
								
				featureWriter.write();
				
				featureCt ++;
			}
			
		} finally {
			iterator.close();
		}
		
		tx.commit();
		
		System.out.printf("Wrote %d features\n", featureCt);
	}

	public static void main(String[] args) throws Exception {
		for (String fn : args) {
			Writer ego = new Writer();

			ego.copy(fn);
			
		}
	}

}
