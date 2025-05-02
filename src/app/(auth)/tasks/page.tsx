"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  Clock,
  Loader2,
  ArrowUpDown,
  MoreHorizontal,
  Check,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

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

// Status change menu component
const StatusChangeMenu = ({
  task,
  onStatusChange,
  loadingTaskId,
}: {
  task: Task;
  onStatusChange: (taskId: string, newStatus: string) => void;
  loadingTaskId: string | null;
}) => {
  const isLoading = loadingTaskId === task.id;

  const getMenuItems = () => {
    if (isLoading) {
      return (
        <DropdownMenuItem disabled className="flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Updating...
        </DropdownMenuItem>
      );
    }

    switch (task.status) {
      case "not_started":
        return (
          <>
            <DropdownMenuItem
              onClick={() => onStatusChange(task.id, "in_progress")}
            >
              <div className="flex items-center">
                <span className="bg-blue-100 p-1 rounded mr-2">
                  <Clock size={16} className="text-blue-600" />
                </span>
                Mark as In Progress
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onStatusChange(task.id, "completed")}
            >
              <div className="flex items-center">
                <span className="bg-green-100 p-1 rounded mr-2">
                  <Check size={16} className="text-green-600" />
                </span>
                Mark as Completed
              </div>
            </DropdownMenuItem>
          </>
        );
      case "in_progress":
        return (
          <DropdownMenuItem
            onClick={() => onStatusChange(task.id, "completed")}
          >
            <div className="flex items-center">
              <span className="bg-green-100 p-1 rounded mr-2">
                <Check size={16} className="text-green-600" />
              </span>
              Mark as Completed
            </div>
          </DropdownMenuItem>
        );
      case "completed":
      default:
        return (
          <DropdownMenuItem disabled className="text-slate-400">
            No actions available
          </DropdownMenuItem>
        );
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={isLoading}
        >
          <span className="sr-only">Open menu</span>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">{getMenuItems()}</DropdownMenuContent>
    </DropdownMenu>
  );
};

