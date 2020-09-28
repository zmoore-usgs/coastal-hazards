package gov.usgs.cida.coastalhazards.rest.data.util;

import gov.usgs.cida.coastalhazards.jpa.ItemManager;
import gov.usgs.cida.coastalhazards.model.Bbox;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.model.Service;
import gov.usgs.cida.coastalhazards.model.Item.ItemType;
import gov.usgs.cida.config.DynamicReadOnlyProperties;
import gov.usgs.cida.utilities.properties.JNDISingleton;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

import javax.imageio.ImageIO;

import java.awt.Graphics;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.apache.commons.lang3.tuple.Pair;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ThumbnailUtil {
	private static final Logger log = LoggerFactory.getLogger(GeoserverUtil.class);
	private static final DynamicReadOnlyProperties props;
	private static final String PORTAL_PUBLIC_URL;
	private static final String THUMBNAIL_BASE_WMS_URL;
	private static final String THUMBNAIL_CRS = "EPSG:3857";
	private static final Integer MAX_THUMBNAIL_CHILD_DEPTH = 4;
	private static final Integer THUMBNAIL_SIZE = 150;
	private static final Integer BASE_MAP_FETCH_SIZE = 500;
	
	static {
		props = JNDISingleton.getInstance();
		PORTAL_PUBLIC_URL = props.getProperty("coastal-hazards.public.url");
		THUMBNAIL_BASE_WMS_URL = props.getProperty("coastal-hazards.thumbnail.basemap.wms");
	}

	public static String generateBase64Thumbnail(Item item) {
		if(item.getItemType().equals(ItemType.uber)) {
			log.error("Thumbnail generation is not supported for uber.");
			return null;
		}

		try(ItemManager manager = new ItemManager()) {
			BufferedImage baseMap = null;

			// Transform and validate Bbox
			Bbox transformedBox = Bbox.copyToCRS(Bbox.copyToSquareBox(item.getBbox()), THUMBNAIL_CRS);
			String bboxVal = transformedBox != null ? transformedBox.getBbox() : null;

			if(bboxVal == null || bboxVal.isEmpty()) {
				log.error("Failed to retrieve Bbox for thumbnail for item: " + item.getId());
				return null;
			}

			// Generate thumbanil
			BufferedImage itemThumb = generateThumbnail(item, item.getId(), bboxVal, 1, manager, 0).getLeft();
			
			// If basemap WMS param configured try to pull base map image
			if(StringUtils.isNotEmpty(THUMBNAIL_BASE_WMS_URL)) {
				baseMap = new BufferedImage(THUMBNAIL_SIZE, THUMBNAIL_SIZE, BufferedImage.TYPE_INT_RGB);
				baseMap.getGraphics().drawImage(fetchBaseMap(bboxVal), 0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE, null);
			}

			// Basemap fallback to white background
			if(baseMap == null) {
				baseMap = new BufferedImage(THUMBNAIL_SIZE, THUMBNAIL_SIZE, BufferedImage.TYPE_INT_RGB);
				baseMap.getGraphics().fillRect(0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE);
			}
			
			// Draw generated thumb onto basemap
			if(itemThumb != null) {
				baseMap.getGraphics().drawImage(itemThumb, 0, 0, null);
			} else {
				log.error("Item " + item.getId() + " thumbnail failed to generate. Returning blank basemap.");
			}

			// Convert generated thumb to Base64 and return
			try(ByteArrayOutputStream os = new ByteArrayOutputStream()) {
				ImageIO.write(baseMap, "png", os);
				return Base64.getEncoder().encodeToString(os.toByteArray());
			} catch(Exception e) {
				log.error("Failed to convert generated thumbnail bytes to Base64: ", e);
			}
		} catch(Exception e) {
			log.error("Failed to generate BBox for item: " + item.getId(), e);
		}

		return null;
	}

	private static Pair<BufferedImage,Integer> generateThumbnail(Item item, String selectedItem, String bboxVal, Integer ribbonNum, ItemManager manager, Integer depth) {
		Pair<BufferedImage,Integer> result = new ImmutablePair<>(null,ribbonNum);

		switch(item.getItemType()) {
			case uber:
				log.error("Thumbnail generation is not supported for uber.");
				break;
			case template:
			case aggregation:
				log.debug("Supplied item is of type: " + item.getItemType() + ". Generating thumbnail from visible children..");

				if(depth < MAX_THUMBNAIL_CHILD_DEPTH) {
					List<String> itemIds = item.getDisplayedChildren();

					if(item.isShowChildren() && !itemIds.isEmpty()) {
						Integer curRibbon = ribbonNum.intValue();
						List<BufferedImage> childThumbnails = new ArrayList<>();
						for(String itemId : itemIds) {
							Item childItem = manager.load(itemId);
							if(childItem != null) {
								Pair<BufferedImage,Integer> childResult = generateThumbnail(childItem, selectedItem, bboxVal, curRibbon, manager, depth + 1);

								if(childResult.getLeft() != null) {
									childThumbnails.add(childResult.getLeft());
								}
								curRibbon = childResult.getRight();
							}
						}

						// Merge child thumbnails
						if(!childThumbnails.isEmpty()) {
							BufferedImage aggThumb = new BufferedImage(THUMBNAIL_SIZE, THUMBNAIL_SIZE, BufferedImage.TYPE_INT_ARGB);
							Graphics g = aggThumb.getGraphics();

							for(BufferedImage childThumb : childThumbnails) {
								g.drawImage(childThumb, 0, 0, null);
							}

							result = new ImmutablePair<>(aggThumb, ribbonNum);
						}
					} else {
						log.warn("Supplied template or aggregation: " + item.getId() + " has no visible child items for thumbnail generation.");
					}
				} else {
					log.debug("Reched max child depth when rednering thumbnail for: " + selectedItem);
				}
				break;
			case data:
				log.debug("Supplied item is of type: " + item.getItemType() + ". Generating thumbnail.");
				Service proxyWms = null;
				if(item.getServices() != null) {
					for(Service service : item.getServices()) {
						if(service.getType().equals(Service.ServiceType.proxy_wms)) {
							proxyWms = service;
							break;
						}
					}
				}

				if(proxyWms != null) {
					// Build SLD URL
					StringBuilder sldUrlBuilder = new StringBuilder();
					sldUrlBuilder.append(PORTAL_PUBLIC_URL).append("/data/sld/").append(item.getId())
						.append("?selectItem=").append(item.getId());

					if(item.isRibbonable()) {
						sldUrlBuilder.append("%26ribbon=").append(ribbonNum);
					}

					// Build result
					result = new ImmutablePair<>(
						HttpUtil.fetchImageFromUri(GeoserverUtil.buildGeoServerWMSRequest(proxyWms.getServiceParameter(), bboxToWMSParam(bboxVal), sldUrlBuilder.toString(), THUMBNAIL_SIZE, THUMBNAIL_CRS)),
						ribbonNum + 1
					);
				} else {
					log.error("Could not generate thumbnail for item: " + item.getId() + ". Item has no proxy WMS service.");
				}
				break;
			default:
				log.error("Cannot generate thumbanil for " + item.getId() + ". Item has null or invalid ItemType");
				break;
		}

		return result;
	}

	private static BufferedImage fetchBaseMap(String bboxVal) {
		String url = THUMBNAIL_BASE_WMS_URL;
		String additionalParams = String.format("&CRS=%s&WIDTH=%d&HEIGHT=%d&BBOX=%s", THUMBNAIL_CRS, BASE_MAP_FETCH_SIZE, bboxToWMSParam(bboxVal));
		return HttpUtil.fetchImageFromUri(url + additionalParams);
	}

	private static String bboxToWMSParam(String bboxVal) {
		return bboxVal.substring(bboxVal.indexOf("(")+1,bboxVal.indexOf(")")).replace(",", "").replace(' ', ',');
	}
}
