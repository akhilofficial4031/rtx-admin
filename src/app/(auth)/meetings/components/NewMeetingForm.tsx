"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/hooks/useAuth";

// MUI Components
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// MUI Icons
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

// Define form schema with Zod
const taskSchema = z.object({
  name: z.string().min(1, "Task name is required"),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  dueDate: z.date().optional().nullable(),
  status: z.string(),
});

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  meetingDate: z.date({ required_error: "Meeting date is required" }),
  coordinatorId: z.string({ required_error: "Coordinator is required" }),
  projectId: z.string().optional(),
  minutes: z.string().optional(),
  tasks: z.array(taskSchema).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface User {
  id: string;
  name: string;
}

interface Project {
  projectId: string;
  projectName: string;
  description?: string | null;
}

interface NewMeetingFormProps {
  onClose: () => void;
}

export default function NewMeetingForm({ onClose }: NewMeetingFormProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { user, getToken } = useAuth();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      meetingDate: new Date(),
      coordinatorId: "",
      projectId: "",
      minutes: "",
      tasks: [
        { name: "", description: "", assigneeId: "", status: "not_started" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tasks",
  });

  // Set current user as coordinator by default
  useEffect(() => {
    if (user) {
      setValue("coordinatorId", user.id);
    }
  }, [user, setValue]);

  // Fetch users and projects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [usersResponse, projectsResponse] = await Promise.all([
          fetch("/api/dropdowns/users", { headers }),
          fetch("/api/dropdowns/projects", { headers }),
        ]);

        if (!usersResponse.ok || !projectsResponse.ok) {
          throw new Error("Failed to fetch dropdown data");
        }

        const usersData = await usersResponse.json();
        const projectsData = await projectsResponse.json();

        setUsers(usersData.users || []);
        setProjects(projectsData.projects || []);
      } catch (err) {
        setError("Failed to load users and projects");
        console.error(err);
      }
    };

    fetchData();
  }, [getToken]);

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const token = getToken();

      if (!token) {
        throw new Error("You must be logged in to create a meeting");
      }

      // If no coordinator is specified, use the current user
      if (!data.coordinatorId && user) {
        data.coordinatorId = user.id;
      }

      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create meeting");
      }

      setSuccess(true);
      reset();

      // Close the panel after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create meeting");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={onSubmit} sx={{ p: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Meeting created successfully!
          </Alert>
        )}

        <Stack spacing={2}>
          {/* Meeting Title */}
          <TextField
            {...register("title")}
            label="Meeting Title"
            fullWidth
            size="small"
            error={!!errors.title}
            helperText={errors.title?.message}
            InputLabelProps={{ shrink: true }}
          />

          {/* Date and Coordinator */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            {/* Meeting Date */}
            <Controller
              control={control}
              name="meetingDate"
              render={({ field }) => (
                <DatePicker
                  label="Meeting Date"
                  value={field.value}
                  onChange={(date) => field.onChange(date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: "small",
                      error: !!errors.meetingDate,
                      helperText: errors.meetingDate?.message,
                    },
                  }}
                />
              )}
            />

            {/* Coordinator */}
            <FormControl fullWidth size="small" error={!!errors.coordinatorId}>
              <InputLabel id="coordinator-label">Coordinator</InputLabel>
              <Controller
                control={control}
                name="coordinatorId"
                render={({ field }) => (
                  <Select
                    {...field}
                    labelId="coordinator-label"
                    label="Coordinator"
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
          </Stack>

          {/* Project */}
          <FormControl fullWidth size="small">
            <InputLabel id="project-label">Project (Optional)</InputLabel>
            <Controller
              control={control}
              name="projectId"
              render={({ field }) => (
                <Select
                  {...field}
                  labelId="project-label"
                  label="Project (Optional)"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project.projectId} value={project.projectId}>
                      {project.projectName}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>

          {/* Minutes */}
          <TextField
            {...register("minutes")}
            label="Meeting Minutes"
            multiline
            rows={4}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />

          {/* Tasks Section */}
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="subtitle1" fontWeight="medium">
              Meeting Tasks
            </Typography>
            <Divider />
          </Box>

          {/* Task List */}
          <Stack spacing={2}>
            {fields.map((field, index) => (
              <Card variant="outlined" key={field.id}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="subtitle2">
                      Task #{index + 1}
                    </Typography>
                    <IconButton
                      size="small"
                      color="error"
                      disabled={fields.length === 1}
                      onClick={() => remove(index)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Stack spacing={2}>
                    {/* Task Name */}
                    <TextField
                      {...register(`tasks.${index}.name` as const)}
                      label="Task Name"
                      fullWidth
                      size="small"
                      error={!!errors.tasks?.[index]?.name}
                      helperText={errors.tasks?.[index]?.name?.message}
                      InputLabelProps={{ shrink: true }}
                    />

                    {/* Task Description */}
                    <TextField
                      {...register(`tasks.${index}.description` as const)}
                      label="Description"
                      multiline
                      rows={2}
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />

                    {/* Assignee and Due Date */}
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      {/* Assignee */}
                      <FormControl fullWidth size="small">
                        <InputLabel id={`assignee-label-${index}`}>
                          Assignee
                        </InputLabel>
                        <Controller
                          control={control}
                          name={`tasks.${index}.assigneeId` as const}
                          render={({ field }) => (
                            <Select
                              {...field}
                              labelId={`assignee-label-${index}`}
                              label="Assignee"
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

                      {/* Due Date */}
                      <Controller
                        control={control}
                        name={`tasks.${index}.dueDate` as const}
                        render={({ field }) => (
                          <DatePicker
                            label="Due Date"
                            value={field.value}
                            onChange={(date) => field.onChange(date)}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                size: "small",
                              },
                            }}
                          />
                        )}
                      />
                    </Stack>

                    {/* Task Status */}
                    <FormControl fullWidth size="small">
                      <InputLabel id={`status-label-${index}`}>
                        Status
                      </InputLabel>
                      <Controller
                        control={control}
                        name={`tasks.${index}.status` as const}
                        render={({ field }) => (
                          <Select
                            {...field}
                            labelId={`status-label-${index}`}
                            label="Status"
                          >
                            <MenuItem value="not_started">Not Started</MenuItem>
                            <MenuItem value="in_progress">In Progress</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                          </Select>
                        )}
                      />
                    </FormControl>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>

          {/* Add Task Button */}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            fullWidth
            onClick={() =>
              append({
                name: "",
                description: "",
                assigneeId: "",
                status: "not_started",
              })
            }
            sx={{ mb: 2 }}
          >
            Add Task
          </Button>

          {/* Form Actions */}
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}
          >
            <Button
              variant="outlined"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              sx={{
                bgcolor: "error.main",
                "&:hover": {
                  bgcolor: "error.dark",
                },
              }}
            >
              {isSubmitting ? "Creating..." : "Create Meeting"}
            </Button>
          </Box>
        </Stack>
      </Box>
    </LocalizationProvider>
  );
}
