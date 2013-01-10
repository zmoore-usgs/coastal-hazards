package gov.usgs.cida.coastalhazards.util;

import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.LineString;
import com.vividsolutions.jts.geom.MultiLineString;
import com.vividsolutions.jts.geom.PrecisionModel;
import gov.usgs.cida.coastalhazards.wps.exceptions.UnsupportedFeatureTypeException;
import java.util.LinkedList;
import java.util.List;
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
    
        public static CoordinateReferenceSystem getCRSFromFeatureCollection(FeatureCollection<SimpleFeatureType, SimpleFeature> simpleFeatureCollection) {
            FeatureCollection<SimpleFeatureType, SimpleFeature> shorelineFeatureCollection = simpleFeatureCollection;
            SimpleFeatureType sft = shorelineFeatureCollection.getSchema();
            CoordinateReferenceSystem coordinateReferenceSystem = sft.getCoordinateReferenceSystem();
            return coordinateReferenceSystem;
        }
        
        /**
         * Step through feature collection, get default geometries and transform
         * Then build up a new MultiLine geometry and return
         * @param featureCollection
         * @return 
         */
        public static MultiLineString getLinesFromFeatureCollection(
                FeatureCollection<SimpleFeatureType, SimpleFeature> featureCollection,
                CoordinateReferenceSystem sourceCrs,
                CoordinateReferenceSystem targetCrs) {
            List<LineString> lines = new LinkedList<LineString>();
            MathTransform transform = null;
            GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(PrecisionModel.FLOATING));
            try {
                transform = CRS.findMathTransform(sourceCrs, targetCrs, true);
            }
            catch (FactoryException ex) {
                return null; // do something better than this
            }
            FeatureIterator<SimpleFeature> features = featureCollection.features();
            SimpleFeature feature = null;
            while (features.hasNext()) {
                feature = features.next();
                Geometry geometry = (Geometry)feature.getDefaultGeometry();
                
                Geometry utmGeometry = null;
                try {
                    utmGeometry = JTS.transform(geometry, transform);
                }
                catch (TransformException ex) {
                    // TODO handle exceptions
                }
                
                Geometries geomType = Geometries.get(utmGeometry);
                LineString lineString = null;
                Coordinate[] coords = null;
                switch (geomType) {
                    case POLYGON:
                    case MULTIPOLYGON:
                        throw new UnsupportedFeatureTypeException("Polygons not supported in baseline");
                    case LINESTRING:
                        lineString = (LineString)utmGeometry;
                        lines.add(lineString);
                        break;
                    case MULTILINESTRING:
                        MultiLineString multiLineString = (MultiLineString)utmGeometry;
                        for (int i=0; i < multiLineString.getNumGeometries(); i++) {
                            lineString = (LineString)multiLineString.getGeometryN(i);
                            lines.add(lineString);
                        }
                        break;
                    case POINT:
                    case MULTIPOINT:
                        throw new UnsupportedFeatureTypeException("Points not supported in baseline");
                    default:
                        throw new UnsupportedFeatureTypeException("Only line type supported");
                }
            }
            
            LineString[] linesArr = new LineString[lines.size()];
            lines.toArray(linesArr);
            return geometryFactory.createMultiLineString(linesArr);
        }
}
