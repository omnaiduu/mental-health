import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { GlobalProgress } from "./GlobalProgress";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import {
  isRouteErrorResponse,
  Link,
  Outlet,
  useLocation,
  useNavigation,
  useRouteError,
} from "react-router";
import type { Route } from "../app/+types/route";
import { ChatIcon, Note, Notes, Out, Plus } from "./Icons";
import { useEffect, useRef } from "react";
import { Redirect, useSecureFetcher } from "~/hooks/redirect";
import { hcWithType } from "@backend-api/om";

export async function clientAction({ request }: Route.ClientActionArgs) {
  const client = hcWithType(import.meta.env.VITE_BACKEND);
  const formData = await request.formData();
  const action = formData.get("action")?.toString();

  if (action === "insert") {
    const res = await client.api.chat.create.$post(
      {
        json: {
          action: "create",
        },
      },
      {
        init: {
          credentials: "include",
        },
      }
    );
    const data = await res.json();
    console.log(data);
    if (!res.ok) {
      throw new Error("Failed to insert chat");
    }
    return data;
  }
  if (action === "note-insert") {
    const res = await client.api.note.insert.$post(
      {
        json: {
          action: "insert",
        },
      },
      {
        init: {
          credentials: "include",
        },
      }
    );
    const data = await res.json();
    console.log(data);
    if (!res.ok) {
      throw new Error("Failed to insert note");
    }
    return data;
  }
  if (action === "logout") {
    const res = await client.auth.$post({
      json: {
        action: "logout",
      },
    });
    if (!res.ok) {
      throw new Error("Failed to Logout");
    }
    const data = await res.json();
    return data;
  }
}

export default function app() {
  return (
    <LayoutCompontent>
      <Outlet />
    </LayoutCompontent>
  );
}

function LayoutCompontent({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="bg-background p-6 h-dvh flex min-w-96 ">
      <SidebarComp />
      <OnRouteChange />
      <div className="flex-1 flex justify-center overflow-hidden">
        <div className="flex flex-col w-full max-w-screen-lg  h-full">
          <div className="flex-none pb-4">
            <Heading />
          </div>
          {/* Modified Content Area for scroll */}
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
      <Redirect />
      <GlobalProgress />
    </SidebarProvider>
  );
}

function OnRouteChange() {
  const location = useLocation();

  const { isMobile, setOpenMobile, openMobile } = useSidebar();
  const route = useRef<string>();
  useEffect(() => {
    if (!route.current === undefined) {
      route.current = location.pathname;
      return;
    }
    const isCurrentPath = location.pathname === route.current;

    if (!isCurrentPath) {
      if (isMobile && openMobile) {
        setOpenMobile(false);
      }
      route.current = location.pathname;
    }
  }, [location.pathname, isMobile, openMobile, setOpenMobile]);
  return null;
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <LayoutCompontent>
        <div>
          <p>{error.data}</p>
        </div>
      </LayoutCompontent>
    );
  } else if (error instanceof Error) {
    return (
      <LayoutCompontent>
        <div className="flex flex-col gap-6 justify-center h-full font-extrabold text-5xl">
          <h1>
            There was a problem processing your request. Please try refreshing
            the page.
          </h1>
          <p>{error.message}</p>
        </div>
      </LayoutCompontent>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}

function SidebarComp() {
  const f = useSecureFetcher<typeof clientAction>();
  const navigation = useNavigation();
  const loading = navigation.state === "loading";
 
  return (
    <Sidebar>
      <SidebarContent className="bg-background p-4 space-y-2">
        <SidebarGroup>
          <SidebarGroupLabel>Short Cut</SidebarGroupLabel>
          <ActionItem
            onClick={() => {
              f.submit(
                {
                  action: "insert",
                },
                {
                  method: "POST",
                }
              );
            }}
            name="Create Chat"
          >
            <Plus />
          </ActionItem>
          <ActionItem
            onClick={() => {
              f.submit(
                {
                  action: "note-insert",
                },
                {
                  method: "POST",
                }
              );
            }}
            name="Create Note"
          >
            <Note />
          </ActionItem>
          <ActionItem
            onClick={() => {
              f.submit(
                {
                  action: "logout",
                },
                {
                  method: "POST",
                }
              );
            }}
            name="logout"
          >
            <Out />
          </ActionItem>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Space</SidebarGroupLabel>
          <MenuItem to="/app/chats" name="Chat History">
            <ChatIcon />
          </MenuItem>
          <MenuItem to="/app/notes" name="Notes">
            <Notes />
          </MenuItem>
          {/* <MenuItem to="/app/settings" name="Settings">
            <Settings />
          </MenuItem> */}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-8">
        {loading && (
          <>
            <p className="text-text-base animate-pulse font-semibold">
              Almost ready for you to start chatting...
            </p>
          </>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

function Heading() {
  const { toggleSidebar } = useSidebar();
  return (
    <div>
      <Button
        onClick={() => {
          toggleSidebar();
        }}
        className="p-4 bg-primary hover:bg-success shadow-md z-40 "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="size-10"
        >
          <path
            fillRule="evenodd"
            d="M2 6.75A.75.75 0 0 1 2.75 6h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 6.75Zm0 6.5a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z"
            clipRule="evenodd"
          />
        </svg>
      </Button>
    </div>
  );
}

function MenuItem({
  children,
  to,
  name,
}: {
  children: React.ReactNode;
  to: string;
  name: string;
}) {
  return (
    <motion.div
      className="flex items-center text-text-base p-2 rounded-md"
      whileHover={{
        scale: 0.95,
      }}
      transition={{
        ease: "easeInOut",
      }}
    >
      {children}

      <Link to={to} className="ml-6 font-medium">
        {name}
      </Link>
    </motion.div>
  );
}

function ActionItem({
  children,
  onClick,
  name,
}: {
  children: React.ReactNode;
  onClick: () => void;
  name: string;
}) {
  return (
    <motion.div
      className="flex items-center text-text-base p-2 rounded-md"
      whileHover={{
        scale: 0.95,
      }}
      transition={{
        ease: "easeInOut",
      }}
      onClick={onClick}
    >
      {children}
      <span className="ml-6 font-medium">{name}</span>
    </motion.div>
  );
}
