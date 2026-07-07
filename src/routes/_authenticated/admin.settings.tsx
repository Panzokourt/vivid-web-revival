import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  adminUsersQueryOptions,
  adminGrantRole,
  adminRevokeRole,
  myAdminRoleQueryOptions,
} from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — RIBALI Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => <AdminShell><SettingsPage /></AdminShell>,
});

function SettingsPage() {
  const { data: me } = useQuery(myAdminRoleQueryOptions());
  const { data: users = [], isLoading, error } = useQuery(adminUsersQueryOptions());
  const qc = useQueryClient();
  const grant = useServerFn(adminGrantRole);
  const revoke = useServerFn(adminRevokeRole);

  const grantMutation = useMutation({
    mutationFn: (v: { user_id: string; role: "admin" | "editor" }) => grant({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "users"] }); toast.success("Role granted"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const revokeMutation = useMutation({
    mutationFn: (v: { user_id: string; role: "admin" | "editor" }) => revoke({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "users"] }); toast.success("Role revoked"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-[0.3em] text-ink/50">Administration</div>
        <h1 className="text-3xl font-display mt-1">Users & roles</h1>
        <p className="text-sm text-ink/60 mt-2">Grant admin or editor access. Admins can manage everything; editors can edit content but can't delete or manage users.</p>
      </header>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-sm text-ink/50">Loading…</div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">{(error as Error).message}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last sign-in</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const isSelf = me?.userId === u.id;
                const hasAdmin = u.roles.includes("admin");
                const hasEditor = u.roles.includes("editor");
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.email}{isSelf && <span className="ml-2 text-xs text-ink/50">(you)</span>}</TableCell>
                    <TableCell className="flex gap-1 flex-wrap">
                      {u.roles.length === 0 ? <span className="text-xs text-ink/50">—</span> : u.roles.map((r) => <Badge key={r} variant="outline">{r}</Badge>)}
                    </TableCell>
                    <TableCell className="text-xs">{format(new Date(u.created_at), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-xs">{u.last_sign_in_at ? format(new Date(u.last_sign_in_at), "MMM d, HH:mm") : "—"}</TableCell>
                    <TableCell className="text-right space-x-1">
                      {!hasAdmin ? (
                        <Button size="sm" variant="outline" onClick={() => grantMutation.mutate({ user_id: u.id, role: "admin" })}>Make admin</Button>
                      ) : (
                        <Button size="sm" variant="ghost" disabled={isSelf} onClick={() => revokeMutation.mutate({ user_id: u.id, role: "admin" })}>Revoke admin</Button>
                      )}
                      {!hasEditor ? (
                        <Button size="sm" variant="outline" onClick={() => grantMutation.mutate({ user_id: u.id, role: "editor" })}>Make editor</Button>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => revokeMutation.mutate({ user_id: u.id, role: "editor" })}>Revoke editor</Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <Card className="p-6 text-sm text-ink/60">
        <div className="text-[11px] uppercase tracking-[0.3em] text-ink/50 mb-2">Inviting users</div>
        <p>New users sign up at <code>/auth</code>. Once they've registered, promote them from this page. The first signup automatically becomes admin.</p>
      </Card>
    </div>
  );
}
