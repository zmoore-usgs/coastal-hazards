package gov.usgs.cida.coastalhazards.wps;

import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.LineSegment;
import com.vividsolutions.jts.geom.LineString;
import com.vividsolutions.jts.geom.MultiLineString;
import com.vividsolutions.jts.geom.PrecisionModel;
import gov.usgs.cida.coastalhazards.util.Constants;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.GraphicsEnvironment;
import java.awt.Transparency;
import java.awt.image.BufferedImage;
import java.util.Map;
import java.util.UUID;
import java.util.WeakHashMap;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.geoserver.wps.gs.GeoServerProcess;
import org.geotools.coverage.grid.GridCoordinates2D;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.coverage.grid.GridCoverageFactory;
import org.geotools.coverage.grid.GridEnvelope2D;
import org.geotools.coverage.grid.GridGeometry2D;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.data.simple.SimpleFeatureIterator;
import org.geotools.geometry.DirectPosition2D;
import org.geotools.geometry.jts.Geometries;
import org.geotools.geometry.jts.JTS;
import org.geotools.geometry.jts.ReferencedEnvelope;
import org.geotools.process.factory.DescribeParameter;
import org.geotools.process.factory.DescribeProcess;
import org.geotools.process.factory.DescribeResult;
import org.geotools.referencing.CRS;
import org.geotools.util.logging.Logging;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.type.AttributeDescriptor;
import org.opengis.geometry.MismatchedDimensionException;
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import org.opengis.referencing.operation.MathTransform;
import org.opengis.referencing.operation.TransformException;

/**
 *
 * @author tkunicki
 */
@DescribeProcess(
        title = "Results Raster",
        description = "Rasterize Results by Attribute",
        version = "1.0.0")
public class ResultsRasterProcess implements GeoServerProcess {
    
    private final static Logger LOGGER = Logging.getLogger(ResultsRasterProcess.class);

    private final static int COORD_GRID_CHUNK_SIZE = 256;
    
    private Map<String, Map<String, AttributeRange>> featureAttributeRangeMap = new WeakHashMap<String, Map<String, AttributeRange>>();

    @DescribeResult(name = "coverage", description = "coverage")
    public GridCoverage2D execute(
            @DescribeParameter(name = "features", min = 1, max = 1) SimpleFeatureCollection features,
            @DescribeParameter(name = "attribute", min = 1, max = 1) String attribute,
            @DescribeParameter(name = "bbox", min = 0, max = 1) ReferencedEnvelope bbox,
            @DescribeParameter(name = "width", min = 1, max = 1) Integer width,
            @DescribeParameter(name = "height", min = 1, max = 1) Integer height,
            @DescribeParameter(name = "invert", min = 0, max = 1) Boolean invert) throws Exception {

        return new Process(features, attribute, bbox, width, height, invert == null ? false : invert).execute();

    }

    private class Process {

        private final SimpleFeatureCollection featureCollection;
        private final String attributeName;
        
        private final ReferencedEnvelope coverageEnvelope;
        private final int coverageWidth;
        private final int coverageHeight;
        private final boolean invert;
        
        private ReferencedEnvelope extent;
        private GridGeometry2D gridGeometry;
        private MathTransform featureToRasterTransform;
        private int[] coordGridX = new int[COORD_GRID_CHUNK_SIZE];
        private int[] coordGridY = new int[COORD_GRID_CHUNK_SIZE];
        
        private BufferedImage image;
        private Graphics2D graphics;

        private ColorMap<Number> colorMap;
        
        GeometryFactory geometryFactory;
        
        private Process(SimpleFeatureCollection featureCollection,
                String className,
                ReferencedEnvelope coverageEnvelope,
                int coverageWidth,
                int coverageHeight,
                boolean invert) {
            this.featureCollection = featureCollection;
            this.attributeName = className;
            this.coverageEnvelope = coverageEnvelope;
            this.coverageWidth = coverageWidth;
            this.coverageHeight = coverageHeight;
            this.invert = invert;
        }

