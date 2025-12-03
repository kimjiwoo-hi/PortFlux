import { StrictMode } from "react";

import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";

// Layout
import MainLayout from "./layouts/MainLayout";

// Pages
import NotFound from "./pages/NotFound";
import BoardLookup from "./pages/BoardLookupPage.jsx";

// Componentes


const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <NotFound />,
    children: [
      /*
      {
        path: 'about',
        element: <About />,
      }
      */
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
