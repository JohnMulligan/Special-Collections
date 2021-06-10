import axios from "axios";

const PER_PAGE = 1000;

export const apiOmekaUrl = '/api/';

const headers = {
  "Content-Type": "application/json",
};

export const PlaceHolder = require("../resources/image-placeholder.png");

export const Logo = require("../resources/SClogo.png");

export const PATH_PREFIX = "";

export const getItem = (baseAddress, itemId) => {
  return axios.get(`${apiOmekaUrl}items/${itemId}`);
};

export const getItems = (baseAddress, items) => {
  let requests = items.map((each) => getItem(baseAddress, each));
  return axios.all(requests);
};

export const searchItems = (baseAddress, params) => {
  return axios.get(`${apiOmekaUrl}items?per_page=${PER_PAGE}`, {
    params: params,
  });
};

export const createItem = (userInfo, payload) => {
  return axios.post(`${apiOmekaUrl}items`, payload, {
    params: {
      key_identity: userInfo.key_identity,
      key_credential: userInfo.key_credential,
    },
    headers: headers,
  });
};

export const getItemSetList = (baseAddress) => {
  return axios.get(`${apiOmekaUrl}item_sets?per_page=${PER_PAGE}`);
};

export const getItemSet = (baseAddress, itemSetId) => {
  return axios.get(`${apiOmekaUrl}item_sets/${itemSetId}`);
};

export const getItemsInItemSet = (baseAddress, itemSetId) => {
  return axios.get(`${apiOmekaUrl}items?item_set_id=${itemSetId}`);
};

export const createItemSet = (userInfo, payload) => {
  return axios.post(`${apiOmekaUrl}item_sets`, payload, {
    params: {
      key_identity: userInfo.key_identity,
      key_credential: userInfo.key_credential,
    },
    headers: headers,
  });
};

export const addItemsToItemSet = (userInfo, itemSetId, items) => {
  if (!userInfo || !itemSetId || !items) {
    return;
  }
  let requests = items.map((each) => {
    return axios
      .get(`${apiOmekaUrl}items/${each}`)
      .then((response) => {
        let originItemSets = response.data["o:item_set"]
          ? response.data["o:item_set"]
          : [];
        originItemSets.push({ "o:id": itemSetId });

        return axios.patch(
          `${apiOmekaUrl}items/${each}`,
          { "o:item_set": originItemSets },
          {
            params: {
              key_identity: userInfo.key_identity,
              key_credential: userInfo.key_credential,
            },
            headers: headers,
          }
        );
      });
  });
  return axios.all(requests);
};

export const getMedium = (baseAddress, medium) => {
  return axios.get(`${apiOmekaUrl}media/${medium}`);
};

export const getMedia = (baseAddress, media) => {
  let requests = media.map((each) => getMedium(baseAddress, each));
  return axios.all(requests);
};

export const getMediaInItem = (baseAddress, itemId) => {
  return axios.get(`${apiOmekaUrl}media?per_page=${PER_PAGE}&item_id=${itemId}`);
};

export const searchMedia = (baseAddress, params) => {
  return axios.get(`${apiOmekaUrl}media?per_page=${PER_PAGE}`, {
    params: params,
  });
};

export const getPropertyList = (baseAddress) => {
  return axios.get(`${apiOmekaUrl}properties?per_page=${PER_PAGE}`);
};

export const searchProperties = (baseAddress, params) => {
  return axios.get(`${apiOmekaUrl}properties?per_page=${PER_PAGE}`, {
    params: params,
  });
};

export const getResourceClassList = (baseAddress) => {
  return axios.get(`${apiOmekaUrl}resource_classes?per_page=${PER_PAGE}`);
};

export const searchResourceClasses = (baseAddress, params) => {
  return axios.get(
    `${apiOmekaUrl}resource_classes?per_page=${PER_PAGE}`,
    {
      params: params,
    }
  );
};

export const getResourceTemplateList = (baseAddress) => {
  return axios.get(`${apiOmekaUrl}resource_templates?per_page=${PER_PAGE}`);
};

export const getResourceTemplate = (baseAddress, templateId) => {
  return axios.get(`${apiOmekaUrl}resource_templates/${templateId}`);
};

export const getPropertiesInResourceTemplate = (baseAddress, templateId) => {
  return getResourceTemplate(baseAddress, templateId).then((response) => {
    let requests = response.data[
      "o:resource_template_property"
    ].map((property) => axios.get(property["o:property"]["@id"]));
    return axios.all(requests);
  });
};

export const getItemPath = (baseAddress, itemId, path = []) => {
  return getItem(baseAddress, itemId).then((response) => {
    if (response.data["dcterms:isPartOf"]) {
      path.push(...response.data["dcterms:isPartOf"]);
      return getItemPath(
        baseAddress,
        response.data["dcterms:isPartOf"][0]["value_resource_id"],
        path
      );
    } else {
      return path;
    }
  });
};

export const patchMedia = (userInfo, mediaId, payload) => {
  return axios.patch(
    `${apiOmekaUrl}media/${mediaId}`,
    payload,
    {
      params: {
        key_identity: userInfo.key_identity,
        key_credential: userInfo.key_credential,
      },
      headers: headers,
    }
  );
};

export const patchItem = (userInfo, itemId, payload) => {
  return axios.patch(
    `${apiOmekaUrl}items/${itemId}`,
    payload,
    {
      params: {
        key_identity: userInfo.key_identity,
        key_credential: userInfo.key_credential,
      },
      headers: headers,
    }
  );
};
