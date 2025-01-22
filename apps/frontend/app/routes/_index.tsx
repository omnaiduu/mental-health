import { useRedirectHook } from "~/hooks/redirect";

export default function Page() {
  useRedirectHook({
    data: { redirect: true, location: "/app" },
  });
  return null;
}
