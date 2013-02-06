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

package gov.usgs.cida.coastalhazards.r;

import gov.usgs.cida.coastalhazards.util.FeatureCollectionFromShp;
import gov.usgs.cida.coastalhazards.wps.geom.IntersectionPoint;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.net.URL;
import java.text.ParseException;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import org.apache.commons.io.IOUtils;
import org.geotools.feature.FeatureCollection;
import org.geotools.feature.FeatureIterator;
import org.geotools.filter.FilterFactoryImpl;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.filter.FilterFactory;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class IntersectionParserTest {
    
    private URL shapefile;
    private File outfile;
    private BufferedWriter buf;
    private FilterFactory filterFactory;
    
    @Before
    public void setupShape() throws IOException {
        filterFactory = new FilterFactoryImpl();
        shapefile = IntersectionParserTest.class.getClassLoader()
                .getResource("gov/usgs/cida/coastalhazards/jersey/NewJerseyN_intersections.shp");
        outfile = File.createTempFile("testOut", ".csv");
        outfile.deleteOnExit();
        buf = new BufferedWriter(new FileWriter(outfile));
    }
    
    @After
    public void tearDown() {
        IOUtils.closeQuietly(buf);
    }

    @Test
    //@Ignore
    public void csvFromFeatureCollection() throws IOException, ParseException {
        //ShapefileDataStore dataStore = (ShapefileDataStore)new ShapefileDataStoreFactory().createDataStore(shapefile);
        Map<Integer, List<IntersectionPoint>> map = new TreeMap<Integer, List<IntersectionPoint>>();
        FeatureCollection<SimpleFeatureType, SimpleFeature> fc =
            FeatureCollectionFromShp.featureCollectionFromShp(shapefile);
        
//        FeatureSource source = dataStore.getFeatureSource();
//        Query query = new Query();
//        SortBy transectSort = filterFactory.sort("TransectID", SortOrder.DESCENDING);
//        SortBy dateSort = filterFactory.sort("Date_", SortOrder.DESCENDING);
//        query.setSortBy(new SortBy[] {transectSort, dateSort});
//        FeatureCollection sorted = source.getFeatures(query);
       // FeatureCollection<SimpleFeatureType, SimpleFeature> sorted = fc.sort(sort);
        //fc.subCollection()
        //        SimpleFeatureType schema = fc.getSchema();
        //        List<AttributeDescriptor> attrs = schema.getAttributeDescriptors();
        //        for (AttributeDescriptor attr : attrs) {
        //            System.out.println(attr.getLocalName() + ": " + attr.getType().toString());
        //        }
        
        
        
        FeatureIterator<SimpleFeature> features = fc.features();
        while (features.hasNext()) {
            SimpleFeature feature = features.next();
            int transectId = (Integer)feature.getAttribute("TransectID");

            IntersectionPoint intersection = new IntersectionPoint(
                    (Double)feature.getAttribute("Distance"),
                    (String)feature.getAttribute("Date_"),
                    (Double)feature.getAttribute("Uncy"));

            if (map.containsKey(transectId)) {
                map.get(transectId).add(intersection);
            }
            else {
                List<IntersectionPoint> pointList = new LinkedList<IntersectionPoint>();
                pointList.add(intersection);
                map.put(transectId, pointList);
            }
        }
        
        for (int key : map.keySet()) {
            List<IntersectionPoint> points = map.get(key);
            buf.write("# " + key);
            buf.newLine();
            for (IntersectionPoint p : points) {
                buf.write(p.toString());
                buf.newLine();
            }
        }
    }

}
