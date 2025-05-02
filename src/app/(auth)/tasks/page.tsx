"use client";

import React, { useState, useEffect } from "react";
import { Calendar, ClipboardCheck, Clock, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Task interface
interface Task {
  id: string;
  name: string;
  description: string | null;
  meetingId: string | null;
  dueDate: string | null;
  status: string;
  assigneeId: string | null;
  assigneeName: string | null;
  createdAt: Date;
}

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    not_started: {
      label: "Not Started",
      className: "bg-slate-100 text-slate-800 hover:bg-slate-200",
    },
    in_progress: {
      label: "In Progress",
      className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    },
    completed: {
      label: "Completed",
      className: "bg-green-100 text-green-800 hover:bg-green-200",
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] ||
    statusConfig.not_started;

  return (
    <Badge className={config.className} variant="outline">
      {config.label}
    </Badge>
  );
};

// Task card component
const TaskCard = ({ task }: { task: Task }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="h-full"
  >
    <Card className="h-full flex flex-col border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar size={14} />
            <span>
              {task.dueDate ? formatDate(task.dueDate) : "No due date"}
            </span>
          </div>
          <StatusBadge status={task.status} />
        </div>
        <CardTitle className="text-lg font-semibold">{task.name}</CardTitle>
        {task.assigneeName && (
          <CardDescription className="text-sm mt-1">
            Assigned to: {task.assigneeName}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="py-2 flex-grow">
        {task.description ? (
          <p className="text-sm text-slate-600">{task.description}</p>
        ) : (
          <p className="text-sm text-slate-400 italic">No description</p>
        )}
      </CardContent>

      {task.meetingId && (
        <CardFooter className="pt-2 pb-3 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <ClipboardCheck size={14} />
            <span>From meeting</span>
          </div>
        </CardFooter>
      )}
    </Card>
  </motion.div>
);

// Tasks empty state component
const TasksEmptyState = () => (
  <div className="p-8 text-center">
    <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
      <Clock className="h-6 w-6 text-slate-400" />
    </div>
    <h3 className="text-lg font-medium text-slate-900 mb-1">No tasks due</h3>
    <p className="text-sm text-slate-500 max-w-sm mx-auto">
      There are no tasks due within this timeframe.
    </p>
  </div>
);

// Main tasks page component
export default function TasksPage() {
  const [activeTab, setActiveTab] = useState("today");
  const [tasks, setTasks] = useState<{
    today: Task[];
    day1: Task[];
    day2: Task[];
    day3: Task[];
  }>({
    today: [],
    day1: [],
    day2: [],
    day3: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/tasks");
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        setError(err instanceof Error ? err.message : "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Get tab count
  const getTabCount = (key: keyof typeof tasks) => {
    return tasks[key]?.length || 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-8">
      {/* Header wrapper with background */}
      <div className="bg-white rounded-lg shadow-sm p-5 border border-slate-200">
        {/* Page header with title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="mt-1 text-sm text-gray-500">
              View and manage upcoming tasks
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        {/* Loading state */}
        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
            <span className="ml-2 text-slate-600">Loading tasks...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <p>Error loading tasks: {error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <Tabs
            defaultValue="today"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="px-4 pt-3">
              <TabsList className="w-full grid grid-cols-4 bg-slate-100">
                <TabsTrigger value="today">
                  Today
                  {getTabCount("today") > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                      {getTabCount("today")}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="day1">
                  1 Day
                  {getTabCount("day1") > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-orange-100 text-orange-800 rounded-full">
                      {getTabCount("day1")}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="day2">
                  2 Days
                  {getTabCount("day2") > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                      {getTabCount("day2")}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="day3">
                  3 Days
                  {getTabCount("day3") > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                      {getTabCount("day3")}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="today">
              <div className="p-4">
                {tasks.today && tasks.today.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                      {tasks.today.map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <TasksEmptyState />
                )}
              </div>
            </TabsContent>

            <TabsContent value="day1">
              <div className="p-4">
                {tasks.day1 && tasks.day1.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                      {tasks.day1.map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <TasksEmptyState />
                )}
              </div>
            </TabsContent>

            <TabsContent value="day2">
              <div className="p-4">
                {tasks.day2 && tasks.day2.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                      {tasks.day2.map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <TasksEmptyState />
                )}
              </div>
            </TabsContent>

            <TabsContent value="day3">
              <div className="p-4">
                {tasks.day3 && tasks.day3.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                      {tasks.day3.map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <TasksEmptyState />
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
