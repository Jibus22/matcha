import { createResource } from "solid-js";
import { api } from "./api";

export default function App() {
  const [auth] = createResource(() =>
    api.GET("/api/auth/health").then(
      (r) => r.data?.status ?? "down",
      () => "down",
    ),
  );
  return (
    <main>
      <h1>matcha</h1>
      <p>auth: {auth() ?? "…"}</p>
      <a href="/docs">API docs</a>
    </main>
  );
}
