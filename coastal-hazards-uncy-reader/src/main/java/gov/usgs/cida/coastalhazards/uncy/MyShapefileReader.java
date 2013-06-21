package gov.usgs.cida.coastalhazards.uncy;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.util.Iterator;

import org.geotools.data.shapefile.ShpFiles;
import org.geotools.data.shapefile.dbf.DbaseFileHeader;
import org.geotools.data.shapefile.dbf.DbaseFileReader;
import org.geotools.data.shapefile.shp.ShapeType;
import org.geotools.data.shapefile.shp.ShapefileReader;
import org.geotools.data.shapefile.shp.ShapefileReader.Record;

import com.vividsolutions.jts.geom.CoordinateSequenceFactory;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.MultiLineString;
import com.vividsolutions.jts.geom.Point;
import com.vividsolutions.jtsexample.geom.ExtendedCoordinate;

/** Read a shoreline shapefile, including the M values (which the usual ShpaefileDataStore discards).
 * 
 * @author rhayes
 *
 */
public class MyShapefileReader implements Iterable<ShapeAndAttributes>, Iterator<ShapeAndAttributes> {

	private ShapefileReader rdr;
	private DbaseFileReader dbf;
	public boolean used = false;
	private File file;
	private ShpFiles shpFile;

	public MyShapefileReader(String fn) {
		init(new File(fn + ".shp"));
	}
	
	public MyShapefileReader(File f) {
		init(f);
	}
	
	public DbaseFileHeader getDbfHeader() {
		return dbf.getHeader();
	}
	
	private void init(File f) {
		file = f;

		used = false;
		
		try {
			shpFile = new ShpFiles(file);
			CoordinateSequenceFactory x = com.vividsolutions.jtsexample.geom.ExtendedCoordinateSequenceFactory.instance();
			GeometryFactory gf = new GeometryFactory(x);
	
			rdr = new ShapefileReader(shpFile,false, false, gf);
			rdr.setHandler(new MultiLineZHandler(ShapeType.ARCM, gf));
	
			Charset charset = Charset.defaultCharset();		
			dbf = new DbaseFileReader(shpFile, false, charset);
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}
	
	@Override
	public synchronized Iterator<ShapeAndAttributes> iterator() {
		if (used) {
			init(file);
		}
		return this;
	}

	@Override
	public synchronized boolean hasNext() {
		try {
			return rdr.hasNext();
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}

	@Override
	public synchronized ShapeAndAttributes next() {
		used = true;
		try {
			Record rec = rdr.nextRecord();
			DbaseFileReader.Row row = dbf.readRow();
			return new ShapeAndAttributes(rec,row);
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}

	@Override
	public void remove() {
		throw new UnsupportedOperationException("Nope, sorry"); 		
	}

	public static void main(String[] args) throws Exception {
		for (String fn : args) {
			MyShapefileReader ego = new MyShapefileReader(fn);
			for (ShapeAndAttributes saa : ego) {
				System.out.println(saa);
				Geometry geometry = (Geometry) saa.record.shape();
				System.out.println("Geometry: " + geometry);
				MultiLineString mls = (MultiLineString) geometry;
				
				double sumM = 0.0;
				for (Point p : saa) {
					ExtendedCoordinate ec = (ExtendedCoordinate)p.getCoordinate();
					double m = ec.getM();
					sumM += m;
				}
				System.out.printf("sumM: %f\n", sumM);
			}
		}
	}


}
