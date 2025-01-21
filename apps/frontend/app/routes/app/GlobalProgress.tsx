import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { useFetchers, useNavigation } from "react-router";
import { toast } from "sonner";


export function GlobalProgress() {
  const navigation = useNavigation();
  const loading = navigation.state === "loading";
  const submitting = navigation.state === "submitting";

  const fetchers = useFetchers();

  useEffect(() => {
    if (loading) {
      toast("Almost ready for you...");
    }
    if (submitting) {
      console.log("submitting");
      toast("Processing your request...");
    }
  }, [loading, submitting]);

  useEffect(() => {
    fetchers.forEach((fetcher) => {
      console.log(fetcher.state, "fetcher state");
      if (fetcher.state === "submitting") {
        toast("Processing your request...");
      }
    });
  }, [fetchers]);

    return <Toaster closeButton position="top-right"  />;
}
