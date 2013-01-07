package gov.usgs.cida.coastalhazards.wps;

import com.vividsolutions.jts.algorithm.Angle;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.CoordinateList;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.LineSegment;
import com.vividsolutions.jts.geom.LineString;
import com.vividsolutions.jts.geom.MultiLineString;
import gov.usgs.cida.coastalhazards.util.UTMFinder;
import gov.usgs.cida.coastalhazards.wps.exceptions.UnsupportedCoordinateReferenceSystemException;
import gov.usgs.cida.coastalhazards.wps.exceptions.UnsupportedFeatureTypeException;
import java.util.LinkedList;
import java.util.List;
import org.geoserver.wps.gs.GeoServerProcess;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.feature.FeatureCollection;
import org.geotools.feature.FeatureIterator;
import org.geotools.geometry.jts.Geometries;
import org.geotools.geometry.jts.JTS;
import org.geotools.process.factory.DescribeParameter;
import org.geotools.process.factory.DescribeProcess;
import org.geotools.process.factory.DescribeResult;
import org.geotools.referencing.CRS;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import org.opengis.referencing.operation.MathTransform;
import org.opengis.referencing.operation.TransformException;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@DescribeProcess(
        title = "Generate Transects",
        description = "Create a transect layer from the baseline and shorelines",
        version = "1.0.0")
public class GenerateTransectsProcess implements GeoServerProcess {
    
    private static final CoordinateReferenceSystem ACCEPTED_CRS = DefaultGeographicCRS.WGS84;

    /** May actually want to return reference to new layer
     *  Check whether we need an offset at the start of the baseline
     */
    @DescribeResult(name = "transects", description = "Layer containing Transects normal to baseline")
    public int execute(
            @DescribeParameter(name = "shorelines", min = 1, max = 1) SimpleFeatureCollection shorelines,
            @DescribeParameter(name = "baseline", min = 1, max = 1) SimpleFeatureCollection baseline,
            @DescribeParameter(name = "spacing", min = 1, max = 1) Double spacing,
            @DescribeParameter(name = "workspace", min = 1, max = 1) String workspace,
            @DescribeParameter(name = "store", min = 1, max = 1) String store,
            @DescribeParameter(name = "layer", min = 1, max = 1) String layer) throws Exception {
        return new Process(shorelines, baseline, spacing, workspace, store, layer).execute();
    }
    
    private class Process {
        private static final int HEURISTIC_LENGTH = 1000;
        
        private final FeatureCollection<SimpleFeatureType, SimpleFeature> shorelines;
        private final FeatureCollection<SimpleFeatureType, SimpleFeature> baseline;
        private final double spacing;
        private final String workspace;
        private final String store;
        private final String layer;
        
        //private final GeometryFactory geometryFactory;
        
        private Process(FeatureCollection<SimpleFeatureType, SimpleFeature> shorelines,
                FeatureCollection<SimpleFeatureType, SimpleFeature> baseline,
                double spacing,
                String workspace,
                String store,
                String layer) {
            this.shorelines = shorelines;
            this.baseline = baseline;
            this.spacing = spacing;
            this.workspace = workspace;
            this.store = store;
            this.layer = layer;
            
            // going to need this for adding Coordinates?  Transects?
            //this.geometryFactory = new GeometryFactory(new PrecisionModel(PrecisionModel.FLOATING));
        }
        
        private int execute() throws Exception {
            CoordinateReferenceSystem shorelinesCrs = findCRS(shorelines);
            CoordinateReferenceSystem baselineCrs = findCRS(baseline);
            if (!shorelinesCrs.equals(ACCEPTED_CRS)) {
                throw new UnsupportedCoordinateReferenceSystemException("Shorelines are not in accepted projection");
            }
            if (!baselineCrs.equals(ACCEPTED_CRS)) {
                throw new UnsupportedCoordinateReferenceSystemException("Baseline is not in accepted projection");
            }
            
            // probably want to get UTM zone and pass it in
            LineString[] baselineGeometry = getLinesFromFeatureCollection(baseline);
            VectorCoordAngle[] vectsOnBaseline = getEvenlySpacedOrthoVectorsAlongBaseline(baselineGeometry, spacing);
            FeatureCollection resultingTransects = getTransects(vectsOnBaseline, baseline, shorelines);
            addResultAsLayer(resultingTransects, workspace, store, layer);
            return 0;
        }
        
        private CoordinateReferenceSystem findCRS(FeatureCollection<SimpleFeatureType, SimpleFeature> simpleFeatureCollection) {
            FeatureCollection<SimpleFeatureType, SimpleFeature> shorelineFeatureCollection = simpleFeatureCollection;
            SimpleFeatureType sft = shorelineFeatureCollection.getSchema();
            CoordinateReferenceSystem coordinateReferenceSystem = sft.getCoordinateReferenceSystem();
            return coordinateReferenceSystem;
        }
        
