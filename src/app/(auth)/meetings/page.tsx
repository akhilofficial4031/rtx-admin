"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Columns3,
  List,
  Users,
  ChevronRight,
  Calendar,
  ArrowUpDown,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate, truncateText } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { SidePanel } from "@/components/ui/side-panel";
import NewMeetingForm from "./components/NewMeetingForm";

// Meeting type definition
interface Meeting {
  id: string;
  title: string;
  coordinatorId: string;
  coordinatorName: string;
  meetingDate: string;
  minutes?: string;
  createdAt: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Card animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  hover: { y: -5, transition: { duration: 0.2 } },
};

// MeetingCard component for the card view
const MeetingCard = ({ meeting }: { meeting: Meeting }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    exit="exit"
    variants={cardVariants}
    whileHover="hover"
    layout
    className="h-full"
  >
    <Card className="h-full flex flex-col relative overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 group bg-white">
      {/* Decorative accent */}
      {/* <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-600 to-slate-400"></div> */}

      {/* Decorative circle */}
      <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-gradient-to-br from-slate-200 to-slate-100 opacity-30 transform transition-transform duration-300 group-hover:scale-110"></div>

      <CardHeader className="pb-2 relative z-10">
        <div className="flex items-center gap-2 text-sm text-red-700 mb-2 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg w-fit shadow-sm">
          <CalendarDays size={14} className="text-red-500" />
          <span className="font-medium">{formatDate(meeting.meetingDate)}</span>
        </div>
        <CardTitle className="text-xl font-bold tracking-tight text-gray-800 group-hover:text-slate-700 transition-colors duration-200">
          {meeting.title}
        </CardTitle>
        <CardDescription className="flex items-center gap-1.5 text-slate-600 mt-1.5">
          <Users size={14} className="text-slate-500" />
          <span className="text-sm">
            Coordinator:{" "}
            <span className="font-medium">{meeting.coordinatorName}</span>
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="text-sm flex-grow text-slate-600 relative z-10 pt-3">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 backdrop-blur-sm shadow-sm">
          {meeting.minutes ? (
            truncateText(meeting.minutes, 120)
          ) : (
            <span className="text-slate-400 italic flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              No minutes recorded
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2 relative z-10">
        <Button
          variant="outline"
          size="sm"
          className="ml-auto border border-slate-200 bg-white hover:bg-red-600 hover:text-white transition-all duration-300 group-hover:shadow-md"
          asChild
        >
          <Link
            href={`/meetings/${meeting.id}`}
            className="flex items-center gap-1"
          >
            <span>View Details</span>
            <ChevronRight
              size={14}
              className="ml-1 transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  </motion.div>
);

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [viewMode, setViewMode] = useState<"table" | "card">("card");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Side panel state for new meeting form
  const [isNewMeetingPanelOpen, setIsNewMeetingPanelOpen] = useState(false);

  // Fetch meetings data with pagination
  const fetchMeetings = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/meetings?page=${page}&limit=${pagination.limit}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch meetings: ${response.statusText}`);
      }

      const data = await response.json();
      setMeetings(data.meetings);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Error fetching meetings:", err);
      setError(err instanceof Error ? err.message : "Failed to load meetings");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchMeetings();
  }, []); // Only fetch on initial render

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      fetchMeetings(newPage);
    }
  };

  return (
    <div className="max-w-screen-3xl mx-auto space-y-8">
      {/* Header wrapper with background */}
      <div className="bg-white rounded-lg shadow-sm p-5 border border-slate-200">
        {/* Page header with title, view toggles, and actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
            <p className="mt-1 text-sm text-gray-500">
              View, create and manage meeting records
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* View toggle buttons */}
            <div className="flex p-1 space-x-1 bg-gray-100 rounded-md">
              <button
                className={`${
                  viewMode === "card"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                } p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors duration-200`}
                onClick={() => setViewMode("card")}
                aria-label="Card view"
              >
                <Columns3 size={18} />
              </button>
              <button
                className={`${
                  viewMode === "table"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                } p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors duration-200`}
                onClick={() => setViewMode("table")}
                aria-label="Table view"
              >
                <List size={18} />
              </button>
            </div>

            <Button
              onClick={() => setIsNewMeetingPanelOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Plus className="mr-1" size={16} />
              New Meeting
            </Button>
          </div>
        </div>
      </div>

      {/* Error message display */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          <h3 className="font-medium">Error loading meetings</h3>
          <p className="text-sm mt-1">{error}</p>
          <div className="mt-2 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchMeetings(pagination.page)}
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center h-80 bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-600 mb-4"></div>
            <p className="text-slate-600">Loading meetings...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Table view */}
          {viewMode === "table" && (
            <div className="overflow-hidden rounded-lg border border-slate-200 shadow-md mb-8 bg-white">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-600 to-slate-400"></div>
              <table className="w-full divide-y divide-slate-200">
                <thead className="bg-gradient-to-r from-slate-50 to-white">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center">
                        Title
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
                        Coordinator
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
                        Date
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
                  {meetings.length > 0 ? (
                    meetings.map((meeting) => (
                      <tr
                        key={meeting.id}
                        className="hover:bg-slate-50 transition-colors duration-200 group cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-800 group-hover:text-slate-600 transition-colors duration-200">
                            {meeting.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors duration-200">
                            {meeting.coordinatorName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-600">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200 shadow-sm">
                              <CalendarDays size={12} className="mr-1" />
                              {formatDate(meeting.meetingDate)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-600 hover:text-white hover:bg-slate-600 transition-colors duration-200"
                            asChild
                          >
                            <Link
                              href={`/meetings/${meeting.id}`}
                              className="flex items-center justify-center gap-1"
                            >
                              View
                              <ChevronRight
                                size={14}
                                className="transition-transform duration-200 group-hover:translate-x-1"
                              />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-16 text-center text-slate-500 bg-slate-50/50"
                      >
                        <div className="flex flex-col items-center">
                          <div className="bg-white p-4 rounded-full shadow-md mb-4">
                            <Calendar className="h-12 w-12 text-slate-400" />
                          </div>
                          <p className="text-lg font-medium mb-1 text-slate-700">
                            No meetings found
                          </p>
                          <p className="text-sm text-slate-500 mb-4">
                            You haven&apos;t created any meetings yet
                          </p>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-700 hover:to-slate-600 text-white shadow-md transition-all duration-300 flex items-center gap-1.5 border-none"
                          >
                            <Plus size={16} />
                            Create your first meeting
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Card view */}
          {viewMode === "card" && (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
              <AnimatePresence>
                {meetings.length > 0 ? (
                  meetings.map((meeting) => (
                    <MeetingCard key={meeting.id} meeting={meeting} />
                  ))
                ) : (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    className="col-span-full rounded-lg border-none shadow-md bg-gradient-to-br from-white to-slate-50 overflow-hidden"
                  >
                    <div className="flex flex-col items-center text-center p-10 relative">
                      {/* Decorative elements */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-600 to-slate-400"></div>
                      <div className="absolute -right-20 -top-20 w-40 h-40 rounded-full bg-gradient-to-br from-slate-200 to-slate-100 opacity-30"></div>
                      <div className="absolute -left-20 -bottom-20 w-40 h-40 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 opacity-30"></div>

                      <div className="bg-white p-6 rounded-full shadow-md mb-6">
                        <Calendar className="h-16 w-16 text-slate-500" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-3">
                        No meetings found
                      </h3>
                      <p className="text-slate-600 mb-8 max-w-md">
                        You haven&apos;t created any meetings yet. Create your
                        first meeting to get started.
                      </p>
                      <Button
                        size="default"
                        className="bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-700 hover:to-slate-600 text-white px-6 py-5 shadow-md transition-all duration-300 hover:shadow-lg flex items-center gap-2"
                      >
                        <Plus size={18} />
                        Create your first meeting
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(pagination.page - 1)}
                      className={
                        pagination.page <= 1
                          ? "pointer-events-none opacity-50"
                          : "hover:bg-slate-50 text-slate-600"
                      }
                    />
                  </PaginationItem>

                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  )
                    .filter((page) => {
                      // Show first page, last page, current page and pages around current
                      return (
                        page === 1 ||
                        page === pagination.totalPages ||
                        Math.abs(page - pagination.page) <= 1
                      );
                    })
                    .map((page, i, filteredPages) => (
                      <React.Fragment key={page}>
                        {i > 0 && filteredPages[i - 1] !== page - 1 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink
                            isActive={page === pagination.page}
                            onClick={() => handlePageChange(page)}
                            className={
                              page === pagination.page
                                ? "bg-slate-600 text-white hover:bg-slate-700"
                                : "hover:bg-slate-50"
                            }
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      </React.Fragment>
                    ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(pagination.page + 1)}
                      className={
                        pagination.page >= pagination.totalPages
                          ? "pointer-events-none opacity-50"
                          : "hover:bg-slate-50 text-slate-600"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Side Panel for New Meeting Form */}
      <SidePanel
        isOpen={isNewMeetingPanelOpen}
        onClose={() => setIsNewMeetingPanelOpen(false)}
        title="Create New Meeting"
        size="large"
      >
        <NewMeetingForm onClose={() => setIsNewMeetingPanelOpen(false)} />
      </SidePanel>
    </div>
  );
}
