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
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import OrderResultPage from "./pages/OrderResultPage.jsx";
import Chat from "./pages/ChattingPage.jsx";
<<<<<<< HEAD
=======
=======
>>>>>>> 4a5835726b0396c26f0d34b837aa53a755ff7bba
import FindIdPage from "./pages/FindIdPage.jsx";
import FindPasswordPage from "./pages/FindPasswordPage.jsx";
>>>>>>> 12fd9f7899622aade5d94e9810490b0551b309fa

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: "boardfree",
        element: <BoardFree />,
      },
      {
        path: "boardjob",
        element: <BoardJob />,
      },
      {
        path: "cart",
        element: <Cart />,
      },
      {
        path: "mypage",
        element: <MyPage />,
      },
      {
        path: "chat",
        element: <Chat />,
      },
      {
        path: "order-result",
        element: <OrderResultPage />,
      },
      {
<<<<<<< HEAD
        path: "order-result",
        element: <OrderResultPage />,
=======
        path: "login",
        element: <LoginPage />
>>>>>>> 12fd9f7899622aade5d94e9810490b0551b309fa
      },
      {
        path: "register",
        element: <RegisterPage />
      }
    ],
  },
  {
    element: <NoFooterLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: "boardlookup",
        element: <BoardLookup />,
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
      }
    ],
  },
  {
    element: <NoFooterLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: "boardlookup",
        element: <BoardLookup />,
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
      }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
