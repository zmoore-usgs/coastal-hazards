/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.coastalhazards.xml.model;

import javax.xml.bind.annotation.XmlElement;

public class Geodetic {

    String horizdn;
    String ellips;
    double semiaxis;
    double denflat;
    
    
    @XmlElement
    public void setHorizdn(String horizdn){
        this.horizdn = horizdn;
    }
    public String getHorizdn(){
        return horizdn;
    }
    
    @XmlElement( name = "ellips" )
    public void setEllips(String ellips){
        this.ellips = ellips;
    }    
    public String getEllips(){
        return ellips;
    }
    
    @XmlElement
    public void setSemiaxis(double semiaxis){
        this.semiaxis = semiaxis;
    }    
    public double getSemiaxis(){
        return semiaxis;
    }
    
    @XmlElement
    public void setDenflat(double denflat){
        this.denflat = denflat;
    }    
    public double getDenflat(){
        return denflat;
    }   
}