        private GridCoverage2D execute() throws Exception {
            
            initialize();
            
            // check that initialization was successful
            if (colorMap == null) {
                return null;
            }

            SimpleFeatureIterator featureIterator = featureCollection.features();
            try {
                while (featureIterator.hasNext()) {
                    processFeature(featureIterator.next(), attributeName);
                }
            } finally {
                featureIterator.close();
            }

            GridCoverageFactory gcf = new GridCoverageFactory();
            return gcf.create(
                    getClass().getSimpleName() + "-" + UUID.randomUUID().toString(),
                    image, extent);
        }

        private void initialize() {
            
            AttributeDescriptor attributeDescriptor = featureCollection.getSchema().getDescriptor(attributeName);
            if (attributeDescriptor == null) {
                throw new RuntimeException(attributeName + " not found");
            }

            Class<?> attClass = attributeDescriptor.getType().getBinding();
            if (!Number.class.isAssignableFrom(attClass)) {
                throw new RuntimeException(attributeName + " is not numeric type");
            }

            try {
                setBounds(featureCollection, coverageEnvelope);
            } catch (TransformException ex) {
                throw new RuntimeException(ex);
            }

            createImage();

            gridGeometry = new GridGeometry2D(new GridEnvelope2D(0, 0, coverageWidth, coverageHeight), extent);
            
            // NOTE!  intern() is important, using instance as synchrnization lock, need equality by reference
            String featureCollectionId = featureCollection.getSchema().getName().getURI().intern();
//            
//            LOGGER.log(Level.INFO, "Using identifier {} for attribute value range map lookup", featureCollectionId);
            /* synchronized (featureCollectionId) */ {
//                Map<String, AttributeRange> attributeRangeMap = featureAttributeRangeMap.get(featureCollectionId);
//                if (attributeRangeMap == null) {
//                    attributeRangeMap = new WeakHashMap<String, AttributeRange>();
//                    featureAttributeRangeMap.put(featureCollectionId, attributeRangeMap);
//                    LOGGER.log(Level.INFO, "Created attribute value range map for {}", featureCollectionId);
//                }
//                AttributeRange attributeRange = attributeRangeMap.get(attributeName);
                AttributeRange attributeRange = null;
                if (attributeRange == null) {
                    LOGGER.log(Level.INFO, "Calculating attribute value range for {}:{}", new Object[] {featureCollectionId, attributeName});
                    SimpleFeatureIterator iterator = featureCollection.features();
                    if (iterator.hasNext()) {
                        double value = ((Number)iterator.next().getAttribute(attributeName)).doubleValue();
                        double minimum = value;
                        double maximum = value;
                        while (iterator.hasNext()) {
                            SimpleFeature feature = iterator.next();
                            value = ((Number)feature.getAttribute(attributeName)).doubleValue();
                            if (value > maximum) {
                                maximum = value;
                            } else if (value < minimum) {
                                minimum = value;
                            }
                        }
                        attributeRange = new AttributeRange(minimum, maximum);
//                        attributeRangeMap.put(attributeName, attributeRange);
                        LOGGER.log(Level.INFO, "Caching attribute value range for {}:{} {}",
                                new Object[] {
                                    featureCollectionId, attributeName, attributeRange
                                });
                    }
                } else {
                    LOGGER.log(Level.INFO, "Using cached attribute value range for {}:{}", new Object[] {featureCollectionId, attributeName});
                }
                if (attributeRange != null) {
                    colorMap = new ZeroInflectedJetColorMap(attributeRange, invert);
                }
            }
            
            geometryFactory = new GeometryFactory(new PrecisionModel());
        }

