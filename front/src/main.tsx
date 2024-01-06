import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Auth, { loader as rootLoader } from "./routes/auth/auth.tsx";
import RootErrorPage from "./errorPages/root-error-page.tsx";
import ChildrenErrorPage from "./errorPages/children-error-page.tsx";
import Signup, {
  loader as signupLoader,
  action as signupAction,
} from "./routes/auth/signup.tsx";
import Signin, {
  loader as signinLoader,
  action as signinAction,
} from "./routes/auth/signin.tsx";
import PasswordReset, {
  loader as passwordResetLoader,
  action as passwordResetAction,
} from "./routes/auth/password-reset.tsx";
import Register, {
  loader as registerLoader,
  action as registerAction,
} from "./routes/register/register.tsx";
import Root, {
  loader as appLoader,
  action as appAction,
} from "./routes/root/root.tsx";
import Index from "./routes/auth/index.tsx";
import RegisterIndex, {
  loader as indexRegisterLoader,
  action as indexRegisterAction,
} from "./routes/register/index.tsx";
import RootIndex, {
  action as indexRootAction,
  loader as indexRootLoader,
} from "./routes/root/index.tsx";
import Profile from "./routes/root/profile.tsx";
import Stalkers from "./routes/root/stalkers.tsx";
import Admirers from "./routes/root/admirers.tsx";
import OtherProfile, {
  loader as otherProfileLoader,
} from "./routes/root/OtherProfile.tsx";

const router = createBrowserRouter([
  {
    path: "/auth",
    element: <Auth />,
    loader: rootLoader,
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
            path: "signin",
            element: <Signin />,
            loader: signinLoader,
            action: signinAction,
          },
          {
            path: "signup",
            element: <Signup />,
            loader: signupLoader,
            action: signupAction,
          },
          {
            path: "passwordreset",
            element: <PasswordReset />,
            loader: passwordResetLoader,
            action: passwordResetAction,
          },
        ],
      },
    ],
  },
  {
    path: "/register",
    element: <Register />,
    errorElement: <RootErrorPage />,
    loader: registerLoader,
    action: registerAction,
    children: [
      {
        errorElement: <ChildrenErrorPage />,
        children: [
          {
            index: true,
            element: <RegisterIndex />,
            loader: indexRegisterLoader,
            action: indexRegisterAction,
          },
        ],
      },
    ],
  },
  {
    path: "/",
    element: <Root />,
    errorElement: <RootErrorPage />,
    loader: appLoader,
    action: appAction,
    children: [
      {
        errorElement: <ChildrenErrorPage />,
        children: [
          {
            index: true,
            element: <RootIndex />,
            action: indexRootAction,
            loader: indexRootLoader,
          },
          {
            path: "profile",
            element: <Profile />,
          },
          {
            path: "stalkers",
            element: <Stalkers />,
          },
          {
            path: "admirers",
            element: <Admirers />,
          },
          {
            path: ":username",
            element: <OtherProfile />,
            loader: otherProfileLoader,
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
