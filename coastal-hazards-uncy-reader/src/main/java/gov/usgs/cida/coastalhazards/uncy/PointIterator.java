package gov.usgs.cida.coastalhazards.uncy;

import java.util.Iterator;

import org.geotools.data.shapefile.shp.ShapefileReader.Record;

import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.CoordinateSequence;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryCollectionIterator;
import com.vividsolutions.jts.geom.LineString;
import com.vividsolutions.jts.geom.MultiLineString;
import com.vividsolutions.jts.geom.Point;

public class PointIterator implements Iterator<Point> {

	private GeometryCollectionIterator gIter;
	private LineString thisGeom = null;
	private int ptCt;
	
	public PointIterator(Geometry shape) {		
		gIter = new GeometryCollectionIterator(shape);
	}
	
	@Override
	public boolean hasNext() {
		while (thisGeom == null && gIter.hasNext()) {
			Geometry nextGeom = (Geometry)gIter.next();
			// TODO Would be nice to extend this to other collections, but they lack the GetPointN method.
			if ( nextGeom instanceof LineString) {
				thisGeom = (LineString)nextGeom;
				ptCt = 0;
			}
		}
		
		if (thisGeom == null) {
			return false;
		}
		
		return ptCt < thisGeom.getNumPoints();
	}

	@Override
	public Point next() {
		return thisGeom.getPointN(ptCt++);
	}

	@Override
	public void remove() {
	    throw new UnsupportedOperationException(getClass().getName());
	}

}