        private LineSegment segmentLast;
        private Object idObjectLast;
        private void processFeature(SimpleFeature feature, String attributeName) throws Exception {

            Geometry geometry = (Geometry) feature.getDefaultGeometry();
            Object attributeValue = feature.getAttribute(attributeName);
            if (!(attributeValue instanceof Number)) {
                return;
            }
            Object sceObject = feature.getAttribute(Constants.SCE_ATTR);
            Object nsdObject = feature.getAttribute(Constants.NSD_ATTR);
            Object idObject = feature.getAttribute(Constants.BASELINE_ID_ATTR);
            
            if (!(sceObject instanceof Number)) {
                return;
            }
            
            if (idObject == null) {
                return;
            }
            
            if (!((geometry instanceof LineString) || (geometry instanceof MultiLineString)) ) {
                return;
            }
            
            if (geometry.getNumGeometries() != 1 || geometry.getNumPoints() != 2) {
                return;
            }
            
            
            double sce = ((Number)sceObject).doubleValue();
            double nsd = nsdObject instanceof Number ? ((Number)nsdObject).doubleValue() : Double.NaN;

            Coordinate[] coordinates = geometry.getCoordinates();
            LineSegment transect = new LineSegment(coordinates[0], coordinates[1]);
            double tl = transect.getLength();
            
            LineSegment segment = Double.isNaN(nsd) ?
                    new LineSegment(transect.pointAlong(1d - (sce / tl)), transect.p1) :
                    new LineSegment(transect.pointAlong(nsd / tl), transect.pointAlong((nsd + sce ) / tl));
           
            if (segmentLast != null && idObject.equals(idObjectLast))  {
                
                geometry = geometryFactory.createPolygon(
                        geometryFactory.createLinearRing(
                            new Coordinate[] {
                                segment.p0,
                                segment.p1,
                                segmentLast.p1,
                                segmentLast.p0,
                                segment.p0
                        }),
                        null);
                
                if (extent.intersects(feature.getBounds().toBounds(extent.getCoordinateReferenceSystem()))) {
                    graphics.setColor(colorMap.valueToColor(((Number)attributeValue)));
                    Geometries geomType = Geometries.get(geometry);
                    switch (geomType) {
                        case MULTIPOLYGON:
                        case MULTILINESTRING:
                        case MULTIPOINT:
                            final int numGeom = geometry.getNumGeometries();
                            for (int i = 0; i < numGeom; i++) {
                                Geometry geomN = geometry.getGeometryN(i);
                                drawGeometry(Geometries.get(geomN), geomN);
                            }
                            break;
                        case POLYGON:
                        case LINESTRING:
                        case POINT:
                            drawGeometry(geomType, geometry);
                            break;
                        default:
                        // TODO:  Log!
                    }
                }
            }
            
            idObjectLast = idObject;
            segmentLast = segment;
        }

        private void setBounds(SimpleFeatureCollection features, ReferencedEnvelope requestBounds) throws TransformException {

            ReferencedEnvelope featureBounds = features.getBounds();
            if (featureBounds.getCoordinateReferenceSystem() == null) {
                // bug in GeoTools where ReprojectFeatureStore.getBounds() doesn't include CRS
                featureBounds = new ReferencedEnvelope(featureBounds, features.getSchema().getCoordinateReferenceSystem());
            }
            if (requestBounds == null) {
                requestBounds = featureBounds;
            }
            
            extent = requestBounds;

            CoordinateReferenceSystem featuresCRS = featureBounds.getCoordinateReferenceSystem();
            CoordinateReferenceSystem requestCRS = requestBounds.getCoordinateReferenceSystem();

            if (featuresCRS != null && requestCRS != null && !CRS.equalsIgnoreMetadata(requestCRS, featuresCRS)) {
                try {
                    featureToRasterTransform = CRS.findMathTransform(featuresCRS, requestCRS, true);
                } catch (Exception ex) {
                    throw new TransformException("Unable to transform features into output coordinate reference system", ex);
                }
            }
        }

