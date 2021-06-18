import axios from "axios";
import { authGet, getHeadersOrRedirect } from './Utils'

const PER_PAGE = 9999;

export const apiOmekaUrl = '/api/';

export const fetchItems = async (
  endpoint,
  itemSetId,
  params,
  start,
  limit,
  sortBy = "id",
  sortOrder = "asc",
  fullTextSearch = null,
  search = null,
) => {
  const perPage = limit + (start % limit);
  const page = Math.ceil(start / perPage) + 1;

  const res = await authGet(`${apiOmekaUrl}${endpoint}`, {
    params: {
      ...params,
      item_set_id: itemSetId !== -1 ? itemSetId : null,
      sort_by: sortBy,
      sort_order: sortOrder,
      page,
      per_page: perPage,
      fulltext_search: fullTextSearch,
      ...search,
    },
  });

  const items = res.data.map((each) => ({
    ...each,
    key: each["o:id"],
  }));

  return {
    items: items,
    total: parseInt(res.headers['omeka-s-total-results']),
  };
};

/* TO DO: remove this old function after remove home legacy */
export const fetch = async (
  endpoint,
  itemSetId,
  params,
  start,
  limit,
  sortBy = "id",
  sortOrder = "asc"
) => {
  const perPage = limit + (start % limit);
  const page = Math.ceil(start / perPage) + 1;

  const res = await authGet(`${apiOmekaUrl}${endpoint}`, {
    params: {
      ...params,
      item_set_id: itemSetId !== -1 ? itemSetId : null,
      sort_by: sortBy,
      sort_order: sortOrder,
      page,
      per_page: perPage,
    },
  });

  const data = res.data.map((each) => ({
    ...each,
    key: each["o:id"],
  }));

  return data.slice(0, limit);
};

export const fetchSize = async (endpoint, params) => {
  const res = await authGet(`${apiOmekaUrl}${endpoint}`, {
    params: {
      ...params,
      per_page: Number.MAX_SAFE_INTEGER,
    },
  });

  return res.data.length;
};

export const fetchTemplates = async () => {
  const res = await authGet(`${apiOmekaUrl}resource_templates?per_page=${PER_PAGE}`);
  return res.data;
};

export const fetchItemSets = async () => {
  const res = await authGet(`${apiOmekaUrl}item_sets?per_page=${PER_PAGE}`);
  return res.data;
};

export const fetchResourceTemplates = async () => {
  const res = await authGet(`${apiOmekaUrl}resource_templates?per_page=${PER_PAGE}`);
  return res.data;
};

export const fetchOne = async (endpoint, id) => {
  const res = await authGet(`${apiOmekaUrl}${endpoint}/${id}`);
  return res.data;
};

export const patchResourceItem = async (endpoint, id, payload) => {
  const h = getHeadersOrRedirect();
  if (!h) return null;
  return axios.patch(`${apiOmekaUrl}${endpoint}/${id}`, payload, { headers: h });
};
