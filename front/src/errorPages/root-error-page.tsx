import { useRouteError } from "react-router";
import { errorTypeWorkaround } from "./utils";

export default function RootErrorPage() {
  const error = errorTypeWorkaround(useRouteError());

  return (
    <>
      <h1>RootErrorPage</h1>
      <p>{error}</p>
    </>
  );
}
