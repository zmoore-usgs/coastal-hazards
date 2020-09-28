package gov.usgs.cida.coastalhazards.model;

import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Envelope;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.Polygon;
import com.vividsolutions.jts.geom.PrecisionModel;
import java.io.Serializable;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.apache.commons.lang3.tuple.Pair;
import org.geotools.geometry.DirectPosition2D;
import org.geotools.referencing.CRS;
import org.geotools.referencing.GeodeticCalculator;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.hibernate.annotations.SQLInsert;
import org.hibernate.annotations.SQLUpdate;
import org.opengis.geometry.DirectPosition;
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import org.opengis.referencing.operation.MathTransform;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Entity
@Table(name = "bbox")
// INSERT needs to be done in this order, hibernate seems to ignore otherwise
@SQLInsert(sql = "INSERT into bbox (bbox, id) VALUES (CAST(? AS box2d), ?)")
@SQLUpdate(sql = "UPDATE bbox SET bbox = CAST(? AS box2d) WHERE id = ?")
public class Bbox implements Serializable {
	private static final Logger log = LoggerFactory.getLogger(Bbox.class);
	private static final long serialVersionUID = 1L;
	public static final int SRID = 4326;
	public static final String BOX_FORMAT = "BOX(%f %f, %f %f)";

	private transient int id;
	// store the serialized version, use utilities to get Envelope
	private String bbox;

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	@Column(name = "id")
	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	@Column(name = "bbox", columnDefinition = "box2d")
	public String getBbox() {
		return bbox;
	}

	public void setBbox(String bbox) {
		this.bbox = bbox;
	}

	public void setBbox(double minX, double minY, double maxX, double maxY) {
		this.bbox = String.format(BOX_FORMAT, minX, minY, maxX, maxY);
	}

	public Envelope makeEnvelope() {
		Envelope envelope = null;
		if (bbox != null) {
			Pair<Pair<Double,Double>,Pair<Double,Double>> points = getPoints(this);

			if(points != null) {
				envelope = new Envelope(points.getLeft().getLeft(), points.getRight().getLeft(), points.getLeft().getRight(), points.getRight().getRight());
			}
		}
		return envelope;
	}

	public static Pair<Pair<Double,Double>,Pair<Double,Double>> getPoints(Bbox source) {
		if (source != null && source.getBbox() != null) {
			Pattern pattern = Pattern.compile("BOX\\(\\s*([-\\d\\.]+)\\s+([-\\d\\.]+)\\s*,\\s*([-\\d\\.]+)\\s+([-\\d\\.]+)\\s*\\)");
			Matcher matcher = pattern.matcher(source.getBbox());
			if (matcher.matches()) {
				double minX = Double.parseDouble(matcher.group(1));
				double minY = Double.parseDouble(matcher.group(2));
				double maxX = Double.parseDouble(matcher.group(3));
				double maxY = Double.parseDouble(matcher.group(4));
				return new ImmutablePair<>(new ImmutablePair<>(minX,minY), new ImmutablePair<>(maxX,maxY));
			}
		}

		return null;
	}

	public static Bbox copyValues(Bbox from, Bbox to) {
		Bbox bbox = new Bbox();
		if (to != null) {
			bbox.setId(to.getId());
		}
		if (from != null) {
			bbox.setBbox(from.getBbox());
		} else {
			bbox = null;
		}
		return bbox;
	}

	public static Polygon envelopeToPolygon(Envelope e) {
		GeometryFactory factory = new GeometryFactory(new PrecisionModel(PrecisionModel.FLOATING_SINGLE), SRID);
		Coordinate coordA = new Coordinate(e.getMinX(), e.getMinY());
		Coordinate coordB = new Coordinate(e.getMinX(), e.getMaxY());
		Coordinate coordC = new Coordinate(e.getMaxX(), e.getMaxY());
		Coordinate coordD = new Coordinate(e.getMaxX(), e.getMinY());
		Coordinate coordE = coordA;
		Polygon bboxPoly = factory.createPolygon(new Coordinate[]{coordA, coordB, coordC, coordD, coordE});
		return bboxPoly;
	}

