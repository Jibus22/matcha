import {
  createSignal,
  createUniqueId,
  For,
  Show,
  splitProps,
  type JSX,
} from "solid-js";
import { createStore } from "solid-js/store";
import type { components } from "../../contracts/ts/auth";

type Problem = components["schemas"]["Problem"];

// A rule shown under a field as the user types: met, unmet, or only checked by the server.
export type Rule = [label: string, met: boolean | undefined];

export const passwordRules = (password: string): Rule[] => [
  ["At least 12 characters", password.length >= 12],
  ["Not a common word or password: checked when you send", undefined],
];

// createForm holds a form's values and the server's answer: each field error next to its input,
// anything else above the button.
export function createForm<T extends Record<string, string>>(initial: T) {
  const [values, setValues] = createStore<Record<string, string>>(initial);
  const [errors, setErrors] = createSignal<Record<string, string>>({});
  const [message, setMessage] = createSignal<string>();
  const [pending, setPending] = createSignal(false);

  // bind wires an input to a field. Editing the field clears the server's error on it.
  const bind = (name: keyof T & string) => ({
    name,
    get value() {
      return values[name];
    },
    get error() {
      return errors()[name];
    },
    onInput: (e: InputEvent & { currentTarget: HTMLInputElement }) => {
      setValues(name, e.currentTarget.value);
      setErrors(({ [name]: _, ...others }) => others);
    },
  });

  // submit wraps the call a form makes, once at a time, and shows what went wrong.
  const submit =
    (send: () => Promise<{ error?: Problem; response: Response }>) =>
    async (e: SubmitEvent) => {
      e.preventDefault();
      if (pending()) return;
      setPending(true);
      try {
        const { error, response } = await send();
        // Traefik's rate limit answers in plain text, not as a problem.
        if (response.status === 429) {
          setErrors({});
          setMessage("Too many attempts. Wait a minute, then try again.");
        } else {
          setErrors(
            Object.fromEntries(
              (error?.errors ?? []).map((f) => [f.field, f.message]),
            ),
          );
          setMessage(error && !error.errors ? error.title : undefined);
        }
      } catch {
        setMessage("Can't reach matcha right now. Try again in a moment.");
      } finally {
        setPending(false);
      }
    };

  return { values: values as T, bind, submit, message, pending };
}

export function Field(
  props: JSX.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
    rules?: Rule[];
  },
) {
  const [own, input] = splitProps(props, ["label", "error", "rules"]);
  const id = createUniqueId();
  // Screen readers announce the rules and the error after the field's name.
  return (
    <div class="field">
      <label for={id}>{own.label}</label>
      <input
        {...input}
        id={id}
        aria-invalid={own.error ? true : undefined}
        aria-describedby={`${id}-help`}
      />
      <div id={`${id}-help`}>
        <Show when={own.rules}>
          {(rules) => (
            <ul class="rules">
              <For each={rules()}>
                {([label, met]) => (
                  <li
                    classList={{ met: met === true, server: met === undefined }}
                  >
                    {label}
                  </li>
                )}
              </For>
            </ul>
          )}
        </Show>
        <Show when={own.error}>
          <p class="error">{own.error}</p>
        </Show>
      </div>
    </div>
  );
}

export const Alert = (props: { message?: string }) => (
  <Show when={props.message}>
    <p class="error" role="alert">
      {props.message}
    </p>
  </Show>
);
