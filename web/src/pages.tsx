import { A, useNavigate, useSearchParams } from "@solidjs/router";
import { createResource, createSignal, Match, Show, Switch } from "solid-js";
import { api } from "./api";
import { Alert, createForm, Field, passwordRules } from "./form";
import { signedIn, signedOut, username } from "./session";

export function Home() {
  return (
    <Show
      when={username()}
      fallback={
        <>
          <h1>Welcome to matcha</h1>
          <p>
            <A href="/signup">Create an account</A> or{" "}
            <A href="/login">sign in</A>.
          </p>
        </>
      }
    >
      {(name) => (
        <>
          <h1>Hi {name()}</h1>
          <p>You're signed in.</p>
        </>
      )}
    </Show>
  );
}

export function Signup() {
  const form = createForm({
    email: "",
    username: "",
    firstName: "",
    lastName: "",
    password: "",
  });
  const [sentTo, setSentTo] = createSignal<string>();
  const name = () => form.values.username;
  return (
    <>
      <h1>Create your account</h1>
      <Show
        when={!sentTo()}
        fallback={
          <>
            <p>
              Almost there: open the link we sent to {sentTo()} to verify your
              account. It works once, for 24 hours.
            </p>
            <Resend email={sentTo()} />
          </>
        }
      >
        <form
          onSubmit={form.submit(async () => {
            const r = await api.POST("/api/auth/signup", { body: form.values });
            if (r.data) setSentTo(r.data.email);
            return r;
          })}
        >
          <Field
            label="Email"
            type="email"
            autocomplete="email"
            required
            maxLength={254}
            {...form.bind("email")}
          />
          <Field
            label="Username"
            autocomplete="username"
            required
            pattern="[A-Za-z0-9_.]{3,20}"
            {...form.bind("username")}
            rules={[
              ["3 to 20 characters", name().length >= 3 && name().length <= 20],
              [
                "Letters, digits, _ and . only",
                /^[A-Za-z0-9_.]+$/.test(name()),
              ],
            ]}
          />
          <Field
            label="First name"
            autocomplete="given-name"
            required
            maxLength={50}
            {...form.bind("firstName")}
          />
          <Field
            label="Last name"
            autocomplete="family-name"
            required
            maxLength={50}
            {...form.bind("lastName")}
          />
          <Field
            label="Password"
            type="password"
            autocomplete="new-password"
            required
            minLength={12}
            maxLength={128}
            {...form.bind("password")}
            rules={passwordRules(form.values.password)}
          />
          <Alert message={form.message()} />
          <button disabled={form.pending()}>Create my account</button>
        </form>
        <p>
          Already have an account? <A href="/login">Sign in</A>
        </p>
      </Show>
    </>
  );
}

// Resend asks for a new verification link; the answer never says whether the address has an account.
function Resend(props: { email?: string }) {
  const form = createForm({ email: props.email ?? "" });
  const [sent, setSent] = createSignal(false);
  return (
    <Show
      when={!sent()}
      fallback={
        <p>
          If this address has an unverified account, a new link is on its way.
        </p>
      }
    >
      <form
        onSubmit={form.submit(async () => {
          const r = await api.POST("/api/auth/verification/resend", {
            body: form.values,
          });
          setSent(r.response.ok);
          return r;
        })}
      >
        <Field
          label="Email"
          type="email"
          autocomplete="email"
          required
          {...form.bind("email")}
        />
        <Alert message={form.message()} />
        <button disabled={form.pending()}>Send a new link</button>
      </form>
    </Show>
  );
}

// Verify is where the email's link lands: it verifies the account once, on arrival.
export function Verify() {
  const [params] = useSearchParams();
  const [outcome] = createResource(() =>
    api
      .POST("/api/auth/verification", {
        body: { token: String(params.token ?? "") },
      })
      .then(
        (r) => (r.response.ok ? "verified" : "invalid"),
        () => "offline",
      ),
  );
  return (
    <>
      <h1>Email verification</h1>
      <Switch fallback={<p>Checking your link…</p>}>
        <Match when={outcome() === "verified"}>
          <p>
            Your account is verified. <A href="/login">Sign in</A>
          </p>
        </Match>
        <Match when={outcome() === "invalid"}>
          <p class="error">
            This link is invalid, has expired or was already used. Ask for a new
            one:
          </p>
          <Resend />
        </Match>
        <Match when={outcome() === "offline"}>
          <p class="error">
            Can't reach matcha right now. Reload the page in a moment.
          </p>
        </Match>
      </Switch>
    </>
  );
}

export function Login() {
  const form = createForm({ username: "", password: "" });
  const [unverified, setUnverified] = createSignal(false);
  const navigate = useNavigate();
  return (
    <>
      <h1>Sign in</h1>
      <form
        onSubmit={form.submit(async () => {
          const r = await api.POST("/api/auth/login", { body: form.values });
          setUnverified(r.response.status === 403);
          if (r.data) {
            signedIn(r.data);
            navigate("/");
          }
          return r;
        })}
      >
        <Field
          label="Username"
          autocomplete="username"
          required
          {...form.bind("username")}
        />
        <Field
          label="Password"
          type="password"
          autocomplete="current-password"
          required
          {...form.bind("password")}
        />
        <Alert message={form.message()} />
        <button disabled={form.pending()}>Sign in</button>
      </form>
      <Show when={unverified()}>
        <Resend />
      </Show>
      <p>
        <A href="/forgot-password">Forgot your password?</A> ·{" "}
        <A href="/signup">Create an account</A>
      </p>
    </>
  );
}

export function ForgotPassword() {
  const form = createForm({ email: "" });
  const [sent, setSent] = createSignal(false);
  return (
    <>
      <h1>Forgot your password?</h1>
      <Show
        when={!sent()}
        fallback={
          <p>
            If an account uses this address, a reset link is on its way. It
            works once, for 30 minutes.
          </p>
        }
      >
        <form
          onSubmit={form.submit(async () => {
            const r = await api.POST("/api/auth/password-reset", {
              body: form.values,
            });
            setSent(r.response.ok);
            return r;
          })}
        >
          <Field
            label="Email"
            type="email"
            autocomplete="email"
            required
            {...form.bind("email")}
          />
          <Alert message={form.message()} />
          <button disabled={form.pending()}>Email me a link</button>
        </form>
      </Show>
    </>
  );
}

// ResetPassword is where the reset email's link lands.
export function ResetPassword() {
  const [params] = useSearchParams();
  const form = createForm({ password: "" });
  const [done, setDone] = createSignal(false);
  return (
    <>
      <h1>Choose a new password</h1>
      <Show
        when={!done()}
        fallback={
          <p>
            Your password is changed, and every session is signed out.{" "}
            <A href="/login">Sign in</A> with the new one.
          </p>
        }
      >
        <form
          onSubmit={form.submit(async () => {
            const r = await api.POST("/api/auth/password-reset/confirm", {
              body: {
                token: String(params.token ?? ""),
                password: form.values.password,
              },
            });
            if (r.response.ok) {
              signedOut();
              setDone(true);
            }
            return r;
          })}
        >
          <Field
            label="New password"
            type="password"
            autocomplete="new-password"
            required
            minLength={12}
            maxLength={128}
            {...form.bind("password")}
            rules={passwordRules(form.values.password)}
          />
          <Alert message={form.message()} />
          <button disabled={form.pending()}>Change my password</button>
        </form>
        <p>
          Link expired? <A href="/forgot-password">Ask for a new one</A>
        </p>
      </Show>
    </>
  );
}
