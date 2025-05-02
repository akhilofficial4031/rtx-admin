"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  FileText,
  Briefcase,
  Calendar,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
} from "lucide-react";

// Types for our dashboard data
type DashboardData = {
  counts: {
    users: number;
    projects: number;
    meetings: number;
    tasks: number;
  };
  recentMeetings: {
    id: string;
    title: string;
    meetingDate: string;
    createdAt: string;
  }[];
  tasksByStatus: {
    status: string;
    count: number;
  }[];
  upcomingMeetings: {
    id: string;
    title: string;
    meetingDate: string;
  }[];
};

// Animation variants for cards
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Primary metric card component
const MetricCard = ({
  title,
  value,
  icon,
  change,
  color,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  change?: { value: number; positive: boolean };
  color: string;
}) => (
  <motion.div
    className={`bg-white rounded-xl shadow-sm p-6 border border-gray-50 flex flex-col`}
    variants={cardVariants}
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      {change && (
        <div
          className={`flex items-center text-sm font-medium ${
            change.positive ? "text-green-600" : "text-red-600"
          }`}
        >
          {change.positive ? (
            <ArrowUpRight size={14} className="mr-1" />
          ) : (
            <ArrowDownRight size={14} className="mr-1" />
          )}
          {Math.abs(change.value)}%
        </div>
      )}
    </div>
    <div className="text-3xl font-bold mb-1">{value}</div>
    <div className="text-gray-500 text-sm">{title}</div>
  </motion.div>
);

