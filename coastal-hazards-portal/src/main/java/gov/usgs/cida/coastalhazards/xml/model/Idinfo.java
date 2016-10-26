/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.coastalhazards.xml.model;

import javax.xml.bind.annotation.XmlElement;

public class Idinfo {
    
    Spdom spdom;
    
    public Spdom getSpdom(){
        return spdom;
    }
    
    @XmlElement( name = "spdom" )
    public void setSpdom(Spdom spdom){
        this.spdom = spdom;
    }
}
