import React from "react";
import type { RouteObject } from "react-router-dom";

const Landing = React.lazy(() => import("@/pages/Landing"));
const Dashboard = React.lazy(() => import("@/pages/Dashboard"));
const Profile = React.lazy(() => import("@/pages/Profile"));
const Client = React.lazy(() => import("@/pages/Client"));
const Appointment = React.lazy(() => import("@/pages/Appointment"));
export type RoutesType = {
  [key in
    | "DEFAULT"
    | "DASHBOARD"
    | "PROFILE"
    | "APPOINTMENT"
    | "CLIENT"
    | "CALENDAR"
    | "CHAT"
    | "SETTINGS"
    | "NOT_FOUND"]: {
    path: string;
    headerName?: string;
    routeType: "public" | "un-authenticate" | "authenticate";
    isHeaderVisible?: boolean;
    isFooterVisible?: boolean;
    element: RouteObject["element"];
    errorElement?: RouteObject["errorElement"];
  };
};
// & {
//   [key in
//     | 'USER_MANAGEMENT_EDIT_DOCTOR'
//   ]: {
//     navigatePath: (id: number | string) => string;
//   };
// };

export const ROUTES: RoutesType = {
  DEFAULT: {
    path: "/",
    routeType: "public",
    element: <Landing />,
  },
  PROFILE: {
    path: "/profile",
    routeType: "authenticate",
    element: <Profile />,
  },
  DASHBOARD: {
    path: "/dashboard",
    routeType: "authenticate",
    headerName: "Dashboard",
    element: <Dashboard />,
  },
  APPOINTMENT: {
    path: "/appointment",
    routeType: "authenticate",
    headerName: "Appointment",
    element: <Appointment />,
  },
  CLIENT: {
    path: "/client",
    routeType: "authenticate",
    headerName: "Client",
    element: <Client />,
  },
  CALENDAR: {
    path: "/calendar",
    routeType: "authenticate",
    headerName: "Calendar",
    element: <>Calendar</>,
  },
  CHAT: {
    path: "/chat",
    routeType: "authenticate",
    headerName: "Chat",
    element: <>Chat</>,
  },
  SETTINGS: {
    path: "/settings",
    routeType: "authenticate",
    headerName: "Settings",
    element: <>Settings</>,
  },
  NOT_FOUND: {
    path: "*",
    routeType: "public",
    element: <>NOT FOUND</>,
  },
};
