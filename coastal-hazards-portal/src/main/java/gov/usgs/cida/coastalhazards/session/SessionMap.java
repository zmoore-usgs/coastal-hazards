package gov.usgs.cida.coastalhazards.session;

import java.io.Serializable;
import org.apache.commons.lang.StringUtils;

/**
 *
 * @author isuftin
 */
public class SessionMap implements Serializable {
	private static final long serialVersionUID = 1L;
	private String baselayer;
	private double scale;
	private double[] extent;
	private Center center;

	public SessionMap() {
		this.baselayer = "";
		this.scale = -1;
		this.extent = new double[] {-1d, -1d};
		this.center = null;
	}

	public SessionMap(String baselayer, double scale, double[] extent, Center center) {
		this.baselayer = baselayer;
		this.scale = scale;
		this.extent = extent;
		this.center = center;
	}

	public Center getCenter() {
		return center;
	}

	public void setCenter(Center center) {
		this.center = center;
	}

	boolean isValid() {
		boolean isValid = true;
		
		if (StringUtils.isBlank(baselayer)) {
			isValid = false;
		} else if (scale == -1) {
			isValid = false;
		} else if (extent == null || extent.length < 2) {
			isValid = false;
		} else if (extent[0] == -1 || extent[1] == -1) {
			isValid = false;
		} else if (this.center == null) {
			isValid = false;
		} else if (!this.center.isValid()) {
			isValid = false;
		}
		
		return isValid;
	}

	public class Center implements Serializable {
		private static final long serialVersionUID = 1L;

		private double lat;
		private double lon;

		public Center() {
			lat = -1d;
			lon = -1d;
		}

		public Center(double lat, double lon) {
			this.lat = lat;
			this.lon = lon;
		}

		public double getLat() {
			return lat;
		}

		public void setLat(double lat) {
			this.lat = lat;
		}

		public double getLon() {
			return lon;
		}

		public void setLon(double lon) {
			this.lon = lon;
		}

		private boolean isValid() {
			boolean isValid = true;
			
			if (this.lat == -1 || this.lon == -1) {
				isValid = false;
			}
			
			return isValid;
		}
	}
	
}
