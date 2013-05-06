package gov.usgs.cida.coastalhazards.wps;

import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.LineSegment;
import gov.usgs.cida.coastalhazards.util.Constants;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.GraphicsEnvironment;
import java.awt.Transparency;
import java.awt.image.BufferedImage;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.Map;
import java.util.UUID;
import java.util.WeakHashMap;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.apache.commons.lang.StringUtils;
import org.geoserver.wps.gs.GeoServerProcess;
import org.geotools.coverage.grid.GridCoordinates2D;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.coverage.grid.GridCoverageFactory;
import org.geotools.coverage.grid.GridEnvelope2D;
import org.geotools.coverage.grid.GridGeometry2D;
import org.geotools.coverage.grid.InvalidGridGeometryException;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.data.simple.SimpleFeatureIterator;
import org.geotools.geometry.DirectPosition2D;
import org.geotools.geometry.jts.JTS;
import org.geotools.geometry.jts.ReferencedEnvelope;
import org.geotools.process.factory.DescribeParameter;
import org.geotools.process.factory.DescribeProcess;
import org.geotools.process.factory.DescribeResult;
import org.geotools.referencing.CRS;
import org.geotools.util.logging.Logging;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.type.AttributeDescriptor;
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
    
    private Map<String, Map<String, AttributeRange>> featureAttributeRangeMap = new WeakHashMap<String, Map<String, AttributeRange>>();

    @DescribeResult(name = "coverage", description = "coverage")
    public GridCoverage2D execute(
            @DescribeParameter(name = "features", min = 1, max = 1) SimpleFeatureCollection features,
            @DescribeParameter(name = "attribute", min = 0, max = 1) String attribute,
            @DescribeParameter(name = "bbox", min = 0, max = 1) ReferencedEnvelope bbox,
            @DescribeParameter(name = "width", min = 1, max = 1) Integer width,
            @DescribeParameter(name = "height", min = 1, max = 1) Integer height,
            @DescribeParameter(name = "invert", min = 0, max = 1) Boolean invert) throws Exception {

            if (StringUtils.isBlank(attribute)) { attribute = "LRR"; } 
            if (invert == null) { invert = (attribute.equalsIgnoreCase("LRR")); }
        return new Process(features, attribute, bbox, width, height, invert).execute();

    }

    private class Process {

        private final SimpleFeatureCollection featureCollection;
        private final String attributeName;
        
        private final ReferencedEnvelope coverageEnvelope;
        private final int coverageWidth;
        private final int coverageHeight;
        
        private final boolean invert;
        
        private GridGeometry2D gridGeometry;
        private LineSegmentTransform lineSegmentTransform;
        
        private BufferedImage image;
        private Graphics2D graphics;

        private ColorMap<Number> colorMap;
        
        Map<Integer, LinkedList<SimpleFeature>> baselineFeaturesMap;
        
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

            for (LinkedList<SimpleFeature> baselineFeatures : baselineFeaturesMap.values()) {
                processBaselineFeatures(baselineFeatures);
            }

            GridCoverageFactory gcf = new GridCoverageFactory();
            return gcf.create(
                    getClass().getSimpleName() + "-" + UUID.randomUUID().toString(),
                    image, coverageEnvelope);
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
                checkTransform();
            } catch (TransformException ex) {
                throw new RuntimeException("Unable to transform", ex);
            }

            createImage();

            gridGeometry = new GridGeometry2D(new GridEnvelope2D(0, 0, coverageWidth, coverageHeight), coverageEnvelope);

            String featureCollectionId = featureCollection.getSchema().getName().getURI();

            baselineFeaturesMap = new LinkedHashMap<Integer, LinkedList<SimpleFeature>>();
            
            AttributeRange attributeRange = null;
            
            LOGGER.log(Level.INFO, "Calculating attribute value range for {}:{}", new Object[] {featureCollectionId, attributeName});
            SimpleFeatureIterator iterator = null;
            try {
                iterator = featureCollection.features();
                double minimum = Double.MAX_VALUE;
                double maximum = -Double.MAX_VALUE;
                while (iterator.hasNext()) {
                    SimpleFeature feature = iterator.next();
                    double value = ((Number)feature.getAttribute(attributeName)).doubleValue();
                    if (Math.abs(value) < 1e10) {
                        if (value > maximum) {
                            maximum = value;
                        }
                        if (value < minimum) {
                            minimum = value;
                        }
                    }

                    Object baselineIdObject = feature.getAttribute(Constants.BASELINE_ID_ATTR);
                    // this is need for older files w/o baseline ID, null is a valid map key
                    Integer baselineId = baselineIdObject instanceof Number ? ((Number)baselineIdObject).intValue() : null;
                    LinkedList<SimpleFeature> baselineFeatures = baselineFeaturesMap.get(baselineId);
                    if (baselineFeatures == null) {
                        baselineFeatures = new LinkedList<SimpleFeature>();
                        baselineFeaturesMap.put(baselineId, baselineFeatures);
                    }
                    baselineFeatures.add(feature);
                }
                if (minimum < maximum) {
                    attributeRange = new AttributeRange(minimum, maximum);
                    LOGGER.log(Level.INFO, "Attribute value range for {}:{} {}",
                            new Object[] {
                                featureCollectionId, attributeName, attributeRange
                            });
                }
            } finally {
                if (iterator != null) {
                    iterator.close();
                }
            }
            if (attributeRange != null) {
                attributeRange = (attributeRange.min < 0) ?
                        attributeRange.zeroInflect(invert) :
                        invert ? 
                            new AttributeRange(attributeRange.max, 0) :
                            new AttributeRange(0, attributeRange.max);
                colorMap = new JetColorMap(attributeRange);
            }
        }
        
        private void checkTransform() throws TransformException {

            CoordinateReferenceSystem featuresCRS = featureCollection.getSchema().getCoordinateReferenceSystem();
            CoordinateReferenceSystem requestCRS = coverageEnvelope.getCoordinateReferenceSystem();

            if (featuresCRS != null && requestCRS != null && !CRS.equalsIgnoreMetadata(requestCRS, featuresCRS)) {
                try {
                    lineSegmentTransform = new JTSTransform(CRS.findMathTransform(featuresCRS, requestCRS, true));
                } catch (Exception ex) {
                    throw new TransformException("Unable to transform features into output coordinate reference system", ex);
                }
            } else {
                lineSegmentTransform = new PassThroughTransform();
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

        private void processBaselineFeatures(LinkedList<SimpleFeature> baselineFeatures) throws Exception {

            Iterator<SimpleFeature> iterator = baselineFeatures.iterator();
            
            SimpleFeature featureCurrent = iterator.next();
            LineSegment segmentLast = extractShorelineInterect(featureCurrent);
            LineSegment segmentLastTransformed = lineSegmentTransform.transform(segmentLast);
            Color colorLast = extractColor(featureCurrent);
            
            while (iterator.hasNext()) {
                
                featureCurrent = iterator.next();
                
                LineSegment segmentCurrent = extractShorelineInterect(featureCurrent);
                LineSegment segmentCurrentTransformed = lineSegmentTransform.transform(segmentCurrent);
                Color colorCurrent = extractColor(featureCurrent);
                
                LineSegment midpointSegment = new LineSegment(
                        new LineSegment(segmentCurrent.p0, segmentLast.p0).pointAlong(0.5),
                        new LineSegment(segmentCurrent.p1, segmentLast.p1).pointAlong(0.5));
                LineSegment midpointSegmentTransformed = lineSegmentTransform.transform(midpointSegment);
                
                if (colorLast != null) {
                    graphics.setColor(colorLast);
                    drawPolygon(segmentLastTransformed, midpointSegmentTransformed);
                }
                if (colorCurrent != null) {
                   graphics.setColor(colorCurrent);
                   drawPolygon(midpointSegmentTransformed, segmentCurrentTransformed);
                }

                segmentLast = segmentCurrent;
                segmentLastTransformed = segmentCurrentTransformed;
                colorLast = colorCurrent;
            }
        }
        
        private LineSegment extractShorelineInterect(SimpleFeature feature) {

            Object sceObject = ((Double)feature.getAttribute(Constants.SCE_ATTR));
            Object nsdObject = feature.getAttribute(Constants.NSD_ATTR);
            
            Geometry geometry = (Geometry) feature.getDefaultGeometry();
            Coordinate[] coordinates = geometry.getCoordinates();
            LineSegment segment = new LineSegment(coordinates[0], coordinates[1]);
            
            double length = segment.getLength();
            
            double sce = sceObject instanceof Number ? ((Number)sceObject).doubleValue() : Double.NaN;
            double nsd = nsdObject instanceof Number ? ((Number)nsdObject).doubleValue() : Double.NaN;
            
            if (sce == sce && nsd == nsd) {
                 return extractShorelineInterect(segment, nsd, sce);
            } else {
                if (sce != sce && nsd != nsd) {
                    return segment;
                }
                if (sce != sce) {
                    sce = length - nsd;
                } else /* if nsd != nsd */ {
                    nsd = length - sce;
                }
                return extractShorelineInterect(segment, nsd, sce);
            }
        }
        
        private LineSegment extractShorelineInterect(LineSegment transect, double nsd, double sce) {
            double length = transect.getLength();
            return new LineSegment(
                         transect.pointAlong(nsd / length),
                         transect.pointAlong((nsd + sce ) / length));
        }
        
        private Color extractColor(SimpleFeature feature) {
            Object valueObject = feature.getAttribute(attributeName);
            return valueObject instanceof Number ? 
                    colorMap.valueToColor(((Number)valueObject).doubleValue()) :
                    null;
        }

        private final int[] px = new int[4];
        private final int[] py = new int[4];
        private void worldToGrid(Coordinate c, int i) throws InvalidGridGeometryException, TransformException {
            DirectPosition2D world = new DirectPosition2D(c.x, c.y);
            GridCoordinates2D grid = gridGeometry.worldToGrid(world);
            px[i] = grid.x ; py[i] = grid.y;
        }
        
        private void drawPolygon(LineSegment s0, LineSegment s1) throws TransformException {
            worldToGrid(s0.p0, 0);
            worldToGrid(s0.p1, 1);
            worldToGrid(s1.p1, 2);
            worldToGrid(s1.p0, 3);            
            graphics.fillPolygon(px, py, 4);
        }

    }
    
    public interface LineSegmentTransform {
        LineSegment transform(LineSegment in) throws TransformException;
    }
    
    public class PassThroughTransform implements LineSegmentTransform {
        @Override public LineSegment transform(LineSegment in) {
            return in;
        }
    }
    
    public class JTSTransform implements LineSegmentTransform {
        private final MathTransform transform;
        public JTSTransform(MathTransform transform) {
            this.transform = transform;
        }
        @Override public LineSegment transform(LineSegment in) throws TransformException {
            LineSegment out = new LineSegment();
            JTS.transform(in.p0, out.p0, transform);
            JTS.transform(in.p1, out.p1, transform);
            return out;
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
        
        public AttributeRange zeroInflect(boolean invert) {
            double absOfMax = max < 0 ? 0 - max : max;
            double absOfMin = min < 0 ? 0 - min : min;
            double maxAbs = absOfMax > absOfMin ? absOfMax : absOfMin;
            return invert ?
                    new AttributeRange(maxAbs, 0 - maxAbs) :
                    new AttributeRange(0 - maxAbs, maxAbs);
        }
    }
    
    public static interface ColorMap<T> {
        Color valueToColor(T value);
    }
    
    public static class JetColorMap implements ColorMap<Number> {
        
        public final static Color CLAMP_MIN = new Color(0f, 0f, 0.5f);
        public final static Color CLAMP_MAX = new Color(0.5f, 0f, 0f);
        
        public final AttributeRange range;
           
        public JetColorMap(AttributeRange range) {
            this.range = range;
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
