import { createBrowserRouter } from "react-router";
import Root from "../layout/Root";
import LandingPage from "../pages/landing/LandingPage";
import Home from "../layout/Home";

import Workspace from "../pages/Home/workspace/Workspace";
import MessagesBase from "../pages/Home/messages/MessagesBase";
import MyProfile from "../pages/Home/profile/MyProfile";
import NotFound from "../components/errors/NotFound";
import Notifications from "../pages/Home/notifications/Notifications";
import PaperHub from "../pages/Home/paperhub/PaperHub";
import ProposalPostsBase from "../pages/Home/proposalFeed/ProposalPostsBase";
import RequestBase from "../pages/Home/requests/RequestBase";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      {
        index: true,
        Component: LandingPage,
      },
    ],
  },

  {
    path: "/home",
    Component: Home,
    children: [
      {
        path: "posts",
        element: <ProposalPostsBase/>,
      },
      {
        path: "requests",
        element: <RequestBase/>,
      },
      {
        path: "workspace",
        element: <Workspace />,
      },
      { path: "messages", element: <MessagesBase /> },
      { path: "my-profile", element: <MyProfile /> },
      { path: "notifications", element: <Notifications /> },
      { path: "paper-hub", element: <PaperHub/>},
    ],
  },
  { path: "*", element: <NotFound /> },
]);
