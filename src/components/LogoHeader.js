import React from "react";
import { Link } from "react-router-dom";
import { useCookies } from "react-cookie";

import { Layout } from "antd";

import { Button } from 'primereact/button';

import { LinkOutlined } from "@ant-design/icons";

import { Logo, PATH_PREFIX } from "../utils/Utils";

import "antd/dist/antd.css";

const { Header } = Layout;

const LogoHeader = () => {
  let [cookies, setCookie, removeCookie] = useCookies(["userInfo"]);

  const logout = () => {
    removeCookie("userInfo", { path: "/" });
  }

  return (
    <Header
      style={{ background: "#FFF", height: "13vh", position: "relative" }}
    >
      <div className="logo">
        <div
          style={{
            float: "left",
            position: "absolute",
            bottom: 10,
          }}
        >
          <Link to={PATH_PREFIX + "/admin/home"}>
            <img src={Logo} alt="logo.png" width="100" height="100" />
          </Link>
        </div>
        <div
          style={{
            left: "180px",
            position: "absolute",
            bottom: 24,
          }}
        >
          <Link to={PATH_PREFIX + "/admin/home"}>
            <h1
              style={{
                fontFamily: "Goudy Old Style",
                fontStyle: "italic",
                fontWeight: "bolder",
                lineHeight: "26.4px",
                color: "#093eba",
                fontSize: "36px",
              }}
            >
              SPECIAL COLLECTIONS
            </h1>
          </Link>
        </div>
        <div
          style={{
            float: "right",
          }}
        >
          <a
            href="https://github.com/Yudai-Chen/Special-Collections/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkOutlined /> Learn More
          </a>

          <Button key="logout" label="Logout" className="p-button-sm p-button-raised" onClick={() => { logout(); }} />
        </div>
      </div>
    </Header>
  );
};

export default LogoHeader;
