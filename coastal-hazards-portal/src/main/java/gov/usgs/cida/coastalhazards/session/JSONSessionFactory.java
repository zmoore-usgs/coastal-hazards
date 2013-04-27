package gov.usgs.cida.coastalhazards.session;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.apache.commons.lang.StringUtils;

/**
 *
 * @author isuftin
 */
public class JSONSessionFactory implements SessionFactory {

	private String json;
	
	private JSONSessionFactory() {}
	
	public JSONSessionFactory(String json) {
		if (StringUtils.isBlank(json)) {
			throw new NullPointerException("json may not be blank");
		}
		this.json = json;
	}
	
	@Override
	public Session createSession() {
		Session session;
		Gson gson = new GsonBuilder().create();
		session = gson.fromJson(this.json, Session.class);
		return session;
	}
	
}