	public static Bbox copyToSquareBox(Bbox source) {
		Bbox newBox = copyValues(source, new Bbox());
		GeodeticCalculator calc = new GeodeticCalculator();
		Pair<Pair<Double,Double>,Pair<Double,Double>> points = getPoints(source);
		
		if(points != null) {
			log.debug("Source box: " + source.getBbox());

			// Latitude Distance
			calc.setStartingGeographicPoint(points.getLeft().getLeft(), points.getLeft().getRight());
			calc.setDestinationGeographicPoint(points.getRight().getLeft(), points.getLeft().getRight());
			double distLat = calc.getOrthodromicDistance();
			double angleLat = calc.getAzimuth();

			// Longitude Distance
			calc.setStartingGeographicPoint(points.getLeft().getLeft(), points.getLeft().getRight());
			calc.setDestinationGeographicPoint(points.getLeft().getLeft(), points.getRight().getRight());
			double distLong = calc.getOrthodromicDistance();
			double angleLong = calc.getAzimuth();

			// Reset calculator
			calc = new GeodeticCalculator();

			// Extend short dimension

			if(distLong > distLat) {
				// Extend latitude 50% in both directions
				log.debug("Expand lat: " + distLat + " | " + distLong);
				double expandDist = (distLong - distLat)/2;
				calc.setStartingGeographicPoint(points.getLeft().getLeft(), points.getLeft().getRight());
				calc.setDirection(angleLat, -expandDist);
				double newMinX = calc.getDestinationGeographicPoint().getX();
				calc.setStartingGeographicPoint(points.getRight().getLeft(), points.getLeft().getRight());
				calc.setDirection(angleLat, expandDist);
				double newMaxX = calc.getDestinationGeographicPoint().getX();
				newBox.setBbox(newMinX, points.getLeft().getRight(), newMaxX, points.getRight().getRight());
			} else if(distLat > distLong) {
				// Extend longitude 50% in both directions
				log.debug("Expand long: " + distLong + " | " + distLat);
				double expandDist = (distLat - distLong)/2;
				calc.setStartingGeographicPoint(points.getLeft().getLeft(), points.getLeft().getRight());
				calc.setDirection(angleLong, -expandDist);
				double newMinY = calc.getDestinationGeographicPoint().getY();
				calc.setStartingGeographicPoint(points.getLeft().getLeft(), points.getRight().getRight());
				calc.setDirection(angleLong, expandDist);
				double newMaxY = calc.getDestinationGeographicPoint().getY();
				newBox.setBbox(points.getLeft().getLeft(), newMinY, points.getRight().getLeft(), newMaxY);
			} else {
				log.debug("Provided box already square.");
			}

			log.debug("Squared box: " + newBox.getBbox());
		}
		
		return newBox;
	}

	public static Bbox copyToCRS(Bbox source, String targetCRS) {
		Bbox newBox = copyValues(source, new Bbox());
		CoordinateReferenceSystem sourceCRS = DefaultGeographicCRS.WGS84;
		Pair<Pair<Double,Double>,Pair<Double,Double>> points = getPoints(source);
		
		if(points != null) {
			try {
				MathTransform transform = CRS.findMathTransform(sourceCRS, CRS.decode(targetCRS));
				DirectPosition minPoint = new DirectPosition2D(sourceCRS, points.getLeft().getLeft(), points.getLeft().getRight());
				minPoint = transform.transform(minPoint, null);
				DirectPosition maxPoint = new DirectPosition2D(sourceCRS, points.getRight().getLeft(), points.getRight().getRight());
				maxPoint = transform.transform(maxPoint, null);
				newBox.setBbox(minPoint.getCoordinate()[0], minPoint.getCoordinate()[1], maxPoint.getCoordinate()[0], maxPoint.getCoordinate()[1]);
			} catch(Exception e) {
				log.error("Failed to transform BBOX points from EPSG:4326 to " + targetCRS);
				newBox = new Bbox();
			}
			log.debug("Transformed box: " + newBox.getBbox());
		}

		return newBox;
	}
}
