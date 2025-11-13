"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Role } from "@generated/prisma";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import {
  BarChart3,
  Building,
  Calendar,
  CalendarDays,
  MessageSquare,
  TrendingUp,
  Users,
} from "lucide-react";

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
];

export default function DashboardPage() {
  const { data: stats, isLoading } = api.dashboard.getStats.useQuery();
  const { data: currentUser } = api.user.me.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (currentUser?.role !== Role.ADMIN) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-red-500">
          You are not authorized to view this page.
        </div>
      </div>
    );
  }

  // Filter out tenants with zero sessions for cleaner chart
  const chartData = stats?.usageByTenant.filter((item) => item.value > 0) || [];
  const hasData = chartData.length > 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BarChart3 className="h-8 w-8" />
          Admin Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Overzicht van je platform statistieken
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Building className="h-4 w-4" />
              Totaal Klanten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-gray-900">
              {stats?.tenantCount || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Totaal Gebruikers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-gray-900">
              {stats?.userCount || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Totaal Sessies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-gray-900">
              {stats?.chatSessionCount || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Time-based Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Chat Sessies per Periode
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Laatste 7 Dagen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                {stats?.chatSessionsLast7Days || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.chatSessionsLast7Days
                  ? `${(
                      (stats.chatSessionsLast7Days /
                        (stats.chatSessionCount || 1)) *
                      100
                    ).toFixed(1)}% van totaal`
                  : "Geen sessies"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Laatste 30 Dagen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {stats?.chatSessionsLast30Days || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.chatSessionsLast30Days
                  ? `${(
                      (stats.chatSessionsLast30Days /
                        (stats.chatSessionCount || 1)) *
                      100
                    ).toFixed(1)}% van totaal`
                  : "Geen sessies"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Alle Tijd
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">
                {stats?.chatSessionCount || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Totaal aantal sessies
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Usage by Tenant Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Gebruik per Klant
          </CardTitle>
          <p className="text-sm text-gray-500">
            Verdeling van chat sessies over klanten
          </p>
        </CardHeader>
        <CardContent>
          {hasData ? (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [value, "Sessies"]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value, entry: any) => (
                      <span className="text-sm">
                        {value} ({entry.payload?.value} sessies)
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-gray-500">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Nog geen chat sessies beschikbaar</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Table */}
      {hasData && (
        <Card>
          <CardHeader>
            <CardTitle>Gedetailleerd Overzicht</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">
                      Klant
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">
                      Aantal Sessies
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {chartData
                    .sort((a, b) => b.value - a.value)
                    .map((item, index) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            />
                            {item.name}
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 font-medium">
                          {item.value}
                        </td>
                        <td className="text-right py-3 px-4 text-gray-600">
                          {(
                            (item.value / (stats?.chatSessionCount || 1)) *
                            100
                          ).toFixed(1)}
                          %
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
