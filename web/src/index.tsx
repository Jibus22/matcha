import { render } from "solid-js/web";
import App from "./App";
import "./index.css";
import { refresh } from "./session";

// Restore the session from the refresh cookie first, so a signed-in page never flashes signed out.
refresh().finally(() =>
  render(() => <App />, document.getElementById("root")!),
);
