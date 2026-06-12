import {
  createBrowserRouter
} from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Projects from "../pages/Projects";
import ProjectDetails from "../pages/ProjectDetails";
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "../components/layout/ProtectedRoute";

export const router =
  createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      ),

      children: [
        {
          index: true,
          element: <Dashboard />
        },
        {
          path: "projects",
          element: <Projects />
        },
        {
          path: "projects/:id",
          element: <ProjectDetails />
        }
      ]
    },
    {
      path: "/login",
      element: <Login />
    }
  ]);
