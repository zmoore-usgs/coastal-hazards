package gov.usgs.cida.coastalhazards.wps;

import com.vividsolutions.jts.algorithm.Angle;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.LineSegment;
import com.vividsolutions.jts.geom.LineString;
import com.vividsolutions.jts.geom.MultiLineString;
import com.vividsolutions.jts.geom.prep.PreparedGeometry;
import com.vividsolutions.jts.geom.prep.PreparedGeometryFactory;
import com.vividsolutions.jts.index.strtree.STRtree;
import gov.usgs.cida.coastalhazards.util.BaselineDistanceAccumulator;
import gov.usgs.cida.coastalhazards.util.CRSUtils;
import static gov.usgs.cida.coastalhazards.util.Constants.*;
import gov.usgs.cida.coastalhazards.util.Constants.Orientation;
import gov.usgs.cida.coastalhazards.util.GeomAsserts;
import gov.usgs.cida.coastalhazards.util.LayerImportUtil;
import gov.usgs.cida.coastalhazards.util.UTMFinder;
import gov.usgs.cida.coastalhazards.wps.exceptions.PoorlyDefinedBaselineException;
import gov.usgs.cida.coastalhazards.wps.exceptions.UnsupportedCoordinateReferenceSystemException;
import gov.usgs.cida.coastalhazards.wps.geom.Intersection;
import gov.usgs.cida.coastalhazards.wps.geom.ShorelineFeature;
import gov.usgs.cida.coastalhazards.wps.geom.ShorelineSTRTreeBuilder;
import gov.usgs.cida.coastalhazards.wps.geom.Transect;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.ListIterator;
import java.util.Map;
import org.geoserver.catalog.Catalog;
import org.geoserver.catalog.ProjectionPolicy;
import org.geoserver.wps.gs.GeoServerProcess;
import org.geoserver.wps.gs.ImportProcess;
import org.geotools.data.DataUtilities;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.data.simple.SimpleFeatureIterator;
import org.geotools.feature.FeatureCollection;
import org.geotools.process.factory.DescribeParameter;
import org.geotools.process.factory.DescribeProcess;
import org.geotools.process.factory.DescribeResult;
import org.geotools.referencing.CRS;
import org.joda.time.DateTime;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.referencing.crs.CoordinateReferenceSystem;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@DescribeProcess(
        title = "Generate Transects and Intersections",
        description = "Create a transect layer from the baseline and shorelines",
        version = "1.0.0")
public class CreateTransectsAndIntersectionsProcess implements GeoServerProcess {

    private LayerImportUtil importer;
    
    public CreateTransectsAndIntersectionsProcess(ImportProcess importProcess, Catalog catalog) {
        this.importer = new LayerImportUtil(catalog, importProcess);
    }

    /** May actually want to return reference to new layer
     *  Check whether we need an offset at the start of the baseline
     */
    @DescribeResult(name = "transects", description = "Layer containing Transects normal to baseline")
    public String execute(
            @DescribeParameter(name = "shorelines", min = 1, max = 1) SimpleFeatureCollection shorelines,
            @DescribeParameter(name = "baseline", min = 1, max = 1) SimpleFeatureCollection baseline,
            @DescribeParameter(name = "spacing", min = 1, max = 1) Double spacing,
            @DescribeParameter(name = "smoothing", min = 0, max = 1) Double smoothing, 
            @DescribeParameter(name = "farthest", min = 0, max = 1) Boolean farthest,
            @DescribeParameter(name = "workspace", min = 1, max = 1) String workspace,
            @DescribeParameter(name = "store", min = 1, max = 1) String store,
            @DescribeParameter(name = "transectLayer", min = 1, max = 1) String transectLayer,
            @DescribeParameter(name = "intersectionLayer", min = 1, max = 1) String intersectionLayer) throws Exception {
        // defaults
        if (smoothing == null) { smoothing = 0d; }
        return new Process(shorelines, baseline, spacing, smoothing, farthest, workspace, store, transectLayer, intersectionLayer).execute();
    }
    
    protected class Process {
        private static final double MIN_TRANSECT_LENGTH = 50.0d; // meters
        private static final double TRANSECT_PADDING = 5.0d; // meters
        
        private final FeatureCollection<SimpleFeatureType, SimpleFeature> shorelineFeatureCollection;
        private final FeatureCollection<SimpleFeatureType, SimpleFeature> baselineFeatureCollection;
        private final double spacing;
        private final double smoothing;
        private final boolean useFarthest;
        private final String workspace;
        private final String store;
        private final String transectLayer;
        private final String intersectionLayer;
        
