import { useEffect, useState } from "react";
import { BehaviorSubject } from "rxjs";

let sexPreference = new Set<string>();

export const sexPreference$ = new BehaviorSubject(sexPreference);

export const onSexPreferencesChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const value = e.currentTarget.value;
  const checked = e.currentTarget.checked;
  if (checked) sexPreference.add(value);
  else sexPreference.delete(value);

  sexPreference$.next(sexPreference);
};

export const useSexPreference = () => {
  const [sp, setSexPreference] = useState(sexPreference);

  useEffect(() => {
    const sub = sexPreference$.subscribe((newSp) =>
      setSexPreference(new Set(newSp))
    );
    return () => sub.unsubscribe();
  }, [sexPreference$]);
  return sp;
};
