import React from "react";
import { Layout } from "antd";
import { MainpageRouter } from "../route/Routers";
import { withRouter } from "react-router-dom";

import "antd/dist/antd.css";

import LogoHeader from "../components/LogoHeader";

const MainPage = () => {
    return (
        <Layout>
            <LogoHeader />
            <MainpageRouter />
        </Layout>
    );
};

export default withRouter(MainPage);
