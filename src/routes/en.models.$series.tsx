import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/en/models/$series")({
  component: () => <Outlet />,
});
