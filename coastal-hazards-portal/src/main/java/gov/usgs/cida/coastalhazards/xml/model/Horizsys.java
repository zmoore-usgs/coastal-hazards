/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.coastalhazards.xml.model;

import javax.xml.bind.annotation.XmlElement;

public class Horizsys {

    Geodetic geodetic;

    public Geodetic getGeodetic() {
        return geodetic;
    }

    @XmlElement
    public void setGeodetic(Geodetic geodetic) {
        this.geodetic = geodetic;
    }
}
