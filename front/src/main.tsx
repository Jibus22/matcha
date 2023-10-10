import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Root from "./routes/root.tsx";
import Index from "./routes/index.tsx";
import RootErrorPage from "./errorPages/root-error-page.tsx";
import ChildrenErrorPage from "./errorPages/children-error-page.tsx";
import Login from "./routes/login.tsx";
import Signup from "./routes/signup.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <RootErrorPage />,
    children: [
      {
        errorElement: <ChildrenErrorPage />,
        children: [
          {
            index: true,
            element: <Index />,
          },
          {
            path: "/login",
            element: <Login />,
          },
          {
            path: "/signup",
            element: <Signup />,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
