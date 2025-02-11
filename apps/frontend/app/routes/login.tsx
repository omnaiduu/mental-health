import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const clientAction = async ({ request }: Route.ClientActionArgs) => {
  const formdata = await request.formData();
  const email = formdata.get("email")?.toString();
  const action = formdata.get("action");
  if (!action) {
    throw new Error("Invalid action");
  }
  const otp = formdata.get("otp")?.toString();
  

  const client = hcWithType(import.meta.env.VITE_BACKEND, {
    init: {
      credentials: "include",
    },
  });
  if (action === "request") {
    const data = await client.auth.$post({
      json: { email, action: "request" },
    });
    if (data.ok) {
      return await data.json();
    }
    if (data.status === 401) {
      return await data.json();
    }
  }
  if (action === "verify") {
    const data = await client.auth.$post({
      json: { otp, action: "verify" },
    });
    if (data.ok) {
      return await data.json();
    }
    if (data.status === 401) {
      return await data.json();
    }
  }
  if (action === "logout") {
    const data = await client.auth.$post({
      json: { action: "logout" },
    });
    if (data.ok) {
      return await data.json();
    }
    if (data.status === 401) {
      return await data.json();
    }
  }

  return {
    otpRequested: false,
    error: "Invalid action",
  };
};

import { useSecureFetcher } from "~/hooks/redirect";
import { hcWithType } from "@backend-api/om";
import type { Route } from "./+types/login";
import { Load } from "~/Icons";

function LoginForm() {
  const [value, setValue] = useState("");

  let authStatus = {
    otpRequested: false,
    error: "",
  };

  const f = useSecureFetcher<typeof clientAction>();

  const isSub = f.state === "submitting";

  if (f.data) {
    //@ts-ignore
    authStatus = f.data;
  }

  const isEmailSubmitted = authStatus.otpRequested;
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically validate the email and send OTP
    f.submit({ action: "request", email: value }, { method: "post" });
    setValue("");
    console.log("Email submitted");
  };

  const handleOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically validate the OTP
    f.submit({ action: "verify", otp: value }, { method: "post" });
    setValue("");
    console.log("OTP submitted");
  };

  return (
    <Card className="w-full bg-white/80 backdrop-blur-md transition-all duration-300 ease-in-out hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {isEmailSubmitted ? "Enter OTP" : "Login"}
        </CardTitle>
        <CardDescription>
          {isEmailSubmitted
            ? "We've sent a one-time password to your email."
            : "Enter your email to receive a one-time password."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={isEmailSubmitted ? handleOTPSubmit : handleEmailSubmit}>
          <div className="space-y-4">
            {!isEmailSubmitted ? (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  required
                  className="transition-all duration-300 ease-in-out focus:ring-2 focus:ring-primary"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="otp">One-Time Password</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter OTP"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  required
                  className="transition-all duration-300 ease-in-out focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
            <Button
              type="submit"
              disabled={isSub}
              className="w-full bg-primary text-background hover:bg-primary/90 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-70"
            >
              {isEmailSubmitted ? "Verify OTP" : "Send OTP"}
              {isSub && <Load />}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-text-base relative overflow-hidden">
      {/* Background image for both mobile and desktop */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/bg.jpg"
          alt="Background"
          className="w-full h-full object-cover "
        />
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col md:flex-row w-full h-full">
        {/* Left side (image) - hidden on mobile, visible on desktop */}
        <div className="hidden md:flex md:w-1/2" />

        {/* Right side (form) - full width on mobile, half width on desktop */}
        <div className="flex flex-col justify-center items-center p-8 w-full md:w-1/2 bg-white/30 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none">
          <div className="w-full max-w-md space-y-8 animate-fadeIn">
            {/* Logo */}
            <div className="flex justify-center">
              <img
                src="/assets/logo-96.png"
                alt="Logo"
                className="w-20 h-20 border-2 border-gray-300 rounded-2xl shadow-md shadow-text-base/10 transition-all duration-300 ease-in-out hover:scale-105"
              />
            </div>

            {/* Main text */}
            <h2 className="mt-6 text-center text-3xl font-extrabold text-text-base">
              Explore your thoughts and feelings in a safe space.
            </h2>

            {/* Login form */}
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
