/*
 * U.S.Geological Survey Software User Rights Notice
 * 
 * Copied from http://water.usgs.gov/software/help/notice/ on September 7, 2012.  
 * Please check webpage for updates.
 * 
 * Software and related material (data and (or) documentation), contained in or
 * furnished in connection with a software distribution, are made available by the
 * U.S. Geological Survey (USGS) to be used in the public interest and in the 
 * advancement of science. You may, without any fee or cost, use, copy, modify,
 * or distribute this software, and any derivative works thereof, and its supporting
 * documentation, subject to the following restrictions and understandings.
 * 
 * If you distribute copies or modifications of the software and related material,
 * make sure the recipients receive a copy of this notice and receive or can get a
 * copy of the original distribution. If the software and (or) related material
 * are modified and distributed, it must be made clear that the recipients do not
 * have the original and they must be informed of the extent of the modifications.
 * 
 * For example, modified files must include a prominent notice stating the 
 * modifications made, the author of the modifications, and the date the 
 * modifications were made. This restriction is necessary to guard against problems
 * introduced in the software by others, reflecting negatively on the reputation of the USGS.
 * 
 * The software is public property and you therefore have the right to the source code, if desired.
 * 
 * You may charge fees for distribution, warranties, and services provided in connection
 * with the software or derivative works thereof. The name USGS can be used in any
 * advertising or publicity to endorse or promote any products or commercial entity
 * using this software if specific written permission is obtained from the USGS.
 * 
 * The user agrees to appropriately acknowledge the authors and the USGS in publications
 * that result from the use of this software or in products that include this
 * software in whole or in part.
 * 
 * Because the software and related material are free (other than nominal materials
 * and handling fees) and provided "as is," the authors, the USGS, and the 
 * United States Government have made no warranty, express or implied, as to accuracy
 * or completeness and are not obligated to provide the user with any support, consulting,
 * training or assistance of any kind with regard to the use, operation, and performance
 * of this software nor to provide the user with any updates, revisions, new versions or "bug fixes".
 * 
 * The user assumes all risk for any damages whatsoever resulting from loss of use, data,
 * or profits arising in connection with the access, use, quality, or performance of this software.
 */

package gov.usgs.cida.coastalhazards.wps.geom;

import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.LineSegment;
import com.vividsolutions.jts.geom.LineString;
import com.vividsolutions.jts.geom.MultiLineString;
import com.vividsolutions.jts.geom.PrecisionModel;
import com.vividsolutions.jts.index.strtree.STRtree;
import gov.usgs.cida.coastalhazards.wps.exceptions.UnsupportedFeatureTypeException;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.data.simple.SimpleFeatureIterator;
import org.geotools.geometry.jts.Geometries;
import org.opengis.feature.simple.SimpleFeature;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class ShorelineSTRTreeBuilder {

    private STRtree strTree;
    private GeometryFactory factory;
    private boolean built;
    
    public ShorelineSTRTreeBuilder(SimpleFeatureCollection shorelines) {
        this.strTree = new STRtree(shorelines.size());
		
        SimpleFeatureIterator features = null;
		try {
			features = shorelines.features();
			while (features.hasNext()) {
				SimpleFeature feature = features.next();
				Geometry geom = (Geometry)feature.getDefaultGeometry();
				Geometries geoms = Geometries.get(geom);
				switch (geoms) {
					case MULTIPOLYGON:
					case POLYGON:
					case MULTIPOINT:
					case POINT:
					case LINESTRING:
						throw new UnsupportedFeatureTypeException("Only MultiLineString supported here");
					case MULTILINESTRING:
						MultiLineString mls = (MultiLineString)geom;
						this.factory = new GeometryFactory(new PrecisionModel(PrecisionModel.FLOATING));
						this.built = false;
						this.fillTree(mls, feature);
						break;
					default:
						throw new UnsupportedFeatureTypeException("Unknown feature not supported");
				}
			}
		} finally {
			if (null != features) {
				features.close();
			}
		}
    }
        
    /* May also want to take FeatureCollection */
    private void fillTree(MultiLineString shorelines, SimpleFeature feature) {
        Coordinate prevCoord = null;
        for (int i=0; i<shorelines.getNumGeometries(); i++) {
            LineString line = (LineString)shorelines.getGeometryN(i);
            for (Coordinate coord : line.getCoordinates()) {
                if (prevCoord == null) {
                    prevCoord = coord;
                    continue;
                }
                else {
                    LineSegment segment = new LineSegment(prevCoord, coord);
                    LineString geom = segment.toGeometry(factory);
                    this.strTree.insert(geom.getEnvelopeInternal(), new ShorelineFeature(geom, feature));
                    prevCoord = coord;
                }
            }
            prevCoord = null;
        }
    }

    public STRtree build() {
        if (built) {
            throw new IllegalStateException("Tree already built");
        }
        strTree.build();
        built = true;
        return strTree;
    }
}
