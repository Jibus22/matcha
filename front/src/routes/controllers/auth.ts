import { ISigninInput, ISignupInput } from "../auth/utils";

export const apiSignup = import.meta.env.VITE_STATIC_GH_PAGE
  ? (inputs: ISignupInput) => {
      const user = { registration: "/register/gender", ...inputs };

      sessionStorage.setItem("user", JSON.stringify(user));

      return null;
    }
  : (inputs: ISignupInput) => {
      // TODO envoyer une requête à l'API qui va sanitize de son côté
      // const ret = fetch(POST, "/api/signup", {inputs});
      return null;
    };

export const apiSignin = import.meta.env.VITE_STATIC_GH_PAGE
  ? (inputs: ISigninInput) => {
      const err = {
        username: null,
        password: null,
        err: "authentication error",
      };

      let user = sessionStorage.user;
      if (!user) {
        return { err: err };
      } else {
        user = JSON.parse(user);
      }
      if (
        inputs.username !== user.username ||
        inputs.password !== user.password
      )
        return { err: err };

      // mimic session cookie from server
      sessionStorage.setItem("session_id", "false_session_id_0123456789");
      // registration contains user registration stage (the route)
      return { registration: user.registration };
    }
  : (inputs: ISigninInput) => {
      // TODO envoyer une requête à l'API qui va sanitize de son côté
      // const ret = fetch(POST, "/api/signin", {inputs});

      // ! This if statement and its return is only used to shutdown a
      // typescript error in signin.tsx
      if (!inputs)
        return {
          err: {
            username: null,
            password: null,
            err: "authentication error",
          },
        };

      return { registration: "" };
    };
