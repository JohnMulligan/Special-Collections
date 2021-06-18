import axios from "axios";
import { history } from "../route/Routers"

const PER_PAGE = 1000;

export const apiOmekaUrl = '/api/';

const headers = {
  "Content-Type": "application/json",
};

export const PlaceHolder = require("../resources/image-placeholder.png");

export const Logo = require("../resources/SClogo.png");

export const PATH_PREFIX = "";

export const getHeadersOrRedirect = () => {
  let token = null;
  try {
    token = JSON.parse(localStorage.getItem('userInfo')).token;
  } catch { }
  if (!token) {
    // Redirect to auth.
    history.push(PATH_PREFIX + '/login');
    return null;
  }
  return {...headers, "x-access-token": token };
}

export const authGet = async (url, config = {}) => {
  const h = getHeadersOrRedirect();
  return await axios.get(url, { ...config, headers: h });
}

export const getItem = (itemId) => {
  return authGet(`${apiOmekaUrl}items/${itemId}`);
};

export const getItems = (items) => {
  let requests = items.map((each) => getItem(each));
  return authGet(requests);
};

export const searchItems = (params) => {
  return authGet(`${apiOmekaUrl}items?per_page=${PER_PAGE}`, {
    params: params,
  });
};

export const createItem = async (payload) => {
  const h = getHeadersOrRedirect();
  if (!h) return null;
  return await axios.post(`${apiOmekaUrl}items`, payload, {
    headers: h,
  });
};

export const getItemSetList = () => {
  return authGet(`${apiOmekaUrl}item_sets?per_page=${PER_PAGE}`);
};

export const getItemSet = (itemSetId) => {
  return authGet(`${apiOmekaUrl}item_sets/${itemSetId}`);
};

export const getItemsInItemSet = (itemSetId) => {
  return authGet(`${apiOmekaUrl}items?item_set_id=${itemSetId}`);
};

export const createItemSet = async (payload) => {
  const h = getHeadersOrRedirect();
  if (!h) return null;
  return await axios.post(`${apiOmekaUrl}item_sets`, payload, {
    headers: h,
  });
};

export const addItemsToItemSet = async (itemSetId, items) => {
  if (!itemSetId || !items) {
    return null;
  }
  const h = getHeadersOrRedirect();
  if (!h) return null;
  let requests = items.map(async (each) => {
    const response = await authGet(`${apiOmekaUrl}items/${each}`);
    let originItemSets = response.data["o:item_set"]
      ? response.data["o:item_set"]
      : [];
    originItemSets.push({ "o:id": itemSetId });
    return await axios.patch(
      `${apiOmekaUrl}items/${each}`,
      { "o:item_set": originItemSets },
      {
        headers: h,
      }
    );
  });
  return await axios.all(requests);
};

export const getMedium = (medium) => {
  return authGet(`${apiOmekaUrl}media/${medium}`);
};

export const getMedia = (media) => {
  let requests = media.map((each) => getMedium(each));
  return authGet(requests);
};

export const getMediaInItem = (itemId) => {
  return authGet(`${apiOmekaUrl}media?per_page=${PER_PAGE}&item_id=${itemId}`);
};

export const searchMedia = (params) => {
  return authGet(`${apiOmekaUrl}media?per_page=${PER_PAGE}`, {
    params: params,
  });
};

export const getPropertyList = () => {
  return authGet(`${apiOmekaUrl}properties?per_page=${PER_PAGE}`);
};

export const searchProperties = (params) => {
  return authGet(`${apiOmekaUrl}properties?per_page=${PER_PAGE}`, {
    params: params,
  });
};

export const getResourceClassList = () => {
  return authGet(`${apiOmekaUrl}resource_classes?per_page=${PER_PAGE}`);
};

export const searchResourceClasses = (params) => {
  return authGet(
    `${apiOmekaUrl}resource_classes?per_page=${PER_PAGE}`,
    {
      params: params,
    }
  );
};

export const getResourceTemplateList = () => {
  return authGet(`${apiOmekaUrl}resource_templates?per_page=${PER_PAGE}`);
};

export const getResourceTemplate = (templateId) => {
  return authGet(`${apiOmekaUrl}resource_templates/${templateId}`);
};

export const getPropertiesInResourceTemplate = async (templateId) => {
  const response = await getResourceTemplate(templateId);
  let requests = response.data["o:resource_template_property"]
    .map((property) => authGet(property["o:property"]["@id"]));
  return await axios.all(requests);
};

export const getItemPath = (itemId, path = []) => {
  return getItem(itemId).then((response) => {
    if (response.data["dcterms:isPartOf"]) {
      path.push(...response.data["dcterms:isPartOf"]);
      return getItemPath(
        response.data["dcterms:isPartOf"][0]["value_resource_id"],
        path
      );
    } else {
      return path;
    }
  });
};

export const patchMedia = async (mediaId, payload) => {
  const h = getHeadersOrRedirect();
  if (!h) return null;
  return await axios.patch(
    `${apiOmekaUrl}media/${mediaId}`,
    payload,
    {
      headers: h,
    }
  );
};

export const patchItem = async (itemId, payload) => {
  const h = getHeadersOrRedirect();
  if (!h) return null;
  return await axios.patch(
    `${apiOmekaUrl}items/${itemId}`,
    payload,
    {
      headers: h,
    }
  );
};