        /**
         * Need to watch out here, the utm detection is in here, so there is the possibility of using two different projections
         * @param featureCollection
         * @return 
         */
        private LineString[] getLinesFromFeatureCollection(FeatureCollection<SimpleFeatureType, SimpleFeature> featureCollection) {
            List<LineString> lines = new LinkedList<LineString>();
            CoordinateReferenceSystem utmCrs = null;
            MathTransform transform = null;
            try {
                utmCrs = UTMFinder.findUTMZoneForFeatureCollection((SimpleFeatureCollection)featureCollection);
                transform = CRS.findMathTransform(ACCEPTED_CRS, utmCrs, true);
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
            return lines.toArray(linesArr);
        }

        private VectorCoordAngle[] getEvenlySpacedOrthoVectorsAlongBaseline(LineString[] baseline, double spacing) {
            List<VectorCoordAngle> vectList = new LinkedList<VectorCoordAngle>();
            
            for (LineString line : baseline) {
                vectList.addAll(handleLineString(line, spacing));
            }
            VectorCoordAngle[] vectArr = new VectorCoordAngle[vectList.size()];
            return vectList.toArray(vectArr);
        }
        
        private FeatureCollection getTransects(VectorCoordAngle[] vectsOnBaseline, FeatureCollection<SimpleFeatureType, SimpleFeature> baseline, FeatureCollection<SimpleFeatureType, SimpleFeature> shorelines) {
            shorelines.
            for (VectorCoordAngle vect : vectsOnBaseline) {
                LineString testLine = vect.getLineOfLength(HEURISTIC_LENGTH);
                if (testLine.intersects(shorelines)) {
                    
                }
            }
            
            throw new UnsupportedOperationException("Not yet implemented");
            // for each point find the normal to baseline
            // clip normal to furthest shoreline
        }
        
        private void addResultAsLayer(FeatureCollection transects, String workspace, String store, String layer) {
            throw new UnsupportedOperationException("Not yet implemented");
            // use gs:Import to add layer
            // return workspace:layerName from gs:Import
        }

        /**
         * Vectors point 90&deg; counterclockwise currently
         * @param lineString line along which to get vectors
         * @param spacing how often to create vectors along line
         * @return List of fancy vectors I concocted
         */
        private List<VectorCoordAngle> handleLineString(LineString lineString, double spacing) {
            Coordinate currentCoord = null;
            List<VectorCoordAngle> transectVectors = new LinkedList<VectorCoordAngle>();
            double accumulatedDistance = 0.0d;
            for (int i=0; i<lineString.getNumPoints(); i++) {
                Coordinate coord = lineString.getCoordinateN(i);
                if (currentCoord == null) {
                    currentCoord = coord;
                    Coordinate nextCoord = lineString.getCoordinateN(i+1);
                    if (nextCoord == null) {
                        throw new IllegalStateException("Line must have at least two points");
                    }
                    LineSegment segment = new LineSegment(currentCoord, nextCoord);
                    double orthogonal = segment.angle() + Angle.PI_OVER_4;
                    VectorCoordAngle vect = new VectorCoordAngle(currentCoord, orthogonal);
                    transectVectors.add(vect);
                    continue;
                }
                double distance = coord.distance(currentCoord);
                if ((accumulatedDistance + distance) > spacing) {
                    double distanceToNewPoint = spacing - accumulatedDistance;
                    double fraction = distanceToNewPoint / distance;
                    LineSegment segment = new LineSegment(currentCoord, coord);
                    Coordinate pointAlong = segment.pointAlong(fraction);
                    double orthogonal = segment.angle() + Angle.PI_OVER_4;
                    VectorCoordAngle vect = new VectorCoordAngle(pointAlong, orthogonal);
                    transectVectors.add(vect);
                    currentCoord = pointAlong;
                    accumulatedDistance = 0.0d;
                }
                else {
                    accumulatedDistance += distance;
                    currentCoord = coord;
                }
            }
            return transectVectors;
        }

    }
    
    /**
     * Creating this class because I'm having a hard time wrapping my head 
     * around polar vs. cartesian arithmetic.  Holding a cartesian coord with
     * a polar angle seemed to be my best way around it.
     */
    private class VectorCoordAngle {
        
        private Coordinate cartesianCoord;
        private double angle;
        private GeometryFactory gf;
        
        private VectorCoordAngle(Coordinate coord, double angle) {
            this.cartesianCoord = coord;
            this.angle = angle;
            this.gf = new GeometryFactory();
        }
        
        private VectorCoordAngle(double x, double y, double angle) {
            this(new Coordinate(x, y), angle);
        }
        
        private LineString getLineOfLength(double length) {
            double rise = length * Math.sin(angle);
            double run = length * Math.cos(angle);
            Coordinate endpoint = new Coordinate(cartesianCoord.x + run, cartesianCoord.y + rise);
            LineString newLineString = gf.createLineString(new Coordinate[] {cartesianCoord, endpoint});
            return newLineString;
        }
    }
}
