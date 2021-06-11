import React from "react";
import {
  Switch,
  Router,
  Route,
  Redirect,
} from "react-router-dom";
import MainPage from "../containers/Mainpage";
import TranscriptView from "../containers/TranscriptView";
import NoteView from "../containers/NoteView";
import Login from "../containers/Login";
import Home from "../containers/Home";
import HomeLegacy from "../containers/HomeLegacy";
import ProjectsPage from "../containers/ProjectsPage";
import ItemView from "../containers/ItemView";
import RelationGraph from "../components/RelationGraph";
import { PATH_PREFIX } from "../utils/Utils";
import NetworkContainer from "../containers/NetworkContainer";
import { createBrowserHistory } from "history";
import { isLogged } from '../containers/Login'

export const history = createBrowserHistory();

function PrivateRoute({ children, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) =>
        isLogged() ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: PATH_PREFIX + "/login",
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
}

export const MainpageRouter = () => {
  return (
    <Switch>
      <PrivateRoute path={PATH_PREFIX + "/admin/items"}>
        <ProjectsPage />
      </PrivateRoute>
      <PrivateRoute path={PATH_PREFIX + "/admin/home"}>
        <Home />
      </PrivateRoute>
      <PrivateRoute path={PATH_PREFIX + "/admin/home-legacy"}>
        <HomeLegacy />
      </PrivateRoute>
      <PrivateRoute path={PATH_PREFIX + "/admin/network"}>
        <NetworkContainer />
      </PrivateRoute>
      <Redirect to={PATH_PREFIX + "/admin/home"} />
    </Switch>
  );
};

export const MainRouter = () => {
  return (
    <Router history={history}>
      <Switch>
        <PrivateRoute path={PATH_PREFIX + "/media/:mediaList"}>
          <TranscriptView />
        </PrivateRoute>
        <PrivateRoute path={PATH_PREFIX + "/note/:targetList"}>
          <NoteView />
        </PrivateRoute>
        <PrivateRoute path={PATH_PREFIX + "/items/:itemId"}>
          <ItemView />
        </PrivateRoute>
        <PrivateRoute path={PATH_PREFIX + "/network/:itemId"}>
          <RelationGraph />
        </PrivateRoute>
        <PrivateRoute path={PATH_PREFIX + "/admin"}>
          <MainPage />
        </PrivateRoute>
        <Route path={PATH_PREFIX + "/login"}>
          <Login />
        </Route>
        <Redirect to={PATH_PREFIX + "/admin"} />
      </Switch>
    </Router>
  );
};
