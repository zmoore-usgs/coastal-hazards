package gov.usgs.cida.coastalhazards.xml.model;

import javax.xml.bind.annotation.XmlElement;

public class Bounding {
    double westbc;
    double eastbc;
    double northbc;
    double southbc;
       
    @XmlElement
    public void setWestbc(double westbc){
        this.westbc = westbc;
    }
    public double getWestbc(){
        return westbc;
    }
    
    @XmlElement
    public void setEastbc(double eastbc){
        this.eastbc = eastbc;
    }    
    public double getEastbc(){
        return eastbc;
    }
    
    @XmlElement
    public void setNorthbc(double northbc){
        this.northbc = northbc;
    }    
    public double getNorthbc(){
        return northbc;
    }
    
    @XmlElement
    public void setSouthbc(double southbc){
        this.southbc = southbc;
    }    
    public double getSouthbc(){
        return southbc;
    }
     
}
