import axios from 'axios';
import { fetch } from "../utils/OmekaS";

export class CollectionService {

    getCollection(baseAddress, endpoint, itemSetId, params, start, limit, sortBy = "id", sortOrder = "asc")
    {
        const fetchCollection = async () => {
            const data = await fetch(
                baseAddress,
                endpoint,
                itemSetId,
                params,
                start,
                limit,
                sortBy,
                sortOrder
            );

            let collection = data.map((each) => {
                let row = {
                  id: each['o:id'],
                  title: each['o:title'],
                  thumbnail: each['thumbnail_display_urls']['square'],
                };
                return row;
            });
            return collection;
        };
        return fetchCollection();
    }
}