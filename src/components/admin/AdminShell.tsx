import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Ship,
  Inbox,
  MapPin,
  FileText,
  Image as ImageIcon,
  BarChart3,
  Users,
  LogOut,
  ExternalLink,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { myAdminRoleQueryOptions } from "@/lib/admin.functions";
import { toast } from "sonner";

type NavItem = {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  adminOnly?: boolean;
};

const items: NavItem[] = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, exact: true },
  { title: "Models", url: "/admin/models", icon: Ship },
  { title: "Leads", url: "/admin/leads", icon: Inbox },
  { title: "Dealers", url: "/admin/dealers", icon: MapPin },
  { title: "Content", url: "/admin/content", icon: FileText },
  { title: "Media", url: "/admin/media", icon: ImageIcon },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Settings", url: "/admin/settings", icon: Users, adminOnly: true },
];

function AppSidebar({ role, email }: { role: "admin" | "editor" | null; email: string | null }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const qc = useQueryClient();

  const isActive = (url: string, exact?: boolean) =>
    exact ? currentPath === url : currentPath === url || currentPath.startsWith(url + "/");

  async function handleSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link
          to="/admin"
          className="flex items-center gap-2 px-2 py-3 font-display tracking-widest text-lg"
        >
          <span className="text-copper">◆</span>
          {!collapsed && <span>RIBALI</span>}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items
                .filter((i) => !i.adminOnly || role === "admin")
                .map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url, "exact" in item ? item.exact : false)}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Site</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/" className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    {!collapsed && <span>View site</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed && email && (
          <div className="px-2 py-2 text-xs">
            <div className="text-sidebar-foreground/60 uppercase tracking-widest text-[10px]">
              {role ?? "no access"}
            </div>
            <div className="truncate">{email}</div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start gap-2 text-sidebar-foreground/80 hover:text-sidebar-foreground"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sign out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { data: me, isLoading, error } = useQuery(myAdminRoleQueryOptions());

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-paper text-ink">
        <div className="text-sm text-ink/50 uppercase tracking-widest">Loading…</div>
      </div>
    );
  }

  if (error || !me || !me.role) {
    return (
      <div className="min-h-screen grid place-items-center bg-paper text-ink px-4">
        <div className="max-w-md text-center">
          <div className="text-[11px] uppercase tracking-[0.3em] text-ink/50">403</div>
          <h1 className="mt-2 text-3xl font-display">Access denied</h1>
          <p className="mt-4 text-sm text-ink/70">
            Your account doesn't have admin or editor privileges. Ask an existing admin to grant you access.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Button asChild variant="outline"><Link to="/">Back to site</Link></Button>
            <Button
              variant="ghost"
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/auth";
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-paper text-ink">
        <AppSidebar role={me.role} email={me.email} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-ink/10 px-4 bg-white/60 backdrop-blur">
            <SidebarTrigger />
            <div className="ml-3 text-[11px] uppercase tracking-[0.3em] text-ink/50">
              RIBALI · Admin
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