// Tasks empty state component
const TasksEmptyState = () => (
  <tr>
    <td
      colSpan={5}
      className="px-6 py-16 text-center text-slate-500 bg-slate-50/50"
    >
      <div className="flex flex-col items-center">
        <div className="bg-white p-4 rounded-full shadow-md mb-4">
          <Clock className="h-12 w-12 text-slate-400" />
        </div>
        <p className="text-lg font-medium mb-1 text-slate-700">No tasks due</p>
        <p className="text-sm text-slate-500 mb-4">
          There are no tasks due within this timeframe.
        </p>
      </div>
    </td>
  </tr>
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
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);
  const { toast } = useToast();

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

  // Helper to get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "not_started":
        return "Not Started";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  // Change task status handler
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    setLoadingTaskId(taskId);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Get the task name
      let taskName = "";
      Object.keys(tasks).forEach((key) => {
        const tabKey = key as keyof typeof tasks;
        const task = tasks[tabKey].find((t) => t.id === taskId);
        if (task) {
          taskName = task.name;
        }
      });

      // Update local state to reflect the status change
      const updatedTasks = { ...tasks };

      // Update task in all tabs
      Object.keys(updatedTasks).forEach((key) => {
        const tabKey = key as keyof typeof tasks;
        const tabTasks = updatedTasks[tabKey];

        const updatedTabTasks = tabTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        );

        updatedTasks[tabKey] = updatedTabTasks;
      });

      setTasks(updatedTasks);

      // Show success toast
      toast({
        variant: "success",
        title: "Task status updated",
        description: `"${taskName}" is now ${getStatusLabel(newStatus)}`,
      });
    } catch (err) {
      console.error("Failed to update task status:", err);
      toast({
        variant: "destructive",
        title: "Failed to update status",
        description: "There was an error updating the task status.",
      });
    } finally {
      setLoadingTaskId(null);
    }
  };

  // Get tab count
  const getTabCount = (key: keyof typeof tasks) => {
    return tasks[key]?.length || 0;
  };

  // Render a table row with status change menu
  const renderTaskRow = (task: Task) => (
    <tr
      key={task.id}
      className="hover:bg-slate-50 transition-colors duration-200"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-slate-800">{task.name}</div>
        {task.description && (
          <div className="text-xs text-slate-500 mt-1">
            {task.description.length > 50
              ? `${task.description.substring(0, 50)}...`
              : task.description}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-slate-600">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200 shadow-sm">
            <CalendarDays size={12} className="mr-1" />
            {task.dueDate ? formatDate(task.dueDate) : "No due date"}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={task.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-slate-600">
          {task.assigneeName || "Unassigned"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <StatusChangeMenu
          task={task}
          onStatusChange={handleStatusChange}
          loadingTaskId={loadingTaskId}
        />
      </td>
    </tr>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
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
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  <table className="w-full divide-y divide-slate-200">
                    <thead className="bg-gradient-to-r from-slate-50 to-white">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                        >
                          <div className="flex items-center">
                            Task Name
                            <ArrowUpDown
                              size={14}
                              className="ml-1 text-slate-500"
                            />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                        >
                          <div className="flex items-center">
                            Due Date
                            <ArrowUpDown
                              size={14}
                              className="ml-1 text-slate-500"
                            />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                        >
                          <div className="flex items-center">
                            Status
                            <ArrowUpDown
                              size={14}
                              className="ml-1 text-slate-500"
                            />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                        >
                          <div className="flex items-center">
                            Assignee
                            <ArrowUpDown
                              size={14}
                              className="ml-1 text-slate-500"
                            />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {tasks.today && tasks.today.length > 0 ? (
                        tasks.today.map(renderTaskRow)
                      ) : (
                        <TasksEmptyState />
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="day1">
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  <table className="w-full divide-y divide-slate-200">
                    <thead className="bg-gradient-to-r from-slate-50 to-white">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                        >
                          <div className="flex items-center">
                            Task Name
                            <ArrowUpDown
                              size={14}
                              className="ml-1 text-slate-500"
                            />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                        >
                          <div className="flex items-center">
                            Due Date
                            <ArrowUpDown
                              size={14}
                              className="ml-1 text-slate-500"
                            />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                        >
                          <div className="flex items-center">
                            Status
                            <ArrowUpDown
                              size={14}
                              className="ml-1 text-slate-500"
                            />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                        >
                          <div className="flex items-center">
                            Assignee
                            <ArrowUpDown
                              size={14}
                              className="ml-1 text-slate-500"
                            />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {tasks.day1 && tasks.day1.length > 0 ? (
                        tasks.day1.map(renderTaskRow)
                      ) : (
                        <TasksEmptyState />
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="day2">
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  <table className="w-full divide-y divide-slate-200">
                    <thead className="bg-gradient-to-r from-slate-50 to-white">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                        >
                          <div className="flex items-center">
                            Task Name
                            <ArrowUpDown
                              size={14}
                              className="ml-1 text-slate-500"
                            />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                        >
                          <div className="flex items-center">
                            Due Date
                            <ArrowUpDown
                              size={14}
                              className="ml-1 text-slate-500"
                            />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                        >
                          <div className="flex items-center">
                            Status
                            <ArrowUpDown
                              size={14}
                              className="ml-1 text-slate-500"
                            />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                        >
                          <div className="flex items-center">
                            Assignee
                            <ArrowUpDown
                              size={14}
                              className="ml-1 text-slate-500"
                            />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {tasks.day2 && tasks.day2.length > 0 ? (
                        tasks.day2.map(renderTaskRow)
                      ) : (
                        <TasksEmptyState />
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="day3">
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  <table className="w-full divide-y divide-slate-200">
                    <thead className="bg-gradient-to-r from-slate-50 to-white">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                        >
                          <div className="flex items-center">
                            Task Name
                            <ArrowUpDown
                              size={14}
                              className="ml-1 text-slate-500"
                            />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                        >
                          <div className="flex items-center">
                            Due Date
                            <ArrowUpDown
                              size={14}
                              className="ml-1 text-slate-500"
                            />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                        >
                          <div className="flex items-center">
                            Status
                            <ArrowUpDown
                              size={14}
                              className="ml-1 text-slate-500"
                            />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                        >
                          <div className="flex items-center">
                            Assignee
                            <ArrowUpDown
                              size={14}
                              className="ml-1 text-slate-500"
                            />
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {tasks.day3 && tasks.day3.length > 0 ? (
                        tasks.day3.map(renderTaskRow)
                      ) : (
                        <TasksEmptyState />
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
