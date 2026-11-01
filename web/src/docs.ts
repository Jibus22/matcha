// The contract files themselves, bundled as text: the docs always match what the services serve.
import auth from "../../contracts/openapi/auth.yaml?raw";

declare const Scalar: {
  createApiReference(selector: string, config: { content: string }): void;
};

Scalar.createApiReference("#app", { content: auth });