        private void createImage() {

            if (GraphicsEnvironment.isHeadless()) {
                image = new BufferedImage(coverageWidth, coverageHeight, BufferedImage.TYPE_4BYTE_ABGR);
            } else {
                image = GraphicsEnvironment.
                        getLocalGraphicsEnvironment().
                        getDefaultScreenDevice().
                        getDefaultConfiguration().
                        createCompatibleImage(coverageWidth, coverageHeight, Transparency.TRANSLUCENT);
            }
            image.setAccelerationPriority(1f);
            graphics = image.createGraphics();
        }

        private void drawGeometry(Geometries geomType, Geometry geometry) throws TransformException {
            if (featureToRasterTransform != null) {
                try {
                    geometry = JTS.transform(geometry, featureToRasterTransform);
                } catch (TransformException ex) {
                    throw ex;
                } catch (MismatchedDimensionException ex) {
                    throw new RuntimeException(ex);
                }
            }

            Coordinate[] coords = geometry.getCoordinates();

            // enlarge if needed
            if (coords.length > coordGridX.length) {
                int n = coords.length / COORD_GRID_CHUNK_SIZE + 1;
                coordGridX = new int[n * COORD_GRID_CHUNK_SIZE];
                coordGridY = new int[n * COORD_GRID_CHUNK_SIZE];
            }

            // Go through coordinate array in order received
            DirectPosition2D worldPos = new DirectPosition2D();
            for (int n = 0; n < coords.length; n++) {
                worldPos.setLocation(coords[n].x, coords[n].y);
                GridCoordinates2D gridPos = gridGeometry.worldToGrid(worldPos);
                coordGridX[n] = gridPos.x;
                coordGridY[n] = gridPos.y;
            }

            switch (geomType) {
                case POLYGON:
                    graphics.fillPolygon(coordGridX, coordGridY, coords.length);
                    break;
                case LINESTRING:
                    graphics.drawPolyline(coordGridX, coordGridY, coords.length);
                    break;
                case POINT:
                    graphics.fillRect(coordGridX[0], coordGridY[0], 1, 1);
                    break;
                default:
                    // nothing to do...
            }
        }
    }
    
    public static class AttributeRange {
        public final double min;
        public final double max;
        public final double extent;
        public AttributeRange(double min, double max) {
            this.min = min;
            this.max = max;
            this.extent = max - min;
        }
        @Override
        public String toString() {
            return new StringBuilder("range=[").append(min).append(':').append(max).append(']').toString();
        }
    }
    
    public static interface ColorMap<T> {
        Color valueToColor(T value);
    }
    
    public static class ZeroInflectedJetColorMap implements ColorMap<Number> {
        
        public final static Color CLAMP_MIN = new Color(0f, 0f, 0.5f);
        public final static Color CLAMP_MAX = new Color(0.5f, 0f, 0f);
        
        public final AttributeRange range;
           
        public ZeroInflectedJetColorMap(AttributeRange range, boolean invert) {
            double absOfMax = range.max < 0 ? 0 - range.max : range.max;
            double absOfMin = range.min < 0 ? 0 - range.min : range.min;
            double maxAbs = absOfMax > absOfMin ? absOfMax : absOfMin;
            this.range = invert ?
                    new AttributeRange(maxAbs, 0 - maxAbs) :
                    new AttributeRange(0 - maxAbs, maxAbs);
        }
        
        @Override
        public Color valueToColor(Number value) {
            double coef = ((value.doubleValue() - range.min) / range.extent);
            if (coef < 0) {
                return CLAMP_MIN;
            } else if (coef > 1) {
                return CLAMP_MAX;
            } else {
                coef *= 4d;
                float r = (float)Math.min(coef - 1.5, -coef + 4.5);
                float g = (float)Math.min(coef - 0.5, -coef + 3.5);
                float b = (float)Math.min(coef + 0.5, -coef + 2.5);
                return new Color(
                    r > 1f ? 1f : r < 0f ? 0f : r,
                    g > 1f ? 1f : g < 0f ? 0f : g,
                    b > 1f ? 1f : b < 0f ? 0f : b);
            }
        }
    }
}
