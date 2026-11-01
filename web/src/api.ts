import createClient from "openapi-fetch";
import type { paths } from "../../contracts/ts/auth";

// Same origin as the page: Traefik sends /api/… to the services.
export const api = createClient<paths>();
