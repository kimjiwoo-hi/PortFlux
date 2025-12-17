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
import BoardLookupWrite from "./pages/BoardLookupWritePage.jsx";
import BoardLookupRead from "./pages/BoardLookupRead.jsx";
import Cart from "./pages/CartPage.jsx";
import MyPage from "./pages/MyPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import OrderResultPage from "./pages/OrderResultPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import FindIdPage from "./pages/FindIdPage.jsx";
import FindPasswordPage from "./pages/FindPasswordPage.jsx";
import SuccessPage from "./pages/SuccessPage.jsx";
import MyInfo from "./pages/MyInfo.jsx";
import MyPosts from "./pages/MyPosts.jsx";
import MyComments from "./pages/MyComments.jsx";
import SavedPosts from "./pages/SavedPosts.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <NoFooterLayout />,
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
        path: "/board/write",
<<<<<<< HEAD
        element: <BoardLookupWrite />,
      },
=======
        element: <BoardLookupWrite />
      },
      {
        path: "/board/lookup/:postId",
        element: <BoardLookupRead />
      }
>>>>>>> 4116ad0c9e15aa010d7c3ded9b8e061e5f0000e9
    ],
  },
  {
    element: <MainLayout />,
    children: [
      {
        path: "boardlookup",
        element: <BoardLookup />,
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
        path: "findid",
        element: <FindIdPage />,
      },
      {
        path: "findpassword",
        element: <FindPasswordPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