        private CoordinateReferenceSystem utmCrs;
        
        private STRtree strTree;
        private SimpleFeatureType transectFeatureType;
        private SimpleFeatureType intersectionFeatureType;
        private PreparedGeometry preparedShorelines;
        
        private double guessTransectLength;
        private int transectId;
        
        private SimpleFeatureCollection resultTransectsCollection;
        private SimpleFeatureCollection resultIntersectionsCollection;
        
        protected Process(FeatureCollection<SimpleFeatureType, SimpleFeature> shorelines,
                FeatureCollection<SimpleFeatureType, SimpleFeature> baseline,
                double spacing,
                double smoothing,
                Boolean farthest,
                String workspace,
                String store,
                String transectLayer,
                String intersectionLayer) {
            this.shorelineFeatureCollection = shorelines;
            this.baselineFeatureCollection = baseline;
            this.spacing = spacing;
            this.smoothing = smoothing;
            
            if (farthest == null) {
                this.useFarthest = false;
            } else {
                this.useFarthest = farthest;
            }
            
            this.workspace = workspace;
            this.store = store;
            this.transectLayer = transectLayer;
            this.intersectionLayer = intersectionLayer;
            
            this.guessTransectLength = 500.0d; // start guess at .5km
            this.transectId = 0; // start ids at 0
            
            // Leave these null to start, they get populated after error checks occur (somewhat expensive)
            this.strTree = null;
            this.transectFeatureType = null;
            this.intersectionFeatureType = null;
            this.preparedShorelines = null;
            
            this.resultTransectsCollection = null;
            this.resultIntersectionsCollection = null;
        }
        
        protected String execute() throws Exception {
            importer.checkIfLayerExists(workspace, transectLayer);
            importer.checkIfLayerExists(workspace, intersectionLayer);
            
            CoordinateReferenceSystem shorelinesCrs = CRSUtils.getCRSFromFeatureCollection(shorelineFeatureCollection);
            CoordinateReferenceSystem baselineCrs = CRSUtils.getCRSFromFeatureCollection(baselineFeatureCollection);
            if (!CRS.equalsIgnoreMetadata(shorelinesCrs, REQUIRED_CRS_WGS84)) {
                throw new UnsupportedCoordinateReferenceSystemException("Shorelines are not in accepted projection");
            }
            if (!CRS.equalsIgnoreMetadata(baselineCrs, REQUIRED_CRS_WGS84)) {
                throw new UnsupportedCoordinateReferenceSystemException("Baseline is not in accepted projection");
            }
            this.utmCrs = UTMFinder.findUTMZoneCRSForCentroid((SimpleFeatureCollection)shorelineFeatureCollection);
            if (this.utmCrs == null) {
                throw new IllegalStateException("Must have usable UTM zone to continue");
            }
            
            SimpleFeatureCollection transformedShorelines = CRSUtils.transformFeatureCollection(shorelineFeatureCollection, REQUIRED_CRS_WGS84, utmCrs);
            
            // TODO Will need to be able to pull seaward vs. shoreward from attrs (maybe Map<Integer, LineString>)
            // for now assume seaward
            SimpleFeatureCollection transformedBaselines = CRSUtils.transformFeatureCollection(baselineFeatureCollection, REQUIRED_CRS_WGS84, utmCrs);
            MultiLineString shorelineGeometry = CRSUtils.getLinesFromFeatureCollection(transformedShorelines);
            MultiLineString baselineGeometry = CRSUtils.getLinesFromFeatureCollection(transformedBaselines);
            this.strTree = new ShorelineSTRTreeBuilder(transformedShorelines).build();
            
            this.transectFeatureType = Transect.buildFeatureType(utmCrs);
            this.intersectionFeatureType = Intersection.buildSimpleFeatureType(transformedShorelines, utmCrs);
            
            this.preparedShorelines = PreparedGeometryFactory.prepare(shorelineGeometry);
            GeomAsserts.assertBaselinesDoNotCrossShorelines(preparedShorelines, baselineGeometry);
            
            Transect[] vectsOnBaseline = getEvenlySpacedOrthoVectorsAlongBaseline(transformedBaselines, shorelineGeometry, spacing);
            
            trimTransectsToFeatureCollection(vectsOnBaseline, transformedShorelines);
            String createdTransectLayer = importer.importLayer(resultTransectsCollection, workspace, store, transectLayer, utmCrs, ProjectionPolicy.REPROJECT_TO_DECLARED);
            String createdIntersectionLayer = importer.importLayer(resultIntersectionsCollection, workspace, store, intersectionLayer, utmCrs, ProjectionPolicy.REPROJECT_TO_DECLARED);
            return createdTransectLayer + "," + createdIntersectionLayer;
        }

