import { createBrowserRouter } from "react-router";
import Root from "../layout/Root";
import LandingPage from "../pages/landing/LandingPage";
import Home from "../layout/Home";
import PublicPosts from "../pages/Home/proposalFeed/PublicPosts";
import PendingRq from "../pages/Home/requests/PendingRq";
import Workspace from "../pages/Home/workspace/Workspace";
import MessagesBase from "../pages/Home/messages/MessagesBase";
import MyProfile from "../pages/Home/profile/MyProfile";
import NotFound from "../components/errors/NotFound";

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
        element: <PublicPosts />,
      },
      {
        path: "requests",
        element: <PendingRq />,
      },
      {
        path: "workspace",
        element: <Workspace />,
      },
      { path: "messages", element: <MessagesBase /> },
      { path: "my-profile", element: <MyProfile /> },
    ],
  },
  { path: "*", element: <NotFound /> },
]);
