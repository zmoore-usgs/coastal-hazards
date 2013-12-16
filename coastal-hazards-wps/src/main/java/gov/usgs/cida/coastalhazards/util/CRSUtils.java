package gov.usgs.cida.coastalhazards.util;

import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.LineString;
import com.vividsolutions.jts.geom.MultiLineString;
import com.vividsolutions.jts.geom.PrecisionModel;
import gov.usgs.cida.coastalhazards.wps.exceptions.UnsupportedFeatureTypeException;
import java.util.LinkedList;
import java.util.List;
import org.geotools.data.DataUtilities;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.feature.FeatureCollection;
import org.geotools.feature.FeatureIterator;
import org.geotools.geometry.jts.Geometries;
import org.geotools.geometry.jts.JTS;
import org.geotools.referencing.CRS;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import org.opengis.referencing.operation.MathTransform;
import org.opengis.referencing.operation.TransformException;

/**
 *
 * @author jiwalker
 */
public class CRSUtils {
    
    private static GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(PrecisionModel.FLOATING));

    public static CoordinateReferenceSystem getCRSFromFeatureCollection(FeatureCollection<SimpleFeatureType, SimpleFeature> simpleFeatureCollection) {
        FeatureCollection<SimpleFeatureType, SimpleFeature> shorelineFeatureCollection = simpleFeatureCollection;
        SimpleFeatureType sft = shorelineFeatureCollection.getSchema();
        CoordinateReferenceSystem coordinateReferenceSystem = sft.getCoordinateReferenceSystem();
        return coordinateReferenceSystem;
    }

    /**
     * Step through feature collection, get default geometries and transform
     * Then build up a new MultiLine geometry and return
     *
     * @param featureCollection
     * @return
     */
    public static MultiLineString transformAndGetLinesFromFeatureCollection(
            FeatureCollection<SimpleFeatureType, SimpleFeature> featureCollection,
            CoordinateReferenceSystem sourceCrs,
            CoordinateReferenceSystem targetCrs) {
        SimpleFeatureCollection transformed = transformFeatureCollection(featureCollection, sourceCrs, targetCrs);
        return getLinesFromFeatureCollection(transformed);

    }

    /**
     * Returns a SimpleFeatureCollection with transformed default geometry
     *
     * @param featureCollection source feature collection (features may be
     * modified)
     * @param sourceCrs original coordinate reference system
     * @param targetCrs new coordinate reference system
     * @return new SimpleFeatureCollection
     */
    public static SimpleFeatureCollection transformFeatureCollection(FeatureCollection<SimpleFeatureType, SimpleFeature> featureCollection,
            CoordinateReferenceSystem sourceCrs,
            CoordinateReferenceSystem targetCrs) {
        List<SimpleFeature> sfList = new LinkedList<SimpleFeature>();
        MathTransform transform = null;
        try {
            transform = CRS.findMathTransform(sourceCrs, targetCrs, true);
        } catch (FactoryException ex) {
            return null; // do something better than this
        }
		
        FeatureIterator<SimpleFeature> features = null;
		try {
			features = featureCollection.features();
			SimpleFeature feature = null;
			while (features.hasNext()) {
				feature = features.next();
				Geometry geometry = (Geometry) feature.getDefaultGeometry();

				Geometry utmGeometry = null;
				try {
					utmGeometry = JTS.transform(geometry, transform);
				} catch (TransformException ex) {
					// TODO handle exceptions
				}
				feature.setDefaultGeometry(utmGeometry);
				sfList.add(feature);
			}
		} finally {
			if (null != features) {
				features.close();
			}
		}

        return DataUtilities.collection(sfList);
    }

    public static MultiLineString getLinesFromFeatureCollection(SimpleFeatureCollection collection) {
        List<LineString> lines = new LinkedList<LineString>();
		
        FeatureIterator<SimpleFeature> features = null;
		try {
			features = collection.features();
			SimpleFeature feature = null;
			while (features.hasNext()) {
				feature = features.next();
				List<LineString> geomList = getListFromFeature(feature);
				lines.addAll(geomList);
			}
		} finally {
			if (null != features) {
				features.close();
			}
		}
        
        LineString[] linesArr = new LineString[lines.size()];
        lines.toArray(linesArr);
        return geometryFactory.createMultiLineString(linesArr);
    }

    public static MultiLineString getLinesFromFeature(SimpleFeature feature) {
        List<LineString> lines = getListFromFeature(feature);
        LineString[] linesArr = new LineString[lines.size()];
        lines.toArray(linesArr);
        return geometryFactory.createMultiLineString(linesArr);
    }

    private static List<LineString> getListFromFeature(SimpleFeature feature) {
        List<LineString> lines = new LinkedList<LineString>();
        Geometry geometry = (Geometry) feature.getDefaultGeometry();
        Geometries geomType = Geometries.get(geometry);
        LineString lineString = null;
        switch (geomType) {
            case POLYGON:
            case MULTIPOLYGON:
                throw new UnsupportedFeatureTypeException("Polygons not supported");
            case LINESTRING:
                lineString = (LineString) geometry;
                lines.add(lineString);
                break;
            case MULTILINESTRING:
                MultiLineString multiLineString = (MultiLineString) geometry;
                for (int i = 0; i < multiLineString.getNumGeometries(); i++) {
                    lineString = (LineString) multiLineString.getGeometryN(i);
                    lines.add(lineString);
                }
                break;
            case POINT:
            case MULTIPOINT:
                throw new UnsupportedFeatureTypeException("Points not supported");
            default:
                throw new UnsupportedFeatureTypeException("Only line type supported");
        }
        return lines;
    }
}
