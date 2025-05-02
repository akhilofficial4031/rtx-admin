"use client";

import { useState } from "react";
import { Button } from "@mui/material";
import { SidePanel } from "@/components/ui/side-panel";
import {
  NewMeetingForm,
  MeetingFormData,
} from "@/components/forms/NewMeetingForm";
import { Alert, Snackbar, Typography, Paper } from "@mui/material";

// Define a type for the meeting response
interface CreatedMeeting extends Omit<MeetingFormData, "meetingDate"> {
  id: string;
  meetingDate: string; // ISO string from API
  createdAt: string;
}

export default function TestMeetingFormPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [lastCreatedMeeting, setLastCreatedMeeting] =
    useState<CreatedMeeting | null>(null);

  const handleCreateMeeting = async (data: MeetingFormData) => {
    try {
      // Using our test endpoint that doesn't require auth
      const response = await fetch("/api/meetings/test-route", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create meeting");
      }

      console.log("Meeting created:", result);
      setLastCreatedMeeting(result.meeting);

      // Show success message
      setNotification({
        open: true,
        message: "Meeting created successfully!",
        severity: "success",
      });

      // Close the side panel
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating meeting:", error);

      // Show error message
      setNotification({
        open: true,
        message:
          error instanceof Error ? error.message : "Failed to create meeting",
        severity: "error",
      });

      // Don't close the panel on error so the user can fix and retry
      return Promise.reject(error);
    }
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Test Meeting Form</h1>

      <div className="mb-8">
        <Typography variant="body1" paragraph>
          This page demonstrates a side panel with a meeting form. Click the
          button below to open the form.
        </Typography>
        <Typography variant="body2" paragraph>
          The form uses mock data for the dropdowns and submits to a test
          endpoint.
        </Typography>
      </div>

      <Button
        variant="contained"
        onClick={() => setIsOpen(true)}
        sx={{ mb: 4 }}
      >
        New Meeting
      </Button>

      {lastCreatedMeeting && (
        <Paper elevation={2} sx={{ p: 3, mb: 4, maxWidth: 800 }}>
          <Typography variant="h6" gutterBottom>
            Last Created Meeting
          </Typography>
          <pre
            style={{
              overflowX: "auto",
              backgroundColor: "#f5f5f5",
              padding: "16px",
              borderRadius: "4px",
              maxHeight: "300px",
            }}
          >
            {JSON.stringify(lastCreatedMeeting, null, 2)}
          </pre>
        </Paper>
      )}

      <SidePanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create Meeting"
        size="large"
      >
        <NewMeetingForm
          onSubmit={handleCreateMeeting}
          onCancel={() => setIsOpen(false)}
        />
      </SidePanel>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
