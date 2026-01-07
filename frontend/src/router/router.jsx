import { createBrowserRouter, Navigate } from "react-router";
import MyPosts from "../pages/Home/proposalFeed/MyPosts";
import Root from "../layout/Root";
import LandingPage from "../pages/landing/LandingPage";
import Home from "../layout/Home";
import MessagesBase from "../pages/Home/messages/MessagesBase";
import MyProfile from "../pages/Home/profile/MyProfile";
import NotFound from "../components/errors/NotFound";
import Notifications from "../pages/Home/notifications/Notifications";
import ProposalPostsBase from "../pages/Home/proposalFeed/ProposalPostsBase";
import RequestBase from "../pages/Home/requests/RequestBase";
import PendingRequests from "../pages/Home/requests/PendingRequests";
import AcceptedRequests from "../pages/Home/requests/AcceptedRequests";
import SentRequests from "../pages/Home/requests/SentRequests";
import Auth from "../layout/Auth";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgetPassword from "../pages/auth/ForgetPassword";
import PrivateRoute from "../privateRoutes/privateRoutes";
import PublicPosts from "../pages/Home/proposalFeed/PublicPosts";
import CreateProposalPost from "../components/posts/CreateProposalPost";
import Workspace from "../pages/Home/workspace/Workspace";
import PublicPapers from "../pages/Home/paperhub/PublicPapers";
import MyPapers from "../pages/Home/paperhub/MyPapers";
import CreatePaper from "../components/papers/CreatePaper";
import PaperDetails from "../pages/Home/paperhub/PaperDetails";
import PaperHub from "../pages/Home/paperhub/PaperHubBase";
import Overview from "../pages/Home/profile/Overview";
import PostDetails from "../pages/Home/proposalFeed/PostDetails";
import UserProfile from "../pages/Home/profile/UserProfile";

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
        path: "auth",
        Component: Auth,
        children: [
            {
                path: "login",
                Component: Login,
            },
            {
                path: "register",
                Component: Register,
            },
            {
                path: "forget-pass",
                Component: ForgetPassword,
            },
        ],


    },


    {
        path: "/home",
        element: <PrivateRoute>
            <Home />
        </PrivateRoute>,
        children: [
            {
                path: "posts",
                element: <ProposalPostsBase />,
                children: [
                    {
                        index: true,
                        element: <Navigate to="explore" replace />,
                    },
                    {
                        path: "explore",
                        element: <PublicPosts />,
                    },
                    {
                        path: "myposts",
                        element: <MyPosts />,
                    },
                    {
                        path: "create-post",
                        element: <CreateProposalPost />,
                    },
                    {
                        path: "post/:id",
                        element: <PostDetails />,
                    },
                ],
            },
            {
                path: "requests",
                element: <RequestBase />,
                children: [
                    {
                        index: true,
                        element: <Navigate to="pending" replace />,
                    },
                    {
                        path: "pending",
                        element: <PendingRequests />,
                    },
                    {
                        path: "accepted",
                        element: <AcceptedRequests />,
                    },
                    {
                        path: "sent",
                        element: <SentRequests />,
                    },
                ],
            },
            {
                path: "workspace",
                element: <Workspace />,
            },
            { path: "messages", element: <MessagesBase /> },
            { path: "messages/:uid", element: <MessagesBase /> },
            { path: "messages/c/:conversationId", element: <MessagesBase /> },
            {
                path: "profile/:uid",
                element: <UserProfile />
            },
            {
                path: "my-profile",
                element: <MyProfile />,
                children: [
                    {
                        index: true,
                        element: <Navigate to="overview" replace />,
                    },
                    {
                        path: "overview",
                        element: <Overview />,
                    },
                    {
                        path: "posts",
                        element: <MyPosts />,
                    },
                    {
                        path: "workspace",
                        element: <Workspace />,
                    },
                ],
            },
            { path: "notifications", element: <Notifications /> },
            {
                path: "paper-hub",
                element: <PaperHub />,
                children: [
                    {
                        index: true,
                        element: <Navigate to="explore-papers" replace />,
                    },
                    {
                        path: "explore-papers",
                        element: <PublicPapers />,
                    },
                    {
                        path: "my-papers",
                        element: <MyPapers />,
                    },
                    {
                        path: "share-my-paper",
                        element: <CreatePaper />,
                    },
                    {
                        path: "paper/:id",
                        element: <PaperDetails />,
                    },
                ],
            },
        ],
    },
    { path: "*", element: <NotFound /> },
]);