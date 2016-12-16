package gov.usgs.cida.coastalhazards.xml.model;

import javax.xml.bind.annotation.XmlElement;

public class Mapprojp {
    double feast;
    double fnorth;
    double latprjo;
    double longcm;
    double stdparll;
    
    
    @XmlElement
    public void setFeast(double feast){
        this.feast = feast;
    }
    public double getFeast(){
        return feast;
    }
    
    @XmlElement
    public void setFnorth(double fnorth){
        this.fnorth = fnorth;
    }    
    public double getFnorth(){
        return fnorth;
    }
    
    @XmlElement
    public void setLatprjo(double latprjo){
        this.latprjo = latprjo;
    }    
    public double getLatprjo(){
        return latprjo;
    }
    
    @XmlElement
    public void setLongcm(double longcm){
        this.longcm = longcm;
    }    
    public double getLongcm(){
        return longcm;
    }  

    @XmlElement
    public void setStdparll(double stdparll){
        this.stdparll = stdparll;
    }    
    public double getStdparll(){
        return stdparll;
    }
        
}
