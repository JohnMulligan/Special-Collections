import React from "react";
import { Link } from "react-router-dom";
import { useCookies } from "react-cookie";

import { Button } from 'primereact/button';

import { Logo, PATH_PREFIX } from "../utils/Utils";

import "antd/dist/antd.css";

const LogoHeader = () => {
  let [cookies, removeCookie] = useCookies(["token"]);


  const openPath = (path) => {
      window.location.href = PATH_PREFIX + '/' + path;
  }

  const logout = () => {
      removeCookie('token');
      openPath('login');
  }

  return (
      <div className="header-toolbar">
          <div className="p-grid p-ai-center">
              <div className="p-col-2">
                  <div className="p-d-flex p-jc-center">
                    <Link to={PATH_PREFIX + "/admin/home"}>
                        <img src={Logo} alt="Special Collections" width="100" height="100" />
                    </Link>
                  </div>
              </div>
              <div className="p-col-4">
                  <Link to={PATH_PREFIX + "/admin/home"}>
                      <h1 className="header-title">SPECIAL COLLECTIONS</h1>
                  </Link>
              </div>
              <div className="p-col-6">
                  <div className="p-d-flex p-jc-end">
                      <Button key="home" label="Home" className="p-button-sm p-button-raised p-button-info p-mr-2" icon="pi pi-folder" onClick={() => { openPath('admin/home'); }}/>
                      <Button key="home" label="Home Legacy" className="p-button-sm p-button-raised p-button-danger p-mr-2" icon="pi pi-folder" onClick={() => { openPath('admin/home-legacy'); }}/>
                      <Button key="network" label="Network" className="p-button-sm p-button-raised p-button-info p-mr-2" icon="pi pi-share-alt" onClick={() => { openPath('admin/network'); }}/>
                      <Button key="learn-more" label="Learn More" className="p-button-sm p-button-raised p-mr-2" icon="pi pi-link" onClick={() => { window.open("https://github.com/Yudai-Chen/Special-Collections/", "_blank").focus(); }}/>
                      <Button key="logout" label="Logout" className="p-button-sm p-button-raised p-button-warning p-mr-2" icon="pi pi-sign-out" onClick={() => { logout(); }} />
                  </div>
              </div>
          </div>
      </div>
  );
};

export default LogoHeader;
