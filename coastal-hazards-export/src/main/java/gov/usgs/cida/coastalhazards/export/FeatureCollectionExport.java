package gov.usgs.cida.coastalhazards.export;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.FileAlreadyExistsException;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.geotools.data.FeatureWriter;
import org.geotools.data.FileDataStoreFactorySpi;
import org.geotools.data.FileDataStoreFinder;
import org.geotools.data.Transaction;
import org.geotools.data.shapefile.ShapefileDataStore;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.data.simple.SimpleFeatureIterator;
import org.geotools.feature.simple.SimpleFeatureTypeBuilder;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.feature.type.AttributeDescriptor;
import org.opengis.feature.type.FeatureType;
import org.opengis.feature.type.GeometryDescriptor;
import org.opengis.feature.type.PropertyDescriptor;
import org.opengis.referencing.crs.CoordinateReferenceSystem;

/**
 * This utility takes a feature collection and saves it to file in the 
 * specified location
 * 
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class FeatureCollectionExport {
    
    public static final CoordinateReferenceSystem DEFAULT_CRS = DefaultGeographicCRS.WGS84;

    private SimpleFeatureCollection simpleFeatureCollection;
    private final File outputDirectory;
    private final String namePrefix;
    private List<String> attributes;
    private CoordinateReferenceSystem crs;
    
    public FeatureCollectionExport(SimpleFeatureCollection simpleFeatureCollection,
            File outputDirectory, String namePrefix) {
        this.simpleFeatureCollection = simpleFeatureCollection;
        this.outputDirectory = outputDirectory;
        this.namePrefix = namePrefix;
        this.attributes = new LinkedList<>();
        this.crs = DEFAULT_CRS;
    }
    
    public void addAttribute(String attrName) {
        if (attributeExists(attrName)) {
            attributes.add(attrName);
        } else {
            throw new RuntimeException("Attribute not found in feature collection");
        }
    }
    
    public void setCRS(CoordinateReferenceSystem crs) {
        this.crs = crs;
    }
    
    public void writeToShapefile() throws MalformedURLException, IOException {
        SimpleFeatureIterator features = simpleFeatureCollection.features();
        SimpleFeatureType type = buildFeatureType();
        FileDataStoreFactorySpi factory = FileDataStoreFinder.getDataStoreFactory("shp");
        File shpFile = checkAndCreateFile();
        Map datastoreConfig = new HashMap<>();
        datastoreConfig.put("url", shpFile.toURI().toURL());
        ShapefileDataStore shpfileDataStore = (ShapefileDataStore)factory.createNewDataStore(datastoreConfig);
        shpfileDataStore.createSchema(type);
        shpfileDataStore.forceSchemaCRS(type.getCoordinateReferenceSystem());
        
        FeatureWriter<SimpleFeatureType, SimpleFeature> featureWriter = shpfileDataStore.getFeatureWriter(namePrefix, Transaction.AUTO_COMMIT);
        try {
            while (features.hasNext()) {
                SimpleFeature srcFeature = features.next();
                SimpleFeature next = featureWriter.next();
                next.setDefaultGeometry(srcFeature.getDefaultGeometry());
                for (String name : attributes) {
                    next.setAttribute(name, srcFeature.getAttribute(name));
                }
                featureWriter.write();
            }
        } finally {
            IOUtils.closeQuietly(featureWriter);
            IOUtils.closeQuietly(features);
        }
    }
    
    private SimpleFeatureType buildFeatureType() {
        SimpleFeatureTypeBuilder builder = new SimpleFeatureTypeBuilder();
        builder.setName(namePrefix);
        builder.setCRS(crs);
        builder.add(getGeometryDescriptor());
        for (String name : attributes) {
            AttributeDescriptor descriptor = getDescriptorFromPrototype(name);
            if (descriptor != null) {
                builder.add(descriptor);
            }
        }
        SimpleFeatureType featureType = builder.buildFeatureType();
        return featureType;
    }
    
    private AttributeDescriptor getDescriptorFromPrototype(String name) {
        SimpleFeatureType schema = simpleFeatureCollection.getSchema();
        AttributeDescriptor descriptor = schema.getDescriptor(name);
        return descriptor;
    }
    
    private GeometryDescriptor getGeometryDescriptor() {
        FeatureType schema = simpleFeatureCollection.getSchema();
        return schema.getGeometryDescriptor();
    }
    
    private boolean attributeExists(String attrName) {
        FeatureType schema = simpleFeatureCollection.getSchema();
        PropertyDescriptor descriptor = schema.getDescriptor(attrName);
        if (descriptor != null) {
            return true;
        }
        return false;
    }
    
    private File checkAndCreateFile() throws IOException {
        File shpFile = null;
        if (!outputDirectory.exists()) {
            FileUtils.forceMkdir(outputDirectory);
        } else if (!outputDirectory.isDirectory()) {
            throw new IOException("outputDirectory must be a directory");
        } else {
            // good to go?
        }
        String shpName = namePrefix + ".shp";
        shpFile = FileUtils.getFile(outputDirectory, shpName);
        if (shpFile.exists()) {
            throw new FileAlreadyExistsException(shpName);
        }
        
        return shpFile;
    }
}
