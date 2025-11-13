"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart3,
  Calendar,
  CalendarDays,
  MessageSquare,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";

export default function UserDashboardPage() {
  const { data: stats, isLoading } = api.userDashboard.getStats.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const usageStatus =
    stats && stats.usagePercentage >= 90
      ? "danger"
      : stats && stats.usagePercentage >= 70
        ? "warning"
        : "success";

  const statusColors = {
    danger: "text-red-600 bg-red-50 border-red-200",
    warning: "text-orange-600 bg-orange-50 border-orange-200",
    success: "text-green-600 bg-green-50 border-green-200",
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BarChart3 className="h-8 w-8" />
          Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Overzicht van je chat statistieken
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Totaal Sessies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-gray-900">
              {stats?.totalSessions || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats?.totalMessages || 0} berichten
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Deze Maand
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-gray-900">
              {stats?.sessionsThisMonth || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              van {stats?.monthlyLimit || 100} limiet
            </p>
          </CardContent>
        </Card>

        <Card
          className={`border-l-4 ${usageStatus === "danger" ? "border-l-red-500" : usageStatus === "warning" ? "border-l-orange-500" : "border-l-green-500"}`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Gebruik
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-gray-900">
              {stats?.usagePercentage.toFixed(0) || 0}%
            </p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${usageStatus === "danger" ? "bg-red-500" : usageStatus === "warning" ? "bg-orange-500" : "bg-green-500"}`}
                style={{
                  width: `${Math.min(stats?.usagePercentage || 0, 100)}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time-based Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Activiteit per Periode
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
                {stats?.sessionsLast7Days || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.sessionsLast7Days
                  ? `${((stats.sessionsLast7Days / (stats.totalSessions || 1)) * 100).toFixed(1)}% van totaal`
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
                {stats?.sessionsLast30Days || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.sessionsLast30Days
                  ? `${((stats.sessionsLast30Days / (stats.totalSessions || 1)) * 100).toFixed(1)}% van totaal`
                  : "Geen sessies"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Totaal Tokens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">
                {stats?.totalTokens?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                AI verwerkte tokens
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Activiteit Laatste 30 Dagen
          </CardTitle>
          <p className="text-sm text-gray-500">
            Aantal chat sessies per dag
          </p>
        </CardHeader>
        <CardContent>
          {stats && stats.sessionsByDay.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.sessionsByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.5rem",
                    }}
                    formatter={(value: number) => [value, "Sessies"]}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Nog geen chat sessies beschikbaar</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      {stats && stats.recentSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recente Sessies
            </CardTitle>
            <p className="text-sm text-gray-500">
              Je laatste 10 chat sessies
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.recentSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/?session=${session.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {session.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {session.messageCount} berichten
                    </p>
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatDistanceToNow(new Date(session.created_at), {
                      addSuffix: true,
                      locale: nl,
                    })}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Limit Warning */}
      {stats && stats.usagePercentage >= 70 && (
        <Card className={`border-2 ${statusColors[usageStatus]}`}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Zap
                className={`h-6 w-6 ${usageStatus === "danger" ? "text-red-600" : "text-orange-600"}`}
              />
              <div>
                <h3 className="font-semibold text-gray-900">
                  {usageStatus === "danger"
                    ? "Maandlimiet bijna bereikt!"
                    : "Let op: Hoog gebruik"}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Je hebt {stats.sessionsThisMonth} van de {stats.monthlyLimit}{" "}
                  sessies gebruikt deze maand (
                  {stats.usagePercentage.toFixed(0)}%).
                  {usageStatus === "danger" &&
                    " Neem contact op met je beheerder voor meer capaciteit."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