        protected Transect[] getEvenlySpacedOrthoVectorsAlongBaseline(SimpleFeatureCollection baseline, MultiLineString shorelines, double spacing) {
            List<Transect> vectList = new LinkedList<Transect>();
            SimpleFeatureIterator features = baseline.features();
            
            BaselineDistanceAccumulator accumulator = new BaselineDistanceAccumulator();
            while (features.hasNext()) {
                SimpleFeature feature = features.next();
                Orientation orientation = Orientation.fromAttr((String)feature.getAttribute(BASELINE_ORIENTATION_ATTR));
                if (orientation == Orientation.UNKNOWN) {
                    // default to seaward
                    orientation = Orientation.SEAWARD;
                }
                String baselineId = feature.getID();
                
                MultiLineString lines = CRSUtils.getLinesFromFeature(feature);
                for (int i=0; i<lines.getNumGeometries(); i++) { // probably only one Linestring
                    LineString line = (LineString)lines.getGeometryN(i);
                    updateTransectLengthGuess(shorelines, line);
                    int direction = shorelineDirection(line, shorelines);
                    
                    double baseDist = accumulator.accumulate(line);

                    vectList.addAll(handleLineString(line, spacing, orientation, direction, baselineId, baseDist)); // rather than SEAWARD, get from baseline feature
                }
            }
            Transect[] vectArr = new Transect[vectList.size()];
            return vectList.toArray(vectArr);
        }
        
        /**
         * 
         * @param vectsOnBaseline
         * @param baseline
         * @param shorelines
         * @return 
         */
        protected void trimTransectsToFeatureCollection(Transect[] vectsOnBaseline, SimpleFeatureCollection shorelines) {
            if (vectsOnBaseline.length == 0) {
                return;
            } 
            List<SimpleFeature> transectFeatures = new LinkedList<SimpleFeature>();
            List<SimpleFeature> intersectionFeatures = new LinkedList<SimpleFeature>();
            
            // add an extra 1k for good measure
            guessTransectLength += 1000.0d;
            
            for (Transect transect : vectsOnBaseline) {
                transect.setLength(guessTransectLength);
                LineString testLine = transect.getLineString();
                if (!preparedShorelines.intersects(testLine)) {
                    continue; // don't draw if it doesn't cross
                }
                
                Map<DateTime, Intersection> allIntersections = Intersection.calculateIntersections(transect, strTree, useFarthest);
                double transectLength = Intersection.absoluteFarthest(MIN_TRANSECT_LENGTH, allIntersections.values());
                transect.setLength(transectLength + TRANSECT_PADDING);
                SimpleFeature feature = transect.createFeature(transectFeatureType);
                transectFeatures.add(feature);
                
                for (Intersection intersection : allIntersections.values()) {
                    // do I need to worry about order?
                    intersectionFeatures.add(intersection.createFeature(intersectionFeatureType));
                }
            }
            resultTransectsCollection = DataUtilities.collection(transectFeatures);
            resultIntersectionsCollection = DataUtilities.collection(intersectionFeatures);
        }

        /**
         * Vectors point 90&deg; counterclockwise currently
         * @param lineString line along which to get vectors
         * @param spacing how often to create vectors along line
         * @return List of fancy vectors I concocted
         */
        protected List<Transect> handleLineString(LineString lineString, 
                double spacing, 
                Orientation orientation, 
                int orthoDirection,
                String baselineId,
                double accumulatedBaselineLength) {
            List<LineSegment> intervals = findIntervals(lineString, true, spacing, smoothing);
            List<Transect> transects = new ArrayList<Transect>(intervals.size());
            for (LineSegment interval : intervals) {
                transects.add(
                    Transect.generatePerpendicularVector(
                        interval.p0, interval, orientation, transectId++, baselineId, accumulatedBaselineLength, orthoDirection));
                accumulatedBaselineLength += spacing;
            }
            return transects;
        }
        
