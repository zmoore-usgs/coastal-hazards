package gov.usgs.cida.coastalhazards.wps;

import com.vividsolutions.jts.geom.CoordinateSequence;
import com.vividsolutions.jts.geom.CoordinateSequenceFilter;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.LineSegment;
import com.vividsolutions.jts.geom.LineString;
import com.vividsolutions.jts.geom.MultiLineString;
import com.vividsolutions.jts.geom.Point;
import com.vividsolutions.jts.geom.PrecisionModel;
import gov.usgs.cida.coastalhazards.wps.exceptions.UnsupportedFeatureTypeException;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.geoserver.wps.gs.GeoServerProcess;
import org.geotools.data.Query;
import org.geotools.data.collection.ListFeatureCollection;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.data.simple.SimpleFeatureIterator;
import org.geotools.feature.collection.SortedSimpleFeatureCollection;
import org.geotools.feature.simple.SimpleFeatureBuilder;
import org.geotools.feature.simple.SimpleFeatureTypeBuilder;
import org.geotools.filter.AttributeExpressionImpl;
import org.geotools.filter.SortByImpl;
import org.geotools.filter.function.FilterFunction_offset;
import org.geotools.geometry.jts.Geometries;
import org.geotools.geometry.jts.ReferencedEnvelope;
import org.geotools.process.ProcessException;
import org.geotools.process.factory.DescribeParameter;
import org.geotools.process.factory.DescribeProcess;
import org.geotools.process.factory.DescribeResult;
import org.geotools.util.logging.Logging;
import org.opengis.coverage.grid.GridGeometry;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.feature.type.AttributeDescriptor;
import org.opengis.filter.sort.SortBy;
import org.opengis.filter.sort.SortOrder;

/**
 *
 * @author dmsibley
 */
@DescribeProcess(
		title = "Shoreline Ribboning",
		description = "Create ribbon geometries following a shoreline",
		version = "1.0.0")
public class RibboningProcess implements GeoServerProcess {

	private final static Logger LOGGER = Logging.getLogger(RibboningProcess.class);
    
