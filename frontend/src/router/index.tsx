import {
  createBrowserRouter
} from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Projects from "../pages/Projects";
import AppLayout from "../components/layout/AppLayout";

export const router =
  createBrowserRouter([
    {
      path: "/",
      element: <AppLayout />,

      children: [
        {
          index: true,
          element: <Dashboard />
        },
        {
          path: "projects",
          element: <Projects />
        }
      ]
    }
  ]);