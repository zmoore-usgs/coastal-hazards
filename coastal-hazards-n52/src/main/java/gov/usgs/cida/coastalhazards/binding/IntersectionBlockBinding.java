/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.coastalhazards.binding;

import java.io.InputStream;
import org.n52.wps.io.data.IComplexData;

/**
 *
 * @author jiwalker
 */
public class IntersectionBlockBinding implements IComplexData {

    private InputStream input;
    
    public IntersectionBlockBinding(InputStream input) {
        this.input = input;
    }
    
    @Override
    public Object getPayload() {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    @Override
    public Class getSupportedClass() {
        throw new UnsupportedOperationException("Not supported yet.");
    }
    
}
