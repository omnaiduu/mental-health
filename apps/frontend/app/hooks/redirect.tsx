import { useEffect } from "react";
import { useFetcher, useMatches, useNavigate } from "react-router";

export interface RedirectData {
  redirect?: boolean;
  location?: string;
}

export function useRedirectHook({ data }: { data: RedirectData | undefined }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!data) return;


    if (data.redirect) {
      
      navigate(data.location ?? "/login", {
        replace: true,
      });
    }
  }, [data, navigate]);
}

export function Redirect() {
  const matches = useMatches();
  const matchData = matches
    .map((match) => match.data as RedirectData)
    .find((data) => data?.redirect);

  useRedirectHook({ data: matchData });

  return null;
}

type BaseFetcher<T> = ReturnType<typeof useFetcher<T>>;
export function useSecureFetcher<T>(options?: {
  key?: string;
}): BaseFetcher<T> {
  const f = useFetcher<T>({
    key: options?.key,
  }) as BaseFetcher<T>;
console.log(f.data);
  useRedirectHook({ data: f.data as RedirectData | undefined });

  return f;
}
