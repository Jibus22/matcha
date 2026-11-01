import { createSignal } from "solid-js";
import type { components } from "../../contracts/ts/auth";
import { api } from "./api";

type Tokens = components["schemas"]["Tokens"];

// The access token lives in memory only. The refresh token is an HttpOnly cookie: page scripts
// never see it; the browser sends it to /api/auth on its own.
const [accessToken, setAccessToken] = createSignal<string>();
let renewal: ReturnType<typeof setTimeout> | undefined;

export { accessToken };

// The username claim, for display. The page doesn't verify the token: the services do.
export function username() {
  const token = accessToken();
  if (!token) return undefined;
  const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  return (JSON.parse(atob(payload)) as { username: string }).username;
}

export function signedIn(tokens: Tokens) {
  setAccessToken(tokens.accessToken);
  clearTimeout(renewal);
  // A minute early, so requests never carry an expired token.
  renewal = setTimeout(refresh, (tokens.expiresIn - 60) * 1000);
}

export function signedOut() {
  setAccessToken(undefined);
  clearTimeout(renewal);
}

// refresh trades the cookie for new tokens, silently. A refresh token works once and every tab
// shares the cookie, so tabs take turns: two sending the same one would end the session. Web Locks
// need a secure context, which localhost and https both are.
export async function refresh() {
  const { data } = await navigator.locks
    .request("matcha-refresh", () => api.POST("/api/auth/refresh"))
    .catch(() => ({ data: undefined }));
  if (data) signedIn(data);
  else signedOut();
}

export async function logout() {
  await api.POST("/api/auth/logout");
  signedOut();
}
