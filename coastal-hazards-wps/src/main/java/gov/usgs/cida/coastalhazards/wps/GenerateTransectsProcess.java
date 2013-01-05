package gov.usgs.cida.coastalhazards.wps;

import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.CoordinateList;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.LineSegment;
import com.vividsolutions.jts.geom.LineString;
import com.vividsolutions.jts.geom.MultiLineString;
import gov.usgs.cida.coastalhazards.util.UTMFinder;
import gov.usgs.cida.coastalhazards.wps.exceptions.UnsupportedCoordinateReferenceSystemException;
import gov.usgs.cida.coastalhazards.wps.exceptions.UnsupportedFeatureTypeException;
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

    /* May actually want to return reference to new layer*/
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
            
            Coordinate[] pointsOnBaseline = getEvenlySpacedPointsAlongBaseline(baseline, spacing);
            FeatureCollection resultingTransects = getTransectsAtPoints(pointsOnBaseline, baseline, shorelines);
            addResultAsLayer(resultingTransects, workspace, store, layer);
            return 0;
        }
        
        private CoordinateReferenceSystem findCRS(FeatureCollection<SimpleFeatureType, SimpleFeature> simpleFeatureCollection) {
            FeatureCollection<SimpleFeatureType, SimpleFeature> shorelineFeatureCollection = simpleFeatureCollection;
            SimpleFeatureType sft = shorelineFeatureCollection.getSchema();
            CoordinateReferenceSystem coordinateReferenceSystem = sft.getCoordinateReferenceSystem();
            return coordinateReferenceSystem;
        }

        private Coordinate[] getEvenlySpacedPointsAlongBaseline(FeatureCollection<SimpleFeatureType, SimpleFeature> baseline, double spacing) {
            CoordinateList coordList = new CoordinateList();
            CoordinateReferenceSystem utmCrs = null;
            try {
                utmCrs = UTMFinder.findUTMZoneForFeatureCollection((SimpleFeatureCollection)baseline);
            }
            catch (FactoryException ex) {
                return null; // do something better than this
            }
            FeatureIterator<SimpleFeature> features = baseline.features();
            SimpleFeature feature = null;
            while (features.hasNext()) {
                feature = features.next();
                Geometry geometry = (Geometry)feature.getDefaultGeometry();
                
                Geometry utmGeometry = null;
                try {
                    MathTransform transform = CRS.findMathTransform(ACCEPTED_CRS, utmCrs, true);
                    utmGeometry = JTS.transform(geometry, transform);
                }
                catch (FactoryException ex) {
                    // TODO handle exceptions
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
                        coords = handleLineString(lineString, spacing);
                        coordList.add(coords, false);
                        break;
                    case MULTILINESTRING:
                        MultiLineString multiLineString = (MultiLineString)utmGeometry;
                        for (int i=0; i < multiLineString.getNumGeometries(); i++) {
                            lineString = (LineString)multiLineString.getGeometryN(i);
                            coords = handleLineString(lineString, spacing);
                            coordList.add(coords, false);
                        }
                        break;
                    case POINT:
                    case MULTIPOINT:
                        throw new UnsupportedFeatureTypeException("Points not supported in baseline");
                    default:
                        throw new UnsupportedFeatureTypeException("Only line type supported");
                }
                
                // cast the feature to Line2D
                // add a coordinate to set
                // walk the line until the spacing is reached
                // make another coordinate
                // keep walking
            }
            return coordList.toCoordinateArray();
        }
        
        private FeatureCollection getTransectsAtPoints(Coordinate[] pointsOnBaseline, FeatureCollection<SimpleFeatureType, SimpleFeature> baseline, FeatureCollection<SimpleFeatureType, SimpleFeature> shorelines) {
            throw new UnsupportedOperationException("Not yet implemented");
            // for each point find the normal to baseline
            // clip normal to furthest shoreline
        }
        
        private void addResultAsLayer(FeatureCollection transects, String workspace, String store, String layer) {
            throw new UnsupportedOperationException("Not yet implemented");
            // use gs:Import to add layer
            // return workspace:layerName from gs:Import
        }

        private Coordinate[] handleLineString(LineString lineString, double spacing) {
            Coordinate currentCoord = null;
            CoordinateList transectPoints = new CoordinateList();
            double accumulatedDistance = 0l;
            Coordinate lastCoord = null;
            for (Coordinate coord : lineString.getCoordinates()) {
                lastCoord = coord;
                if (currentCoord == null) {
                    currentCoord = coord;
                    transectPoints.add(coord, false);
                    continue;
                }
                double distance = coord.distance(currentCoord);
                if ((accumulatedDistance + distance) > spacing) {

                    double distanceToNewPoint = spacing - accumulatedDistance;
                    double fraction = distanceToNewPoint / distance;
                    LineSegment segment = new LineSegment(currentCoord, coord);
                    Coordinate pointAlong = segment.pointAlong(fraction);
                    transectPoints.add(pointAlong);
                    currentCoord = pointAlong;
                    accumulatedDistance = 0l;
                }
                else {
                    accumulatedDistance += distance;
                    currentCoord = coord;
                }
            }
            // TODO does this make sense?
            transectPoints.add(lastCoord);
            return transectPoints.toCoordinateArray();
        }

    }
}
