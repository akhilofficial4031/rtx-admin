"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Users,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Types
interface Meeting {
  id: string;
  title: string;
  coordinatorId: string;
  coordinatorName: string;
  meetingDate: string;
  minutes?: string;
  createdAt: string;
}

interface Attendee {
  id: string;
  userId: string;
  userName: string;
  attended: boolean;
}

interface Task {
  id: string;
  name: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  dueDate: string;
  status: string;
  createdAt: string;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

// Task component
const TaskItem = ({ task }: { task: Task }) => {
  // Status indicators
  const statusColors: Record<
    string,
    { bg: string; text: string; icon: React.ReactNode; border: string }
  > = {
    not_started: {
      bg: "bg-slate-50",
      text: "text-slate-700",
      border: "border-slate-200",
      icon: <AlertCircle size={16} className="text-slate-500" />,
    },
    in_progress: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: <Clock size={16} className="text-blue-500" />,
    },
    completed: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
      icon: <CheckCircle2 size={16} className="text-green-500" />,
    },
  };

  const statusStyle = statusColors[task.status] || statusColors.not_started;

  return (
    <motion.div
      variants={itemVariants}
      className={`border rounded-lg p-5 hover:shadow-md transition-all duration-300 ${statusStyle.border} ${statusStyle.bg} group`}
    >
      <div className="flex justify-between mb-3">
        <h3 className="font-medium text-lg text-slate-800">{task.name}</h3>
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 border ${statusStyle.border} ${statusStyle.text}`}
        >
          {statusStyle.icon}
          <span className="capitalize">{task.status.replace(/_/g, " ")}</span>
        </div>
      </div>

      {task.description && (
        <p className="text-slate-600 text-sm mb-4 line-clamp-3">
          {task.description}
        </p>
      )}

      <div className="flex justify-between items-center text-sm text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="bg-red-100 text-red-600 p-1.5 rounded-md">
            <User size={14} />
          </div>
          <span>{task.assigneeName || "Unassigned"}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="bg-red-100 text-red-600 p-1.5 rounded-md">
            <CalendarDays size={14} />
          </div>
          <span>{formatDate(task.dueDate) || "No due date"}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default function MeetingDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMeetingDetails() {
      setLoading(true);
      try {
        const response = await fetch(`/api/meetings/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch meeting details");
        }
        const data = await response.json();
        setMeeting(data.meeting);
        setAttendees(data.attendees);
        setTasks(data.tasks);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchMeetingDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-10rem)] bg-white rounded-lg border border-slate-200 shadow-sm max-w-5xl mx-auto">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E53E3E] mb-4"></div>
          <p className="text-slate-600">Loading meeting details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6 shadow-sm">
          {error}
        </div>
        <Button
          variant="outline"
          className="bg-white border-slate-200 hover:bg-slate-100 text-slate-800"
          asChild
        >
          <Link href="/meetings">
            <ArrowLeft size={16} className="mr-2" />
            Back to Meetings
          </Link>
        </Button>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-4 rounded-lg mb-6 shadow-sm">
          Meeting not found
        </div>
        <Button
          variant="outline"
          className="bg-white border-slate-200 hover:bg-slate-100 text-slate-800"
          asChild
        >
          <Link href="/meetings">
            <ArrowLeft size={16} className="mr-2" />
            Back to Meetings
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-5xl mx-auto p-4 sm:p-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Back button and actions row */}
      <motion.div
        variants={itemVariants}
        className="mb-6 flex justify-between items-center"
      >
        <Button
          variant="outline"
          className="bg-white border-slate-200 hover:bg-slate-100 text-slate-800"
          asChild
        >
          <Link href="/meetings">
            <ArrowLeft size={16} className="mr-2" />
            Back to Meetings
          </Link>
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="bg-white border-slate-200 hover:bg-slate-100 text-slate-800"
          >
            Edit Meeting
          </Button>
          <Button className="bg-[#E53E3E] hover:bg-[#C53030] text-white shadow-sm">
            <Plus size={16} className="mr-2" />
            Add Task
          </Button>
        </div>
      </motion.div>

      {/* Meeting header */}
      <motion.div variants={itemVariants}>
        <Card className="mb-8 border-slate-200 bg-white overflow-hidden shadow-md">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#E53E3E] to-[#FC8181]"></div>
          <CardHeader className="pt-8">
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <CalendarDays size={14} className="mr-2" />
                <span>{formatDate(meeting.meetingDate)}</span>
              </span>
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-slate-800">
              {meeting.title}
            </CardTitle>
            <CardDescription className="flex items-center mt-2 text-slate-600">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <User size={14} className="mr-1.5" />
                <span>Coordinator: {meeting.coordinatorName}</span>
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <div className="space-y-6">
              {/* Minutes section */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                  <h3 className="text-md font-semibold flex items-center text-slate-800">
                    <ClipboardList size={18} className="mr-2 text-red-500" />
                    Minutes
                  </h3>
                </div>
                <div className="p-4 text-slate-700">
                  {meeting.minutes ? (
                    <div className="prose prose-slate max-w-none">
                      {meeting.minutes.split("\n").map((line, i) => (
                        <p key={i} className="mb-2 last:mb-0">
                          {line}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 italic p-2">
                      No minutes recorded for this meeting
                    </p>
                  )}
                </div>
              </div>

              {/* Attendees section */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                  <h3 className="text-md font-semibold flex items-center text-slate-800">
                    <Users size={18} className="mr-2 text-red-500" />
                    Attendees ({attendees.length})
                  </h3>
                </div>
                <div className="p-4">
                  {attendees.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {attendees.map((attendee) => (
                        <div
                          key={attendee.id}
                          className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 ${
                            attendee.attended
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          <User size={14} />
                          {attendee.userName}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 italic p-2">
                      No attendees recorded
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tasks section */}
      <motion.div variants={itemVariants}>
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-md mb-8">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold flex items-center text-slate-800">
              <ClipboardList size={18} className="mr-2 text-red-500" />
              Tasks ({tasks.length})
            </h2>
          </div>

          <div className="p-4">
            {tasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <ClipboardList
                  size={48}
                  className="mx-auto mb-4 text-slate-300"
                />
                <h3 className="text-lg font-medium mb-2 text-slate-700">
                  No tasks yet
                </h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  There are no tasks associated with this meeting. Create your
                  first task to get started.
                </p>
                <Button className="bg-[#E53E3E] hover:bg-[#C53030] text-white shadow-sm">
                  <Plus size={16} className="mr-2" />
                  Create First Task
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
