package gov.usgs.cida.coastalhazards.parser;

import gov.usgs.cida.coastalhazards.util.AttributeGetter;
import static gov.usgs.cida.coastalhazards.util.Constants.*;
import gov.usgs.cida.coastalhazards.wps.exceptions.UnsupportedFeatureTypeException;
import gov.usgs.cida.coastalhazards.wps.geom.Intersection;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import org.apache.commons.io.IOUtils;
import org.geotools.feature.FeatureCollection;
import org.geotools.feature.FeatureIterator;
import org.n52.wps.io.data.GenericFileData;
import org.n52.wps.io.data.binding.complex.GenericFileDataBinding;
import org.n52.wps.io.datahandler.parser.AbstractParser;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.type.FeatureType;

/**
 *
 * @author jiwalker
 */
public class FeatureCollectionRParser extends AbstractParser {

    public FeatureCollectionRParser() {
        supportedIDataTypes.add(GenericFileDataBinding.class);
    }

    @Override
    public GenericFileDataBinding parse(InputStream input, String mimetype, String schema) {
        BufferedWriter buf = null;
        try {
            File outfile = File.createTempFile(getClass().getSimpleName(), ".tsv");
            buf = new BufferedWriter(new FileWriter(outfile));

            File tempFile = File.createTempFile(getClass().getSimpleName(), ".xml");
            //FileUtils.copyInputStreamToFile(input, tempFile);
            consumeInputStreamToFile(input, tempFile);
            FeatureCollection collection = new GMLStreamingFeatureCollection(tempFile);
            FeatureType type = collection.getSchema();
            AttributeGetter getter = new AttributeGetter(type);

            if (getter.exists(TRANSECT_ID_ATTR)
                    && getter.exists(DISTANCE_ATTR)
                    && getter.exists(DATE_ATTR)
                    && getter.exists(UNCY_ATTR)) {
                Map<Integer, List<Intersection>> map = new TreeMap<Integer, List<Intersection>>();
                FeatureIterator<SimpleFeature> features = collection.features();
                while (features.hasNext()) {
                    SimpleFeature feature = features.next();

                    Intersection intersection = new Intersection(feature);
                    int transectId = intersection.getTransectId();
                    if (map.containsKey(transectId)) {
                        map.get(transectId).add(intersection);
                    } else {
                        List<Intersection> pointList = new LinkedList<Intersection>();
                        pointList.add(intersection);
                        map.put(transectId, pointList);
                    }
                }

                for (int key : map.keySet()) {
                    List<Intersection> points = map.get(key);
                    buf.write("# " + key);
                    buf.newLine();
                    for (Intersection p : points) {
                        buf.write(p.toString());
                        buf.newLine();
                    }
                }
            } else if (getter.exists(TRANSECT_ID_ATTR)
                    && getter.exists(BASELINE_DIST_ATTR)
                    && getter.exists(BASELINE_ID_ATTR)
                    && getter.exists(LRR_ATTR)
                    && getter.exists(LCI_ATTR)) {
                FeatureIterator<SimpleFeature> features = collection.features();
                Map<Integer, SimpleFeature> featureMap = new TreeMap<Integer, SimpleFeature>();
                buf.write(BASELINE_DIST_ATTR + "\t" + BASELINE_ID_ATTR + "\t" + LRR_ATTR + "\t" + LCI_ATTR);
                buf.newLine();
                while (features.hasNext()) {
                    SimpleFeature feature = features.next();
                    int transectId = (Integer)getter.getValue(TRANSECT_ID_ATTR, feature);
                    featureMap.put(transectId, feature);   
                }
                for (Integer id : featureMap.keySet()) {
                    SimpleFeature feature = featureMap.get(id);
                    double dist = (Double) getter.getValue(BASELINE_DIST_ATTR, feature);
                    String featureId = (String) getter.getValue(BASELINE_ID_ATTR, feature);
                    int baseId = Integer.parseInt(featureId.split("\\.")[1]);
                    double lrr = (Double) getter.getValue(LRR_ATTR, feature);
                    double lci = (Double) getter.getValue(LCI_ATTR, feature);
                    buf.write(dist + "\t" + baseId + "\t" + lrr + "\t" + lci);
                    buf.newLine();
                }
            } else {
                throw new UnsupportedFeatureTypeException("Feature must have match defined type");
            }
            buf.flush();
            IOUtils.closeQuietly(buf);
            return new GenericFileDataBinding(new GenericFileData(outfile, "text/tsv"));
        } catch (IOException e) {
            throw new RuntimeException("Error creating temporary file", e);
        } catch (Exception e) {
            throw new RuntimeException("Unable to parse feature collection", e);
        } finally {
            IOUtils.closeQuietly(buf); // just in case
        }
    }

    @Override
    public boolean isSupportedSchema(String schema) {
        return schema == null || super.isSupportedSchema(schema);
    }

    private void consumeInputStreamToFile(InputStream input, File file) throws IOException {
        BufferedWriter writer = new BufferedWriter(new FileWriter(file));
        BufferedReader reader = new BufferedReader(new InputStreamReader(input));
        String line;
        try {
            while (null != (line = reader.readLine())) {
                writer.write(line);
            }
        } finally {
            IOUtils.closeQuietly(reader);
            IOUtils.closeQuietly(writer);
        }
    }
}