// Progress card for task status
const TaskStatusCard = ({
  statusData,
}: {
  statusData: { status: string; count: number }[];
}) => {
  const totalTasks = statusData.reduce((sum, item) => sum + item.count, 0);

  // Map the database status values to user-friendly labels and colors
  const statusMap: Record<
    string,
    { label: string; color: string; bgColor: string }
  > = {
    not_started: {
      label: "Not Started",
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    },
    in_progress: {
      label: "In Progress",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    completed: {
      label: "Completed",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    cancelled: {
      label: "Cancelled",
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    delayed: {
      label: "Delayed",
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm p-6 border border-gray-50 col-span-full lg:col-span-2"
      variants={cardVariants}
    >
      <div className="flex items-center mb-6">
        <FileText className="mr-2 text-gray-700" size={20} />
        <h2 className="text-lg font-semibold">Task Status Overview</h2>
      </div>

      <div className="space-y-4">
        {statusData.map((item) => {
          const percentage = totalTasks
            ? Math.round((item.count / totalTasks) * 100)
            : 0;
          const status = statusMap[item.status] || {
            label:
              item.status.charAt(0).toUpperCase() +
              item.status.slice(1).replace("_", " "),
            color: "text-gray-600",
            bgColor: "bg-gray-100",
          };

          return (
            <div key={item.status}>
              <div className="flex justify-between text-sm mb-1">
                <span className={status.color}>{status.label}</span>
                <span className="font-medium">
                  {percentage}% ({item.count})
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${status.bgColor}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

// Upcoming meetings component
const UpcomingMeetingsCard = ({
  meetings,
}: {
  meetings: {
    id: string;
    title: string;
    meetingDate: string;
  }[];
}) => (
  <motion.div
    className="bg-white rounded-xl shadow-sm p-6 border border-gray-50"
    variants={cardVariants}
  >
    <div className="flex items-center mb-6">
      <Calendar className="mr-2 text-gray-700" size={20} />
      <h2 className="text-lg font-semibold">Upcoming Meetings</h2>
    </div>

    {meetings.length > 0 ? (
      <div className="space-y-4">
        {meetings.map((meeting) => {
          const date = new Date(meeting.meetingDate);

          return (
            <div
              key={meeting.id}
              className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="bg-blue-50 text-blue-600 rounded-lg p-3 text-center flex-shrink-0 w-14">
                <div className="text-xs font-medium">
                  {date.toLocaleDateString("en-US", { month: "short" })}
                </div>
                <div className="text-xl font-bold">{date.getDate()}</div>
              </div>
              <div className="flex-1 truncate">
                <div className="font-medium truncate">{meeting.title}</div>
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <div className="text-center py-8 text-gray-500">
        No upcoming meetings scheduled
      </div>
    )}
  </motion.div>
);

// Recent activity component
const RecentActivityCard = ({
  meetings,
}: {
  meetings: {
    id: string;
    title: string;
    meetingDate: string;
    createdAt: string;
  }[];
}) => (
  <motion.div
    className="bg-white rounded-xl shadow-sm p-6 border border-gray-50"
    variants={cardVariants}
  >
    <div className="flex items-center mb-6">
      <Clock className="mr-2 text-gray-700" size={20} />
      <h2 className="text-lg font-semibold">Recent Activity</h2>
    </div>

    {meetings.length > 0 ? (
      <div className="space-y-3">
        {meetings.map((meeting) => {
          const createdAt = new Date(meeting.createdAt);
          const timeAgo = getTimeAgo(createdAt);

          return (
            <div
              key={meeting.id}
              className="flex p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="mr-4 mt-1">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <div className="h-full w-0.5 bg-gray-200 mx-auto mt-1"></div>
              </div>
              <div>
                <div className="font-medium">{meeting.title}</div>
                <div className="text-sm text-gray-500">{timeAgo}</div>
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <div className="text-center py-8 text-gray-500">No recent activity</div>
    )}
  </motion.div>
);

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";

  return Math.floor(seconds) + " seconds ago";
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/dashboard");

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const dashboardData = await response.json();
        setData(dashboardData);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="bg-red-50 p-4 rounded-lg text-red-600 max-w-md text-center">
          <AlertCircle className="mx-auto mb-4" size={32} />
          <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Default placeholder data in case API hasn't returned yet
  const dashboardData = data || {
    counts: { users: 0, projects: 0, meetings: 0, tasks: 0 },
    recentMeetings: [],
    tasksByStatus: [],
    upcomingMeetings: [],
  };

  return (
    <div className="p-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        <motion.h1 className="text-2xl font-bold mb-6" variants={cardVariants}>
          Dashboard Overview
        </motion.h1>

        {/* Main metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <MetricCard
            title="Team Members"
            value={dashboardData.counts.users}
            icon={<User size={22} className="text-white" />}
            change={{ value: 12, positive: true }}
            color="bg-blue-600 text-white"
          />
          <MetricCard
            title="Active Projects"
            value={dashboardData.counts.projects}
            icon={<Briefcase size={22} className="text-white" />}
            change={{ value: 8, positive: true }}
            color="bg-green-600 text-white"
          />
          <MetricCard
            title="Scheduled Meetings"
            value={dashboardData.counts.meetings}
            icon={<Calendar size={22} className="text-white" />}
            change={{ value: 5, positive: true }}
            color="bg-amber-600 text-white"
          />
          <MetricCard
            title="Total Tasks"
            value={dashboardData.counts.tasks}
            icon={<FileText size={22} className="text-white" />}
            change={{ value: 3, positive: false }}
            color="bg-purple-600 text-white"
          />
        </div>

        {/* Task status section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <TaskStatusCard statusData={dashboardData.tasksByStatus} />
          <RecentActivityCard meetings={dashboardData.recentMeetings} />
        </div>

        {/* Upcoming meetings section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <UpcomingMeetingsCard meetings={dashboardData.upcomingMeetings} />

          {/* Productivity metrics */}
          <motion.div
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-50 lg:col-span-2"
            variants={cardVariants}
          >
            <div className="flex items-center mb-6">
              <TrendingUp className="mr-2 text-gray-700" size={20} />
              <h2 className="text-lg font-semibold">Productivity Metrics</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {Math.floor(
                    dashboardData.counts.tasks /
                      Math.max(dashboardData.counts.users, 1)
                  )}
                </div>
                <div className="text-gray-500 text-sm">Tasks per member</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-amber-600 mb-1">
                  {Math.floor(
                    dashboardData.counts.meetings /
                      Math.max(dashboardData.counts.projects, 1)
                  )}
                </div>
                <div className="text-gray-500 text-sm">
                  Meetings per project
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {Math.floor(
                    ((dashboardData.tasksByStatus.find(
                      (t) => t.status === "completed"
                    )?.count || 0) /
                      Math.max(dashboardData.counts.tasks, 1)) *
                      100
                  )}
                  %
                </div>
                <div className="text-gray-500 text-sm">
                  Task completion rate
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
