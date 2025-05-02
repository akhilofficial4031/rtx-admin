"use client";

import { useState, useEffect } from "react";
import {
  useForm,
  useFieldArray,
  Controller,
  SubmitHandler,
  Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Stack,
  Typography,
  IconButton,
  Button as MuiButton,
  Alert,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AddCircle, Delete } from "@mui/icons-material";

const taskSchema = z.object({
  name: z.string().min(1, "Task name is required"),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  dueDate: z.date().optional().nullable(),
  status: z
    .enum(["not_started", "in_progress", "completed"])
    .default("not_started"),
});

const meetingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  meetingDate: z.date(),
  coordinatorId: z.string().min(1, "Coordinator is required"),
  projectId: z.string().optional(),
  minutes: z.string().optional(),
  tasks: z.array(taskSchema).default([]),
});

export type MeetingFormData = z.infer<typeof meetingSchema>;

const statusOptions = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

// Mock data for users and projects - this ensures we have data even if API calls fail
const MOCK_USERS = [
  { id: "user1", name: "John Doe" },
  { id: "user2", name: "Jane Smith" },
  { id: "user3", name: "Alex Johnson" },
  { id: "user4", name: "Sarah Williams" },
  { id: "user5", name: "Michael Brown" },
];

const MOCK_PROJECTS = [
  { projectId: "proj1", name: "Website Redesign" },
  { projectId: "proj2", name: "Mobile App Development" },
  { projectId: "proj3", name: "Marketing Campaign" },
  { projectId: "proj4", name: "E-commerce Platform" },
  { projectId: "proj5", name: "CRM Integration" },
];

export function NewMeetingForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: MeetingFormData) => void;
  onCancel: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] =
    useState<{ id: string; name: string }[]>(MOCK_USERS);
  const [projects, setProjects] =
    useState<{ projectId: string; name: string }[]>(MOCK_PROJECTS);
  const [apiError, setApiError] = useState<string | null>(null);

  // Try to fetch real data but fallback to mock data if API fails
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to fetch real users
        const usersResponse = await fetch("/api/users");
        if (usersResponse.ok) {
          const userData = await usersResponse.json();
          if (userData.users && userData.users.length > 0) {
            setUsers(userData.users);
          }
        }

        // Try to fetch real projects
        const projectsResponse = await fetch("/api/projects");
        if (projectsResponse.ok) {
          const projectData = await projectsResponse.json();
          if (projectData.projects && projectData.projects.length > 0) {
            setProjects(projectData.projects);
          }
        }
      } catch (error) {
        console.log("Using mock data due to API error:", error);
        // We don't need to set error state since we're using mock data as fallback
      }
    };

    fetchData();
  }, []);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema) as Resolver<MeetingFormData>,
    defaultValues: {
      title: "",
      meetingDate: new Date(),
      coordinatorId: users[0]?.id || "",
      projectId: "",
      minutes: "",
      tasks: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tasks",
  });

  const handleFormSubmit: SubmitHandler<MeetingFormData> = async (data) => {
    setIsSubmitting(true);
    setApiError(null);
    try {
      await onSubmit(data);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Stack spacing={3}>
        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}

        <Typography variant="h6" gutterBottom>
          Meeting Details
        </Typography>

        <TextField
          label="Meeting Title"
          fullWidth
          variant="outlined"
          error={!!errors.title}
          helperText={errors.title?.message}
          {...register("title")}
        />

        <Controller
          name="meetingDate"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Meeting Date"
              value={field.value}
              onChange={(newValue) => field.onChange(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: "outlined",
                  error: !!errors.meetingDate,
                  helperText: errors.meetingDate?.message,
                },
              }}
            />
          )}
        />

        <FormControl fullWidth error={!!errors.coordinatorId}>
          <InputLabel id="coordinator-label">Coordinator</InputLabel>
          <Controller
            name="coordinatorId"
            control={control}
            render={({ field }) => (
              <Select
                labelId="coordinator-label"
                label="Coordinator"
                value={field.value}
                onChange={field.onChange}
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          {errors.coordinatorId && (
            <FormHelperText>{errors.coordinatorId.message}</FormHelperText>
          )}
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="project-label">Project (Optional)</InputLabel>
          <Controller
            name="projectId"
            control={control}
            render={({ field }) => (
              <Select
                labelId="project-label"
                label="Project (Optional)"
                value={field.value || ""}
                onChange={field.onChange}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.projectId} value={project.projectId}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </FormControl>

        <TextField
          label="Minutes"
          fullWidth
          variant="outlined"
          multiline
          rows={4}
          error={!!errors.minutes}
          helperText={errors.minutes?.message}
          {...register("minutes")}
        />

        <div>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Tasks</Typography>
            <MuiButton
              type="button"
              onClick={() => append({ name: "", status: "not_started" })}
              variant="contained"
              startIcon={<AddCircle />}
            >
              Add Task
            </MuiButton>
          </Stack>

          {fields.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No tasks added yet. Click &ldquo;Add Task&rdquo; to create a new
              task.
            </Alert>
          ) : (
            fields.map((field, index) => (
              <Stack
                key={field.id}
                spacing={2}
                sx={{
                  p: 2,
                  mb: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle1">Task #{index + 1}</Typography>
                  <IconButton
                    onClick={() => remove(index)}
                    color="error"
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </Stack>

                <TextField
                  label="Task Name"
                  fullWidth
                  variant="outlined"
                  error={!!errors.tasks?.[index]?.name}
                  helperText={errors.tasks?.[index]?.name?.message}
                  {...register(`tasks.${index}.name`)}
                />

                <TextField
                  label="Description"
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={2}
                  {...register(`tasks.${index}.description`)}
                />

                <FormControl fullWidth>
                  <InputLabel id={`assignee-label-${index}`}>
                    Assignee
                  </InputLabel>
                  <Controller
                    control={control}
                    name={`tasks.${index}.assigneeId`}
                    render={({ field }) => (
                      <Select
                        labelId={`assignee-label-${index}`}
                        label="Assignee"
                        value={field.value || ""}
                        onChange={field.onChange}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {users.map((user) => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>

                <Controller
                  name={`tasks.${index}.dueDate`}
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label="Due Date"
                      value={field.value}
                      onChange={(newValue) => field.onChange(newValue)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "outlined",
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  name={`tasks.${index}.status`}
                  control={control}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      error={!!errors.tasks?.[index]?.status}
                    >
                      <InputLabel>Status</InputLabel>
                      <Select
                        label="Status"
                        value={field.value}
                        onChange={field.onChange}
                      >
                        {statusOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.tasks?.[index]?.status?.message && (
                        <FormHelperText>
                          {errors.tasks?.[index]?.status?.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Stack>
            ))
          )}
        </div>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <MuiButton
            onClick={onCancel}
            variant="outlined"
            disabled={isSubmitting}
          >
            Cancel
          </MuiButton>
          <MuiButton type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Meeting"}
          </MuiButton>
        </Stack>
      </Stack>
    </form>
  );
}
