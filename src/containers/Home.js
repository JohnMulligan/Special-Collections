import React, { useState, useEffect } from 'react';
import { useCookies } from "react-cookie";

import Explorer from "./Explorer";
import { getPropertyList } from "../utils/Utils";

const Home = () => {
    const [cookies] = useCookies(["userInfo"]);
    const [selectedProperties, setSelectedProperties] = useState([]);
    const [propertyList, setPropertyList] = useState([]);
    const [propertyLoading, setPropertyLoading] = useState(false);

    useEffect(() => {
        const fetchPropertyList = async () => {
            setPropertyLoading(true);
            
            const response = await getPropertyList(cookies.userInfo.host);
            let classes = response.data.map((each) => ({
                id: each["o:id"],
                title: each["o:label"],
            }));
            setPropertyList(classes);

            let propertyData = response.data.map((each) => ({
                "o:term": each["o:term"],
                "o:label": each["o:label"],
            }));
            setSelectedProperties(propertyData);
            setPropertyLoading(false);
        };

        fetchPropertyList();
    }, [cookies.userInfo]);

    return (
        <Explorer propertyList={propertyList} />
    );
};

export default Home;