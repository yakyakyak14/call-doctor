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

  // Stats and charts data: last 30 days (or filter range if set)
  const { data: statsRows, isLoading: statsLoading } = useQuery({
    queryKey: ["adminEmergencyStats", fromDate, toDate, authorized],
    enabled: authorized,
    queryFn: async () => {
      const now = new Date();
      const since = fromDate ? new Date(fromDate) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const until = toDate ? new Date(toDate) : now;
      const { data, error } = await supabase
        .from("emergency_calls")
        .select("id,created_at,source,coords,to_number")
        .gte("created_at", since.toISOString())
        .lte("created_at", new Date(until.getTime() + 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: true })
        .limit(2000);
      if (error) throw error;
      return (data as EmergencyCall[]) || [];
    },
    staleTime: 30_000,
  });

  const stats = useMemo(() => {
    const rows = (statsRows as any as EmergencyCall[]) || [];
    const todayKey = new Date().toISOString().slice(0, 10);
    const last7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const byDay = new Map<string, number>();
    const bySource = new Map<string, number>();
    let callsToday = 0;
    let callsLast7 = 0;
    let withCoords = 0;
    const uniqueNumbers = new Set<string>();

    rows.forEach((r) => {
      const day = new Date(r.created_at).toISOString().slice(0, 10);
      byDay.set(day, (byDay.get(day) || 0) + 1);
      const src = (r as any).source || "Unknown";
      bySource.set(src, (bySource.get(src) || 0) + 1);
      if ((r as any).coords) withCoords += 1;
      if ((r as any).to_number) uniqueNumbers.add((r as any).to_number);
      if (day === todayKey) callsToday += 1;
      if (new Date(r.created_at) >= last7) callsLast7 += 1;
    });

    // Build 30-day range
    const days: { date: string; count: number }[] = [];
    const start = rows.length
      ? new Date(Math.min(...rows.map((r) => new Date(r.created_at).getTime())))
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = new Date();
    const cursor = new Date(start);
    cursor.setHours(0, 0, 0, 0);
    while (cursor <= end) {
      const key = cursor.toISOString().slice(0, 10);
      days.push({ date: key, count: byDay.get(key) || 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    const sourceList = Array.from(bySource.entries()).map(([name, value]) => ({ name, value }));
    const total = rows.length;
    return { total, callsToday, callsLast7, withCoords, uniqueNumbers: uniqueNumbers.size, days, sourceList };
  }, [statsRows]);

  const maxDay = Math.max(1, ...(stats?.days || []).map((d) => d.count));

  const Sparkline: React.FC<{ data: { date: string; count: number }[]; width?: number; height?: number }> = ({ data, width = 560, height = 80 }) => {
    if (!data || data.length === 0) return <div className="text-xs text-muted-foreground">No data</div>;
    const max = Math.max(1, ...data.map((d) => d.count));
    const stepX = width / Math.max(1, data.length - 1);
    const points = data.map((d, i) => {
      const x = i * stepX;
      const y = height - (d.count / max) * (height - 6) - 3; // padding
      return `${x},${y}`;
    });
    const path = `M ${points[0]} L ${points.slice(1).join(" ")}`;
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full">
        <path d={path} fill="none" stroke="currentColor" className="text-primary" strokeWidth={2} />
      </svg>
    );
  };

  const BarList: React.FC<{ items: { name: string; value: number }[] }> = ({ items }) => {
    if (!items || items.length === 0) return <div className="text-xs text-muted-foreground">No data</div>;
    const max = Math.max(1, ...items.map((i) => i.value));
    return (
      <div className="space-y-2">
        {items.map((i) => (
          <div key={i.name} className="grid grid-cols-6 items-center gap-2">
            <div className="col-span-2 text-sm text-foreground truncate">{i.name}</div>
            <div className="col-span-3 h-2 bg-muted rounded">
              <div className="h-2 bg-primary rounded" style={{ width: `${(i.value / max) * 100}%` }} />
            </div>
            <div className="text-right text-sm tabular-nums">{i.value}</div>
          </div>
        ))}
      </div>
    );
  };

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
            {/* Summary */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Summary {statsLoading && <span className="text-xs text-muted-foreground">(loading…)</span>}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-lg border">
                    <div className="text-xs text-muted-foreground">Total (range)</div>
                    <div className="text-2xl font-semibold">{stats?.total ?? 0}</div>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="text-xs text-muted-foreground">Today</div>
                    <div className="text-2xl font-semibold">{stats?.callsToday ?? 0}</div>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="text-xs text-muted-foreground">Last 7 days</div>
                    <div className="text-2xl font-semibold">{stats?.callsLast7 ?? 0}</div>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="text-xs text-muted-foreground">Unique numbers</div>
                    <div className="text-2xl font-semibold">{stats?.uniqueNumbers ?? 0}</div>
                  </div>
                </div>
                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium">Daily calls</div>
                      <div className="text-xs text-muted-foreground">max {maxDay}</div>
                    </div>
                    <div className="rounded-md border p-3">
                      <Sparkline data={stats?.days || []} />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">By source</div>
                    <div className="rounded-md border p-3">
                      <BarList items={(stats?.sourceList || []).sort((a,b)=>b.value-a.value)} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

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
