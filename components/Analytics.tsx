"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  LineChart,
  PieChart,
  Clock,
  MessageSquare,
  CheckCircle2,
  Zap,
  Users,
  Calendar,
  DollarSign,
  GitBranch,
  Timer,
  FileText,
  Target,
  Cpu,
  Briefcase,
  Award,
  TrendingUp
} from "lucide-react";

export default function Analytics() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Placeholder data structure (replace with actual data fetching later)
  const userAnalyticsData = {
    useTimeThisWeek: {
      title: "Your Usage This Week",
      icon: <Clock className="h-5 w-5 text-indigo-500" />,
      value: "18.2",
      unit: "hours"
    },
    messagesThisWeek: {
      title: "Your Messages This Week",
      icon: <MessageSquare className="h-5 w-5 text-purple-500" />,
      value: "324",
      unit: "messages"
    },
    averageUseTime: {
      title: "Your Average Usage Per Day",
      icon: <Calendar className="h-5 w-5 text-sky-500" />,
      value: "3.4",
      unit: "hours/day"
    },
    totalMessages: {
      title: "Your Total Messages Ever",
      icon: <MessageSquare className="h-5 w-5 text-violet-500" />,
      value: "2,845",
      unit: "messages"
    },
    totalTasks: {
      title: "Your Total Tasks Completed",
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      value: "187",
      unit: "tasks"
    },
    timeSavedForYou: {
      title: "Time Saved For You",
      icon: <Timer className="h-5 w-5 text-rose-500" />,
      value: "24.5",
      unit: "hours"
    },
    moneySavedForYou: {
      title: "Money Saved For You",
      icon: <DollarSign className="h-5 w-5 text-emerald-500" />,
      value: "$1,230",
      unit: ""
    },
    workflowsUsed: {
      title: "Your Workflows Used",
      icon: <GitBranch className="h-5 w-5 text-teal-500" />,
      value: "15",
      unit: "workflows"
    },
    documentsProcessed: {
      title: "Your Documents Processed",
      icon: <FileText className="h-5 w-5 text-pink-500" />,
      value: "58",
      unit: "documents"
    },
  };

  const teamAnalyticsData = {
    teamUsageThisWeek: {
      title: "Team Usage This Week",
      icon: <Users className="h-5 w-5 text-blue-500" />,
      value: "42.5",
      unit: "hours"
    },
    teamMessagesThisWeek: {
      title: "Team Messages This Week",
      icon: <MessageSquare className="h-5 w-5 text-purple-500" />,
      value: "1,580",
      unit: "messages"
    },
    teamAverageUsagePerDay: {
      title: "Team Average Usage Per Day",
      icon: <Calendar className="h-5 w-5 text-sky-500" />,
      value: "2.1",
      unit: "hours/day/user"
    },
    teamTotalMessagesEver: {
      title: "Team Total Messages Ever",
      icon: <MessageSquare className="h-5 w-5 text-violet-500" />,
      value: "15,670",
      unit: "messages"
    },
    teamTotalTasksCompleted: {
      title: "Team Total Tasks Completed",
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      value: "950",
      unit: "tasks"
    },
    timeSavedForTeam: {
      title: "Time Saved For Team",
      icon: <Briefcase className="h-5 w-5 text-orange-500" />,
      value: "87.2",
      unit: "hours"
    },
    moneySavedForTeam: {
      title: "Money Saved For Team",
      icon: <TrendingUp className="h-5 w-5 text-lime-500" />,
      value: "$4,350",
      unit: ""
    },
    teamWorkflowsUsed: {
      title: "Team Workflows Used",
      icon: <GitBranch className="h-5 w-5 text-teal-500" />,
      value: "142",
      unit: "workflows"
    },
    teamDocumentsProcessed: {
      title: "Team Documents Processed",
      icon: <FileText className="h-5 w-5 text-pink-500" />,
      value: "432",
      unit: "documents"
    },
  };

  if (isInitialLoading) {
    return (
      <div className={cn(
        "h-full w-full p-6",
        isDark ? "bg-gray-900" : "bg-gray-50"
      )}>
        <div className="max-w-2xl mx-auto">
          <h1 className={cn(
            "text-2xl font-semibold mb-6",
            isDark ? "text-white" : "text-gray-900"
          )}>Analytics Overview</h1>
          <div className="flex justify-start animate-in fade-in-0">
            <div className={cn(
              "rounded-2xl px-4 py-3 shadow-sm ring-1 ring-inset",
              isDark ? "bg-gray-800 text-purple-300 ring-purple-700" : "bg-white text-purple-900 ring-purple-200"
            )}>
              <div className="flex items-center gap-1.5">
                <p>Loading your analytics</p>
                {[0.3, 0.15, 0].map((delay, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full animate-bounce",
                      isDark ? "bg-purple-500" : "bg-purple-400"
                    )}
                    style={{ animationDelay: `-${delay}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "w-full p-6",
      isDark ? "bg-gray-900" : "bg-gray-50"
    )}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <h2 className={cn(
            "text-2xl font-semibold",
            isDark ? "text-white" : "text-gray-900"
          )}>Analytics Overview</h2>
          <Badge className={cn(
            "text-xs py-1",
            isDark ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/20" : "bg-amber-100 text-amber-800 hover:bg-amber-100"
          )}>
            Still in development
          </Badge>
        </div>
        
        <p className={cn(
          "mb-8",
          isDark ? "text-gray-300" : "text-gray-600"
        )}>
          View usage statistics and performance metrics for your organization.
          <span className={cn(
            "ml-2 font-medium",
            isDark ? "text-purple-400" : "text-purple-600"
          )}>
            Total team usage: {teamAnalyticsData.teamUsageThisWeek.value}
          </span>
        </p>

        <div className={cn(
          "p-4 rounded-md mb-8 border",
          isDark ? "bg-purple-900/20 border-purple-700" : "bg-purple-50 border-purple-200"
        )}>
          <h4 className={cn(
            "font-medium mb-1",
            isDark ? "text-purple-400" : "text-purple-700"
          )}>Analytics Overview</h4>
          <p className={cn(
            "text-sm",
            isDark ? "text-purple-300" : "text-purple-600"
          )}>
            These analytics provide insights into your team's usage patterns and the value generated.
            Track time saved, messages sent, and other key metrics to optimize your workflow.
          </p>
        </div>

        {/* User Analytics Section */}
        <h3 className={cn(
          "text-xl font-semibold mb-4 mt-12",
          isDark ? "text-white" : "text-gray-800"
        )}>User Analytics</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {Object.entries(userAnalyticsData).map(([key, chart]) => (
            <Card key={key} className={cn(
              "hover:shadow-lg transition-shadow duration-300 border",
              isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
            )}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={cn(
                  "text-sm font-medium",
                  isDark ? "text-gray-300" : "text-gray-700"
                )}>
                  {chart.title}
                </CardTitle>
                {chart.icon}
              </CardHeader>
              <CardContent>
                <div className="pt-2">
                  <div className={cn(
                    "text-3xl font-bold",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    {chart.value}
                  </div>
                  {chart.unit && (
                    <p className={cn(
                      "text-xs mt-1",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>
                      {chart.unit}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Team Analytics Section */}
        <h3 className={cn(
          "text-xl font-semibold mb-4 mt-12",
          isDark ? "text-white" : "text-gray-800"
        )}>Team Analytics</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {Object.entries(teamAnalyticsData).map(([key, chart]) => (
            <Card key={key} className={cn(
              "hover:shadow-lg transition-shadow duration-300 border",
              isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
            )}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={cn(
                  "text-sm font-medium",
                  isDark ? "text-gray-300" : "text-gray-700"
                )}>
                  {chart.title}
                </CardTitle>
                {chart.icon}
              </CardHeader>
              <CardContent>
                <div className="pt-2">
                  <div className={cn(
                    "text-3xl font-bold",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    {chart.value}
                  </div>
                  {chart.unit && (
                    <p className={cn(
                      "text-xs mt-1",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>
                      {chart.unit}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}