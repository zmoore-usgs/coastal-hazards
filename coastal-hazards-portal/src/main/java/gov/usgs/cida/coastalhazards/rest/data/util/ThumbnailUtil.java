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

import org.apache.commons.lang3.tuple.ImmutablePair;
import org.apache.commons.lang3.tuple.Pair;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ThumbnailUtil {
	private static final Logger log = LoggerFactory.getLogger(GeoserverUtil.class);
	private static final DynamicReadOnlyProperties props;
	private static final String portalPublicUrl;
    private static final String thumbanilBaseWmsUrl;
    private static final String thumbnailCRS;
    private static final Integer MAX_THUMBNAIL_CHILD_DEPTH = 4;
    private static final Integer THUMBNAIL_SIZE = 150;
    
    static {
		props = JNDISingleton.getInstance();
		portalPublicUrl = props.getProperty("coastal-hazards.public.url");
        thumbanilBaseWmsUrl = props.getProperty("coastal-hazards.thumbnail.basemap.wms");
        thumbnailCRS = "EPSG:3857";
    }

    public static String generateBase64Thumbnail(Item item) {
        if(item.getItemType().equals(ItemType.uber)) {
            log.error("Thumbnail generation is not supported for uber.");
            return null;
        }

        try(ItemManager manager = new ItemManager()) {
            BufferedImage baseMap = null;

            // Transform and validate Bbox
            Bbox transformedBox = Bbox.copyToCRS(Bbox.copyToSquareBox(item.getBbox()), thumbnailCRS);
            String bboxVal = transformedBox != null ? transformedBox.getBbox() : null;

            if(bboxVal == null || bboxVal.isEmpty()) {
                log.error("Failed to retrieve Bbox for thumbnail for item: " + item.getId());
                return null;
            }

            // Generate thumbanil
            BufferedImage itemThumb = generateThumbnail(item, item.getId(), bboxVal, 1, manager, 0).getLeft();
            
            // If basemap WMS param configured try to pull base map image
            if(thumbanilBaseWmsUrl != null && !thumbanilBaseWmsUrl.isEmpty()) {
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

        if(item.getItemType().equals(ItemType.uber)) {
            log.error("Thumbnail generation is not supported for uber.");
        } else if(item.getItemType().equals(ItemType.template) || item.getItemType().equals(ItemType.aggregation)) {
            log.debug("Supplied item is of type: " + item.getItemType() + ". Generating thumbnail from visible children..");

            // Exit case
            if(depth < MAX_THUMBNAIL_CHILD_DEPTH) {
                List<String> itemIds = item.getDisplayedChildren();

                if(item.isShowChildren() && !itemIds.isEmpty()) {
                    List<BufferedImage> childThumbnails = new ArrayList<>();
                    for(String itemId : itemIds) {
                        Item childItem = manager.load(itemId);
                        if(childItem != null) {
                            Pair<BufferedImage,Integer> childResult = generateThumbnail(childItem, selectedItem, bboxVal, ribbonNum, manager, depth + 1);

                            if(childResult.getLeft() != null) {
                                childThumbnails.add(childResult.getLeft());
                            }

                            ribbonNum = childResult.getRight();
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
        } else {
            Service proxyWms = null;
            if(item.getServices() != null && !item.getServices().isEmpty()) {
                for(Service service : item.getServices()) {
                    if(service.getType().equals(Service.ServiceType.proxy_wms)) {
                        proxyWms = service;
                        break;
                    }
                }
            }

            if(proxyWms != null) {
                String crsParam = "CRS=" + thumbnailCRS;
                String layerParam = "LAYER=" + proxyWms.getServiceParameter();
                String bboxParam = "BBOX=" + bboxToWMSParam(bboxVal);
                String sldParam = "SLD=" + portalPublicUrl + "/data/sld/" + item.getId();
                sldParam += "?selectedItem=" + selectedItem;
                sldParam += item.isRibbonable() ? "%26ribbon=" + ribbonNum : "";
                String sizeParam = "WIDTH=" + THUMBNAIL_SIZE + "&" + "HEIGHT=" + THUMBNAIL_SIZE;
                result = new ImmutablePair<>(
                    HttpUtil.fetchImageFromUri(GeoserverUtil.buildGeoServerWMSRequest(layerParam, bboxParam, sldParam, sizeParam, crsParam)),
                    ribbonNum + 1
                );
            } else {
                log.error("Could not generate thumbnail for item: " + item.getId() + ". Item has no proxy WMS service.");
            }
        }

        return result;
    }

    private static BufferedImage fetchBaseMap(String bboxVal) {
        String url = thumbanilBaseWmsUrl;
        String crsParam = "CRS=" + thumbnailCRS;
        String sizeParam = "WIDTH=500" + "&" + "HEIGHT=500";
        String bboxParam = "BBOX=" + bboxToWMSParam(bboxVal);
        url += "&" + sizeParam + "&" + bboxParam + "&" + crsParam;
        return HttpUtil.fetchImageFromUri(url);
    }

    private static String bboxToWMSParam(String bboxVal) {
        return bboxVal.substring(bboxVal.indexOf("(")+1,bboxVal.indexOf(")")).replace(",", "").replace(' ', ',');
    }
}
