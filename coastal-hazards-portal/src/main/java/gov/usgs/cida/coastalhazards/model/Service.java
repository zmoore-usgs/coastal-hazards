package gov.usgs.cida.coastalhazards.model;

import gov.usgs.cida.coastalhazards.util.ogc.CSWService;
import gov.usgs.cida.coastalhazards.util.ogc.OGCService;
import gov.usgs.cida.coastalhazards.util.ogc.WFSService;
import gov.usgs.cida.coastalhazards.util.ogc.WMSService;
import gov.usgs.cida.utilities.StringPrecondition;
import java.io.Serializable;
import java.util.List;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Entity
@Table(name = "service")
public class Service implements Serializable {

	private static final long serialVersionUID = 1L;

	public static final int ENDPOINT_MAX_LENGTH = 255;
	public static final int PARAMETER_MAX_LENGTH = 255;

	private transient int id;
	private ServiceType type;
	private String endpoint;
	private String serviceParameter;

	public enum ServiceType {

		source_wfs,
		source_wms,
		esri_rest,
		proxy_wfs,
		proxy_wms,
		csw;
	}

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	@Column(name = "service_endpoint", length = ENDPOINT_MAX_LENGTH)
	public String getEndpoint() {
		return endpoint;
	}

	public void setEndpoint(String endpoint) {
		StringPrecondition.checkStringArgument(endpoint, ENDPOINT_MAX_LENGTH);
		this.endpoint = endpoint;
	}

	@Column(name = "service_type")
	@Enumerated(EnumType.STRING)
	public ServiceType getType() {
		return type;
	}

	public void setType(ServiceType type) {
		this.type = type;
	}

	@Column(name = "service_parameter", length = PARAMETER_MAX_LENGTH)
	public String getServiceParameter() {
		return serviceParameter;
	}

	public void setServiceParameter(String serviceParameter) {
		StringPrecondition.checkStringArgument(serviceParameter, PARAMETER_MAX_LENGTH);
		this.serviceParameter = serviceParameter;
	}
	
	public static OGCService ogcHelper(ServiceType type, List<Service> services) {
		OGCService ogc = null;
		if (services != null) {
			for (Service service : services) {
				if (service.getType() == type) {
					switch (type) {
						case csw:
							ogc = new CSWService(service);
							break;
						case proxy_wms:
						case source_wms:
							ogc = new WMSService(service);
							break;
						case proxy_wfs:
						case source_wfs:
							ogc = new WFSService(service);
							break;
						default:
							throw new IllegalArgumentException("Specified service type not valid OGC service");
					}
				}
			}
		}
		return ogc;
	}
}
