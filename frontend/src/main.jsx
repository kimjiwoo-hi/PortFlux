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
import BoardFreeWritePage from "./pages/BoardFreeWritePage";
import BoardFreeDetailPage from "./pages/BoardFreeDetailPage";
import BoardJob from "./pages/BoardJobPage.jsx";
import BoardJobDetailPage from "./pages/BoardJobDetailPage.jsx";
import BoardJobCreatePage from "./pages/BoardJobCreatePage.jsx";
import BoardJobEditPage from "./pages/BoardJobEditPage.jsx";
import BoardLookup from "./pages/BoardLookupPage.jsx";
import BoardLookupWrite from "./pages/BoardLookupWritePage.jsx";
import BoardLookupRead from "./pages/BoardLookupRead.jsx";
import BoardLookupEditPage from "./pages/BoardLookupEditPage.jsx";
import Cart from "./pages/CartPage.jsx";
// ★ 신규 추가: 결제 페이지 임포트
import PaymentPage from "./pages/PaymentPage.jsx"; 
import Chat from "./pages/ChattingPage.jsx";
import OrderResultPage from "./pages/OrderResultPage.jsx";
import OrderListPage from "./pages/OrderListPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import FindIdPage from "./pages/FindIdPage.jsx";
import FindPasswordPage from "./pages/FindPasswordPage.jsx";
import SuccessPage from "./pages/SuccessPage.jsx";
import UserProfile from "./pages/UserProfile.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <NoFooterLayout />,
    children: [
      {
        index: true,
        element: <BoardLookup />,
      },
      {
        path: "/board/write",
        element: <BoardLookupWrite />,
      },
      {
        path: "/board/lookup/:postId",
        element: <BoardLookupRead />,
      },
      {
        path: "/board/lookup/edit/:postId",
        element: <BoardLookupEditPage />,
      },
    ],
  },
  {
    element: <MainLayout />,
    children: [
      {
        path: "/boardfree",
        element: <BoardFree />,
      },
      {
        path: "boardjob",
        element: <BoardJob />,
      },
      {
        path: "boardjob/:postId",
        element: <BoardJobDetailPage />,
      },
      {
        path: "boardjob/create",
        element: <BoardJobCreatePage />,
      },
      {
        path: "boardjob/edit/:postId",
        element: <BoardJobEditPage />,
      },
      {
        path: "/cart",
        element: <Cart />,
      },
      // ★ 신규 추가: 결제 페이지 경로 등록
      {
        path: "/payment",
        element: <PaymentPage />,
      },
      {
        path: "/chat",
        element: <Chat />,
      },
      {
        path: "/order-result",
        element: <OrderResultPage />,
      },
      {
        path: "/order-list",
        element: <OrderListPage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/findid",
        element: <FindIdPage />,
      },
      {
        path: "/findpassword",
        element: <FindPasswordPage />,
      },
      {
        path: "/success",
        element: <SuccessPage />,
      },
      {
        path: "/user/:userNum",
        element: <UserProfile />,
      },
      {
        path: "/mypage/:nickname",
        element: <UserProfile />,
      },
      {
        path: "/etc",
        element: <NotFound />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
      {
        path: "boardfree/write",
        element: <BoardFreeWritePage />
      },
      {
        path: "boardfree/:id", // 상세 페이지 라우트
        element: <BoardFreeDetailPage />
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  
    <RouterProvider router={router} />
  
);