import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";

// Layout
import MainLayout from "./layouts/MainLayout";
import NoFooterLayout from "./layouts/NoFooterLayout";

// Pages
import NotFound from "./pages/NotFound";
import BoardFree from "./pages/BoardFreePage";
import BoardJob from "./pages/BoardJobPage.jsx";
import BoardLookup from "./pages/BoardLookupPage.jsx";
import Cart from "./pages/CartPage.jsx";
import MyPage from "./pages/MyPage.jsx";
import OrderResultPage from "./pages/OrderResultPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import FindIdPage from "./pages/FindIdPage.jsx";
import FindPasswordPage from "./pages/FindPasswordPage.jsx";
import SuccessPage from "./pages/SuccessPage.jsx";

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
           {
        path: "login",
        element: <LoginPage />
      },
      {
        path: "register",
        element: <RegisterPage />
      },
      {
        path: "findid",
        element: <FindIdPage /> 
      },
      {
        path: "findpassword",
        element: <FindPasswordPage /> 
      },
      {
        path: "success",
        element: <SuccessPage />
      }
    ],
  },
  {
    element: <NoFooterLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: "boardlookup",
        element: <BoardLookup />
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
