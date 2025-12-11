import { StrictMode } from "react";

import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";

// Layout
import MainLayout from "./layouts/MainLayout";

// Pages
import NotFound from "./pages/NotFound";
import BoardFree from "./pages/BoardFreePage";
import BoardJob from "./pages/BoardJobPage.jsx";
import BoardLookup from "./pages/BoardLookupPage.jsx";
import Cart from "./pages/CartPage.jsx";
import MyPage from "./pages/MyPage.jsx";
import OrderResultPage from "./pages/OrderResultPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: "boardfree",
        element: <BoardFree />
      },
      {
        path: "boardjob",
        element: <BoardJob />
      },
      {
        path: "boardlookup",
        element: <BoardLookup />
      },
      {
        path: "cart",
        element: <Cart />
      },
      {
        path: "mypage",
        element: <MyPage />
      },
      {
        path: "order-result",
        element: <OrderResultPage />
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
