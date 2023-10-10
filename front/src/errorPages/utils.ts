import { isRouteErrorResponse } from "react-router-dom";

// As type returned by UseRouteError is unknown this function narrows the type.
// Another option would be to add 'useUnknownInCatchVariables: true' in tsconfig
export const errorTypeWorkaround = (err: unknown) => {
  let errorMessage: string;

  if (isRouteErrorResponse(err)) {
    // error is type `ErrorResponse`
    errorMessage = err.data.message || err.statusText;
  } else if (err instanceof Error) {
    errorMessage = err.message;
  } else if (typeof err === "string") {
    errorMessage = err;
  } else {
    console.error(err);
    errorMessage = "Unknown error";
  }

  return errorMessage;
};
