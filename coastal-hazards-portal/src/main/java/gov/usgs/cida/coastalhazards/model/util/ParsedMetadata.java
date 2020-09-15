package gov.usgs.cida.coastalhazards.model.util;

import java.util.ArrayList;
import java.util.List;

import gov.usgs.cida.coastalhazards.model.Bbox;
import gov.usgs.cida.coastalhazards.model.summary.Publication;

public class ParsedMetadata {
    private List<String> title = new ArrayList<>();
    private List<String> srcUsed = new ArrayList<>();
    private List<String> keywords = new ArrayList<>();
    private List<Publication> data = new ArrayList<>();
    private List<Publication> publications = new ArrayList<>();
    private List<Publication> resources = new ArrayList<>();
    private Bbox box = new Bbox();
    private String epsgCode = null;

    public List<String> getTitle() {
        return title;
    }

    public String getEPSGCode() {
        return epsgCode;
    }

    public void setEPSGCode(String epsgCode) {
        this.epsgCode = epsgCode;
    }

    public Bbox getBox() {
        return box;
    }

    public void setBox(Bbox box) {
        this.box = box;
    }

    public List<Publication> getResources() {
        return resources;
    }

    public void setResources(List<Publication> resources) {
        this.resources = resources;
    }

    public List<Publication> getPublications() {
        return publications;
    }

    public void setPublications(List<Publication> publications) {
        this.publications = publications;
    }

    public List<Publication> getData() {
        return data;
    }

    public void setData(List<Publication> data) {
        this.data = data;
    }

    public List<String> getKeywords() {
        return keywords;
    }

    public void setKeywords(List<String> keywords) {
        this.keywords = keywords;
    }

    public List<String> getSrcUsed() {
        return srcUsed;
    }

    public void setSrcUsed(List<String> srcUsed) {
        this.srcUsed = srcUsed;
    }

    public void setTitle(List<String> title) {
        this.title = title;
    }
}