        /**
         * Gives direction to point transects as long as baseline is good
         * This is pretty much just hacked up at this point
         * Any better way of doing this would be smart
         * @param baseline
         * @param shorelines
         * @return 
         */
        protected int shorelineDirection(LineString baseline, Geometry shorelines) {
            Coordinate[] coordinates = baseline.getCoordinates();
            int n = coordinates.length;
            LineSegment a = new LineSegment(coordinates[0], coordinates[1]);
            LineSegment b = new LineSegment(coordinates[n-1], coordinates[n-2]);
            LineSegment m = null;
            if (n > 2) {
                m = new LineSegment(coordinates[(int)n/2], coordinates[(int)n/2+1]);
            }
            int[] counts = new int[] { 0, 0 };
            Transect vector =
                    Transect.generatePerpendicularVector(coordinates[0], a, Orientation.UNKNOWN, 0, "0", Double.NaN, Angle.CLOCKWISE);
            counts[0] += countIntersections(vector);
            vector.rotate180Deg();
            counts[1] += countIntersections(vector);
            
            vector = Transect.generatePerpendicularVector(coordinates[n-1], b, Orientation.UNKNOWN, 0, "0", Double.NaN, Angle.COUNTERCLOCKWISE);
            counts[0] += countIntersections(vector);
            vector.rotate180Deg();
            counts[1] += countIntersections(vector);
            
            if (m != null) {
                vector = Transect.generatePerpendicularVector(coordinates[(int)n/2], m, Orientation.UNKNOWN, 0, "0", Double.NaN, Angle.CLOCKWISE);
                counts[0] += countIntersections(vector);
                vector.rotate180Deg();
                counts[1] += countIntersections(vector);
            }
            
            if (counts[0] > counts[1]) {
                return Angle.CLOCKWISE;
            }
            else if (counts[0] < counts[1]) {
                return Angle.COUNTERCLOCKWISE;
            }
            throw new PoorlyDefinedBaselineException("Baseline is ambiguous, transect direction cannot be determined");
        }
        
        private int countIntersections(Transect transect) {
            transect.setLength(guessTransectLength);
            LineString line = transect.getLineString();
            int count = 0;
            List<ShorelineFeature> possibleIntersections = strTree.query(line.getEnvelopeInternal());
            for (ShorelineFeature shoreline : possibleIntersections) {
                if (shoreline.segment.intersects(line)) {
                    count++;
                }
            }
            return count;
        }
        
        protected void updateTransectLengthGuess(MultiLineString shorelines, LineString baseline) {
            while (!shorelines.isWithinDistance(baseline.getStartPoint(), guessTransectLength) ||
                    !shorelines.isWithinDistance(baseline.getEndPoint(), guessTransectLength)) {
                guessTransectLength *= 2;
            }
        }
    }
    
    // NOTE: For each segment p0 is interval coord, with p1 = p0 + direction of segment as unit vector.
    public static List<LineSegment> findIntervals(LineString lineString, boolean includeOrigin, double interval) {
        LinkedList<LineSegment> intervalList = new LinkedList<LineSegment>();
        List<LineSegment> segmentList = toLineSegments(lineString);       
        double progress = 0;
        double next = includeOrigin ? 0 : interval;
        for (LineSegment segment : segmentList) {
            double segmentLength = segment.getLength();
            if (progress + segmentLength >= next) {
                double segmentAngle = segment.angle();
                double segmentOffset;
                for (segmentOffset = next - progress; segmentOffset <= segmentLength; segmentOffset += interval, next += interval) {
                    Coordinate c = segment.pointAlong(segmentOffset / segmentLength);
                    intervalList.add(new LineSegment(
                            c.x, c.y, c.x + Math.cos(segmentAngle), c.y + Math.sin(segmentAngle)));
                }
            }
            progress += segmentLength;
        }
        return intervalList;
    }
    
