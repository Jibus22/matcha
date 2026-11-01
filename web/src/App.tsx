import {
  A,
  Route,
  Router,
  useNavigate,
  type RouteSectionProps,
} from "@solidjs/router";
import { Show } from "solid-js";
import {
  ForgotPassword,
  Home,
  Login,
  ResetPassword,
  Signup,
  Verify,
} from "./pages";
import { logout, username } from "./session";

function Layout(props: RouteSectionProps) {
  const navigate = useNavigate();
  return (
    <>
      <header>
        <A href="/" class="brand">
          matcha
        </A>
        <nav>
          <Show
            when={username()}
            fallback={
              <>
                <A href="/login">Sign in</A>
                <A href="/signup">Sign up</A>
              </>
            }
          >
            {(name) => (
              <>
                <span>{name()}</span>
                <button onClick={() => logout().then(() => navigate("/login"))}>
                  Sign out
                </button>
              </>
            )}
          </Show>
        </nav>
      </header>
      <main>{props.children}</main>
      <footer>
        {/* A full page load: the router would otherwise look for a /docs route. */}
        <a href="/docs" rel="external">
          API docs
        </a>
      </footer>
    </>
  );
}

export default function App() {
  return (
    <Router root={Layout}>
      <Route path="/" component={Home} />
      <Route path="/signup" component={Signup} />
      <Route path="/verify" component={Verify} />
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="*" component={() => <h1>Page not found</h1>} />
    </Router>
  );
}
