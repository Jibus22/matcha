import { useRouteError } from "react-router-dom";
import { errorTypeWorkaround } from "./utils";

export default function ChildrenErrorPage() {
  const error = errorTypeWorkaround(useRouteError());

  return (
    <>
      <h1>ChildrenErrorPage</h1>
      <p>{error}</p>
    </>
  );
}
