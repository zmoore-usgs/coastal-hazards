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

import com.vividsolutions.jts.algorithm.Angle;
import com.vividsolutions.jts.geom.Coordinate;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.LineSegment;
import com.vividsolutions.jts.geom.LineString;
import com.vividsolutions.jts.geom.Point;
import com.vividsolutions.jts.geom.PrecisionModel;

/**
 * VectorCoordAngle.
 * 
 * Creating this class because I'm having a hard time wrapping my head around
 * polar vs. cartesian arithmetic. Holding a cartesian coord with a polar angle
 * seemed to be my best way around it.
 * 
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class VectorCoordAngle {

    private Coordinate cartesianCoord;
    private double angle;
    private static final GeometryFactory gf;

    static {
        gf = new GeometryFactory(new PrecisionModel(PrecisionModel.FLOATING));
    }
    
    public VectorCoordAngle(Coordinate coord, double angle) {
        this.cartesianCoord = coord;
        this.angle = angle;
    }

    public VectorCoordAngle(double x, double y, double angle) {
        this(new Coordinate(x, y), angle);
    }

    public LineString getLineOfLength(double length) {
        double rise = length * Math.sin(angle);
        double run = length * Math.cos(angle);
        Coordinate endpoint = new Coordinate(cartesianCoord.x + run, cartesianCoord.y + rise);
        LineString newLineString = gf.createLineString(new Coordinate[]{cartesianCoord, endpoint});
        return newLineString;
    }

    public Coordinate getOriginCoord() {
        return cartesianCoord;
    }
    
    public Point getOriginPoint() {
        return gf.createPoint(cartesianCoord);
    }

    public void rotate180Deg() {
        angle += Math.PI;
    }
    
    public static VectorCoordAngle generatePerpendicularVector(Coordinate origin, LineSegment segment, boolean clockwise) {
        double angle = segment.angle() + ((clockwise) ? Angle.PI_OVER_2 : -Angle.PI_OVER_2);
        return new VectorCoordAngle(origin, angle);
    }
}