    private static GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(PrecisionModel.FLOATING));
	
	public static final String ribbonAttr = "RIBBONID";

	@DescribeResult(name = "result", description = "Layer with ribboned clones")
	public SimpleFeatureCollection execute(
			@DescribeParameter(name = "features", min = 1, max = 1) SimpleFeatureCollection features,
			@DescribeParameter(name = "bbox", min = 0, max = 1) ReferencedEnvelope bbox,
			@DescribeParameter(name = "invert-side", min = 0, max = 1) Boolean invertSide,
			@DescribeParameter(name = "ribbon-count", min = 0, max = 1) Integer ribbonCount,
			@DescribeParameter(name = "offset", min = 0, max = 1) Integer offset,
			@DescribeParameter(name = "sort-attribute", min = 0, max = 1) String sortAttribute) throws Exception {
		
		
		if (null == invertSide) {
			invertSide = Boolean.FALSE;
		}
		if (null == ribbonCount) {
			ribbonCount = 1;
		}
		if (null == offset) {
			offset = 5;
		}
		if (null == sortAttribute) {
			sortAttribute = "OBJECTID";
		}
		
		SimpleFeatureCollection sortedFeatures = sortFeatures(sortAttribute, features);
		
		return new Process(sortedFeatures, bbox, invertSide, ribbonCount, offset).execute();

	}
	
	public SimpleFeatureCollection sortFeatures(String sortAttribute, SimpleFeatureCollection features) {
		SimpleFeatureCollection result = features;
		
		AttributeDescriptor sortAttr = features.getSchema().getDescriptor(sortAttribute);
		
		if (null != sortAttr) {
			SortBy sort = new SortByImpl(new AttributeExpressionImpl(sortAttr.getName()), SortOrder.ASCENDING);
			result = new SortedSimpleFeatureCollection(features, new SortBy[] {sort});
		} else {
			LOGGER.log(Level.WARNING, "Could not find sort attribute {0}", sortAttribute);
		}
		
		return result;
	}

	public Query invertQuery(Query targetQuery, GridGeometry targetGridGeometry) throws ProcessException {
		Query result = new Query(targetQuery);
		result.setProperties(Query.ALL_PROPERTIES);
		return result;
	}
	
	private class Process {

		private final SimpleFeatureCollection featureCollection;
		private final ReferencedEnvelope coverageEnvelope;
		private final boolean invert;
		private final int ribbonCount;
		private final double offset;

		Map<Integer, LinkedList<SimpleFeature>> baselineFeaturesMap;

		private Process(SimpleFeatureCollection featureCollection,
				ReferencedEnvelope coverageEnvelope,
				boolean invert,
				int ribbonCount,
				double offset) {
			this.featureCollection = featureCollection;
			this.coverageEnvelope = coverageEnvelope;
			this.invert = invert;
			this.ribbonCount = ribbonCount;
			this.offset = offset;
		}

		private SimpleFeatureCollection execute() throws Exception {
			ListFeatureCollection result = null;
			
			SimpleFeatureType sft = this.featureCollection.getSchema();
			SimpleFeatureTypeBuilder sftb = new SimpleFeatureTypeBuilder();
			sftb.addAll(sft.getAttributeDescriptors());
			sftb.add(ribbonAttr, Integer.class);
			sftb.setName(sft.getName());
			SimpleFeatureType schema = sftb.buildFeatureType();
			
			result = new ListFeatureCollection(schema);
			LOGGER.log(Level.FINE, "Offset {0}", "" + offset);
			LineString prevLine = null;
			double[] prevLineOffset = null;
			SimpleFeatureIterator features = this.featureCollection.features();
			while (features.hasNext()) {
				SimpleFeature feature = features.next();
				
				MultiLineString lines = getMultiLineString(feature);
				if (null != lines) {
					
					List<MultiLineString> ribbonLines = new ArrayList<MultiLineString>();
					for (int ribbonNum = 0; ribbonNum < ribbonCount; ribbonNum++) {
						ribbonLines.add((MultiLineString) lines.clone());
					}
					
					for (int geomNum = 0; geomNum < lines.getNumGeometries(); geomNum++) {
						LineString line = (LineString) lines.getGeometryN(geomNum);
						
						double[] lineOffset = computeXYOffset(prevLine, line);
						
						if (null != lineOffset && null != prevLineOffset) {
							for (int ribbonNum = 0; ribbonNum < ribbonCount; ribbonNum++) {
								double prevOffsetX = prevLineOffset[0] * ribbonNum;
								double prevOffsetY = prevLineOffset[1] * ribbonNum;
								double offsetX = lineOffset[0] * ribbonNum;
								double offsetY = lineOffset[1] * ribbonNum;
								ribbonLines.get(ribbonNum).getGeometryN(geomNum).apply(new skewTingFilter(prevOffsetX, prevOffsetY, offsetX, offsetY));
							}
						} else {
							LOGGER.log(Level.FINE, "This is where I'd deal with the first line, Not yet implemented");
						}
						
						prevLine = line;
						prevLineOffset = lineOffset;
					}

					List<SimpleFeature> ribbonedFeature = new ArrayList<SimpleFeature>();

					for (int ribbonNum = 0; ribbonNum < ribbonCount; ribbonNum++) {
						SimpleFeatureBuilder fb = new SimpleFeatureBuilder(schema);
						fb.addAll(feature.getAttributes());
						fb.set(ribbonAttr, new Integer(ribbonNum + 1));
						fb.set(feature.getDefaultGeometryProperty().getName(), ribbonLines.get(ribbonNum));
						ribbonedFeature.add(fb.buildFeature(null));
					}

					result.addAll(ribbonedFeature);
				}
			}
			
			{
				LOGGER.log(Level.FINE, "This is where I'd flush the last line, Not yet implemented");
			}

			return result;
		}
		
		private double[] computeXYOffset(LineString prevLine, LineString currLine) {
			double[] result = null;
			
			if (null != prevLine && null != currLine) {
				Point prevStart = prevLine.getStartPoint();
				Point prevEnd = prevLine.getEndPoint();
				Point currStart = currLine.getStartPoint();
				Point currEnd = currLine.getEndPoint();
				
				if (null != prevStart && null != prevEnd
						&& null != currStart && null != currEnd) {
					double xOffset = 10000.0;
					double yOffset = -10000.0;
					if (prevEnd.isWithinDistance(currStart, 1000.0)) {
						//sequential order
						Double angle = getAngle(prevStart, currStart, currEnd);
						if (null != angle) {
							xOffset = getXOffset(angle, Math.sqrt(offset) * 5);
							yOffset = getYOffset(angle, Math.sqrt(offset) * 5);
						} else {
							LOGGER.log(Level.FINE, "How the hell did we get here");
						}
						
						result = new double[] {xOffset, yOffset};
					} else {
						//broken order
						LOGGER.log(Level.FINE, "Broken order");
					}
				}
			}
			
			return result;
		}
		
		private double getXOffset(double angle, double radians) {
			double result = radians * Math.cos(angle);
			
			return result;
		}
		
		private double getYOffset(double angle, double radians) {
			double result = radians * Math.sin(angle);
			
			return result;
		}
		
		private Double getAngle(Point a, Point b, Point c) {
			Double result = null;
			double TWO_PI = 2 * Math.PI;
			
			if (null != a && null != b && null != c) {
				double thetaA = (Math.atan2(b.getY() - a.getY(), b.getX() - a.getX()) + TWO_PI) % TWO_PI;
				double thetaB = (Math.atan2(c.getY() - b.getY(), c.getX() - b.getX()) + TWO_PI) % TWO_PI;
				
				double theta = ((Math.PI - thetaA + thetaB) + TWO_PI) % TWO_PI;
				double midAngle = theta / 2;
				
				result = thetaA - midAngle;
			} else {
				LOGGER.log(Level.WARNING, "Missing a point");
			}
			
			return result;
		}
		
		private MultiLineString getMultiLineString(SimpleFeature feature) {
			MultiLineString result = null;
			
			if (null != feature) {
				Geometry geometry = (Geometry) feature.getDefaultGeometry();
				Geometries geomType = Geometries.get(geometry);
				switch (geomType) {
					case POLYGON:
					case MULTIPOLYGON:
						throw new UnsupportedFeatureTypeException("Polygons not supported");
					case LINESTRING:
						LineString lineString = (LineString) geometry;
						result = geometryFactory.createMultiLineString(new LineString[] {lineString});
						break;
					case MULTILINESTRING:
						result = (MultiLineString) geometry;
						break;
					case POINT:
					case MULTIPOINT:
						throw new UnsupportedFeatureTypeException("Points not supported");
					default:
						throw new UnsupportedFeatureTypeException("Only line type supported");
				}
			}
			
			return result;
		}
	}
	
	public static class skewTingFilter implements CoordinateSequenceFilter {
		final double prevOffsetX;
		final double prevOffsetY;
        final double offsetX;
        final double offsetY;

        public skewTingFilter(double prevOffsetX, double prevOffsetY, double offsetX, double offsetY) {
			this.prevOffsetX = prevOffsetX;
			this.prevOffsetY = prevOffsetY;
            this.offsetX = offsetX;
            this.offsetY = offsetY;
        }

        public void filter(CoordinateSequence seq, int i) {
			if (0 == i) { //TODO, this is stupid
				seq.setOrdinate(i, 0, seq.getOrdinate(i, 0) + prevOffsetX);
				seq.setOrdinate(i, 1, seq.getOrdinate(i, 1) + prevOffsetY);
			} else {
				seq.setOrdinate(i, 0, seq.getOrdinate(i, 0) + offsetX);
				seq.setOrdinate(i, 1, seq.getOrdinate(i, 1) + offsetY);
			}
        }

        public boolean isDone() {
            return false;
        }

        public boolean isGeometryChanged() {
            return true;
        }

    }
}
