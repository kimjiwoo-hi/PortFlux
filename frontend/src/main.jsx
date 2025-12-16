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
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import FindIdPage from "./pages/FindIdPage.jsx";
import FindPasswordPage from "./pages/FindPasswordPage.jsx";
import SuccessPage from "./pages/SuccessPage.jsx";
import MyInfo from "./pages/MyInfo.jsx"
import MyPosts from "./pages/MyPosts.jsx";
import MyComments from "./pages/MyComments.jsx";
import SavedPosts from "./pages/SavedPosts.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <NoFooterLayout />,
    children: [
      {
<<<<<<< HEAD
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
=======
        index: true,
        element: <BoardLookup />
>>>>>>> f12d1f3c3c9e3d84a0e283391f05cb00dc9e64b4
      },
    ],
  },
  {
    element: <MainLayout />,
    children: [
      {
<<<<<<< HEAD
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
=======
        path: "/boardfree",
        element: <BoardFree />
      },
      {
        path: "/boardjob",
        element: <BoardJob />
      },
      {
        path: "/cart",
        element: <Cart />
      },
      {
        path: "/mypage",
        element: <MyPage />,
        children: [
          {
            path: "myinfo",
            element: <MyInfo />,
          },
          {
            path: "myposts",
            element: <MyPosts />
          },
          {
            path: "mycomments",
            element: <MyComments />
          },
          {
            path: "savedposts",
            element: <SavedPosts />
          }
        ]
      },
      {
        path: "/order-result",
        element: <OrderResultPage />
      },
      {
        path: "/login",
        element: <LoginPage />
      },
      {
        path: "/register",
        element: <RegisterPage />
      },
      {
        path: "/findid",
        element: <FindIdPage />
      },
      {
        path: "/findpassword",
        element: <FindPasswordPage />
      },
      {
        path: "/success",
        element: <SuccessPage />
      },
      {
        path: "/etc",
        element: <NotFound />
      },
      {
        path: "*",
        element: <NotFound />
>>>>>>> f12d1f3c3c9e3d84a0e283391f05cb00dc9e64b4
      }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
