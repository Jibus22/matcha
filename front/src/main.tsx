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
import Gender, { action as genderAction } from "./routes/register/gender.tsx";
import Preferences, {
  action as preferencesAction,
} from "./routes/register/preferences.tsx";
import Biography, {
  action as biographyAction,
} from "./routes/register/biography.tsx";
import Interests, {
  action as interestsAction,
} from "./routes/register/interests.tsx";
import Pictures, {
  action as picturesAction,
} from "./routes/register/pictures.tsx";

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
            path: "gender",
            element: <Gender />,
            action: genderAction,
          },
          {
            path: "preferences",
            element: <Preferences />,
            action: preferencesAction,
          },
          {
            path: "biography",
            element: <Biography />,
            action: biographyAction,
          },
          {
            path: "interests",
            element: <Interests />,
            action: interestsAction,
          },
          {
            path: "pictures",
            element: <Pictures />,
            action: picturesAction,
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
        children: [{}],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