    // NOTE: For each segment p0 is interval coord, with p1 = p0 + direction of segment as unit vector.
    public static List<LineSegment> findIntervals(LineString lineString, boolean includeOrigin, double interval, double smoothing) {
        if (smoothing <= 0) {
            return findIntervals(lineString, includeOrigin, interval);
        }
        LinkedList<LineSegment> intervalList = new LinkedList<LineSegment>();
        List<LineSegment> segmentList = toLineSegments(lineString);     
        double progress = 0;
        double next = includeOrigin ? 0 : interval;
        final double half = smoothing / 2d;
        int index = 0;
        final int indexMax = segmentList.size() -1;
        for (LineSegment segment : segmentList) {
            final double length = segment.getLength();
            if (progress + length >= next) {
                double offset;
                for (offset = next - progress; offset <= length; offset += interval, next += interval) {
                    Coordinate intervalCenter = segment.pointAlong(offset / length);
                    double low = offset - half; // offset from p0 of current segment for low bound of smoothed segment (may be < 0)
                    double high = offset + half; // offset from p0 of current segment for high bound of smoothed segment (may be > length)
                    double angle;
                    if (low < 0 || high > length) {
                        Coordinate intervalLow = low < 0 && index > 0 ?
                                    // find distance along line string from end of *last* segment (removing distance along current segment);
                                    fromEnd(segmentList.subList(0, index - 1), 0 - low, false) :
                                    // otherwise project along segment
                                    segment.pointAlong(low / length);
                        Coordinate intervalHigh = high > length && index < indexMax ?
                                    // find distance along line string from end of *last* segment (removing distance along current segment);
                                    fromStart(segmentList.subList(index + 1, indexMax), high - length, false) :
                                    // otherwise project along segment
                                    segment.pointAlong(high / length);
                        LineSegment smoothSegment = new LineSegment(intervalLow, intervalHigh);
                        angle = smoothSegment.angle();
                    } else {
                        angle = segment.angle();
                    }
                    intervalList.add(new LineSegment(
                        intervalCenter.x, intervalCenter.y, intervalCenter.x + Math.cos(angle), intervalCenter.y + Math.sin(angle)));
                }
            }
            index++;
            progress += length;
        }
        return intervalList;
    }
    
    // Extracts consituent segments from line string
    public static List<LineSegment> toLineSegments(LineString line) {
        int cCount = line.getNumPoints();
        List<LineSegment> segments = new ArrayList<LineSegment>(cCount -1);
        for(int cIndex = 1; cIndex < cCount; ++cIndex) {
            segments.add(new LineSegment(line.getCoordinateN(cIndex -1), line.getCoordinateN(cIndex)));
        }
        return segments;
    }
        
    static Coordinate fromStart(LineString lineString, double distance, boolean clamp) {
        return fromStart(toLineSegments(lineString), distance, clamp);
    }
    
    static Coordinate fromStart(List<LineSegment> lineSegments, double distance, boolean clamp) {
        ListIterator<LineSegment> iterator = lineSegments.listIterator();
        double progress = 0;
        while (iterator.hasNext()) {
            final LineSegment segement = iterator.next();
            final double length = segement.getLength();
            final double offset = distance - progress;
            if (offset <= length) {
                return segement.pointAlong(offset / length);
            }
            progress += length;
        }
        // special case handling, distance is longer than line
        LineSegment last = lineSegments.get(lineSegments.size() - 1);
        // clamp or project?
        if (clamp) {
            // end of last segment in list
            return last.getCoordinate(1);
        } else {
            double overflow = distance - progress;
            // project along last line segment, add 1 since this method
            // uses fraction-of-segment-length as distance from p0 and our
            // overflow is distance from p1
            return last.pointAlong(1d + (overflow / last.getLength()));
        }
    }
    
    static Coordinate fromEnd(LineString lineString, double distance, boolean clamp) {
        return fromEnd(toLineSegments(lineString), distance, clamp);
    }
    
    static Coordinate fromEnd(List<LineSegment> lineSegments, double distance, boolean clamp) {
        ListIterator<LineSegment> iterator = lineSegments.listIterator(lineSegments.size());
        double progress = 0;
        while (iterator.hasPrevious()) {
            final LineSegment segement = iterator.previous();
            final double length = segement.getLength();
            final double offset = distance - progress;
            if (offset <= length) {
                // since method is fraction from p0, but offset is distance from p1.
                return segement.pointAlong(1d - (offset / length));
            }
            progress += length;
        }
        // special case handling, distance is longer than line
        LineSegment first = lineSegments.get(0);
        // clamp or project?
        if (clamp) {
            // start of first segment in list
            return first.getCoordinate(0);
        } else {
            double overflow = distance - progress;
            // project along first line segment, negate since this method
            // uses fraction-of-segment-length as distance from p0 towards p1 and our
            // overflow is distance from p0 (in p1 to p0 direction)
            return first.pointAlong(-(overflow / first.getLength()));
        }
    }
}
