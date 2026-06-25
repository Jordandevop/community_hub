import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import ProtectedRoute from "../components/ProtectedRoute";
import UsersPage from "../pages/UsersPage";
import ContactPage from "../pages/ContactPage";
import CreateEventPage from "../pages/CreateEventPage";
import EventsPage from "../pages/EventsPage";
import EventDetailsPage from "../pages/EventDetailsPage";
import SkillsPage from "../pages/SkillsPage";
import EditEventPage from "../pages/EditEventPage"

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <MainLayout />,
      children: [
        {
          index: true,
          element: <HomePage />,
        },
        {
          path: "login",
          element: <LoginPage />,
        },
        {
          path: "register",
          element: <RegisterPage />,
        },
        {
          path: "contact",
          element: <ContactPage />,
        },
        {
          path: "events",
          element: <EventsPage />,
        },
        {
          path: "skills",
          element: <SkillsPage />,
        },
        {
          path: "events/:id",
          element: <EventDetailsPage />,
        },
        {
          element: <ProtectedRoute />,
          children: [
            {
              path: "dashboard",
              element: <DashboardPage />,
            },
            {
              path: "users",
              element: <UsersPage />,
            },
            {
              path: "events/create",
              element: <CreateEventPage />,
            },
            { 
              path: "events/:id/edit",
              element: <EditEventPage /> 
            },
          ],
        },
      ],
    },
  ],
  // {
  //   basename: "/community-hub",
  // }
);

export default router;
