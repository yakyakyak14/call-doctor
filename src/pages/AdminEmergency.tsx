import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface EmergencyCall {
  id: string;
  to_number: string;
  call_id: string | null;
  source: string | null;
  coords: any | null;
  ip: string | null;
  user_id: string | null;
  user_agent: string | null;
  created_at: string;
}

const PAGE_SIZES = [10, 20, 50];

const AdminEmergency = () => {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);

  const [searchNumber, setSearchNumber] = useState("");
  const [source, setSource] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
      setUserEmail((user?.email as string) ?? null);
      const allowed = (import.meta.env.VITE_ADMIN_EMAILS || "").split(",").map((e: string) => e.trim().toLowerCase()).filter(Boolean);
      setAuthorized(Boolean(user?.email) && (allowed.length === 0 || allowed.includes((user?.email || "").toLowerCase())));
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, session) => {
      const u = session?.user;
      setUserId(u?.id ?? null);
      setUserEmail((u?.email as string) ?? null);
      const allowed = (import.meta.env.VITE_ADMIN_EMAILS || "").split(",").map((e: string) => e.trim().toLowerCase()).filter(Boolean);
      setAuthorized(Boolean(u?.email) && (allowed.length === 0 || allowed.includes((u?.email || "").toLowerCase())));
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Reset to first page when filters change
    setPage(1);
  }, [searchNumber, source, fromDate, toDate, pageSize]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["adminEmergency", page, pageSize, searchNumber, source, fromDate, toDate],
    enabled: authorized,
    queryFn: async () => {
      let query = supabase
        .from("emergency_calls")
        .select("id,to_number,call_id,source,coords,ip,user_id,user_agent,created_at", { count: "exact" })
        .order("created_at", { ascending: false });

      if (searchNumber.trim()) {
        query = query.ilike("to_number", `%${searchNumber.trim()}%`);
      }
      if (source.trim()) {
        query = query.ilike("source", `%${source.trim()}%`);
      }
      if (fromDate) query = query.gte("created_at", new Date(fromDate).toISOString());
      if (toDate) query = query.lte("created_at", new Date(toDate).toISOString());

      const offset = (page - 1) * pageSize;
      const { data, error, count } = await query.range(offset, offset + pageSize - 1);
      if (error) throw error;
      return { rows: (data as EmergencyCall[]) || [], count: count || 0 };
    },
    staleTime: 30_000,
  });

  const total = data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Admin • Emergency Calls</h1>
          <div className="text-sm text-muted-foreground">{userEmail || "Not signed in"}</div>
        </div>

        {!authorized ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Sign in with an admin email to view emergency calls.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-5 gap-3">
                  <div>
                    <Label className="mb-1 block">To Number</Label>
                    <Input placeholder="e.g. +234" value={searchNumber} onChange={(e) => setSearchNumber(e.target.value)} />
                  </div>
                  <div>
                    <Label className="mb-1 block">Source</Label>
                    <Input placeholder="e.g. AmbulancePage" value={source} onChange={(e) => setSource(e.target.value)} />
                  </div>
                  <div>
                    <Label className="mb-1 block">From</Label>
                    <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                  </div>
                  <div>
                    <Label className="mb-1 block">To</Label>
                    <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                  </div>
                  <div>
                    <Label className="mb-1 block">Page Size</Label>
                    <select className="w-full rounded-md border bg-background px-3 py-2" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                      {PAGE_SIZES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" onClick={() => { setSearchNumber(""); setSource(""); setFromDate(""); setToDate(""); }}>Reset</Button>
                  <Button variant="outline" onClick={() => refetch()}>Refresh</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Results ({total})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-muted-foreground">Loading…</p>
                ) : isError ? (
                  <p className="text-red-600">Failed to load calls. Try refreshing.</p>
                ) : data && data.rows.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-muted-foreground">
                        <tr>
                          <th className="py-2 pr-4">Time</th>
                          <th className="py-2 pr-4">To</th>
                          <th className="py-2 pr-4">Source</th>
                          <th className="py-2 pr-4">Call ID</th>
                          <th className="py-2 pr-4">Coords</th>
                          <th className="py-2 pr-4">IP</th>
                          <th className="py-2 pr-4">User</th>
                          <th className="py-2">Agent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.rows.map((row) => (
                          <tr key={row.id} className="border-t">
                            <td className="py-2 pr-4 whitespace-nowrap">{new Date(row.created_at).toLocaleString()}</td>
                            <td className="py-2 pr-4">{row.to_number}</td>
                            <td className="py-2 pr-4">{row.source || "-"}</td>
                            <td className="py-2 pr-4">{row.call_id || "-"}</td>
                            <td className="py-2 pr-4">{row.coords ? `${row.coords.lat ?? row.coords.latitude ?? "?"}, ${row.coords.lon ?? row.coords.longitude ?? "?"}` : "-"}</td>
                            <td className="py-2 pr-4">{row.ip || "-"}</td>
                            <td className="py-2 pr-4">{row.user_id ? row.user_id.slice(0, 8) + "…" : "-"}</td>
                            <td className="py-2">{row.user_agent ? row.user_agent.slice(0, 48) + (row.user_agent.length > 48 ? "…" : "") : "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No results.</p>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Page {page} of {totalPages}</div>
                  <div className="flex gap-2">
                    <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
                    <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminEmergency;
