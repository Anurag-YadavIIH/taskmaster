// Types mirroring the TaskMaster backend DTOs (com.airtribe.taskmaster.dto.*)

export type TaskStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TeamRole = "OWNER" | "MEMBER";

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  fullName: string | null;
  bio: string | null;
  createdAt: string;
}

export interface UserSearchResult {
  id: number;
  username: string;
  fullName: string | null;
  email: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: UserResponse;
}

export interface TaskResponse {
  id: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  creatorId: number;
  creatorUsername: string;
  assigneeId: number | null;
  assigneeUsername: string | null;
  teamId: number | null;
  teamName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface TeamResponse {
  id: number;
  name: string;
  description: string | null;
  ownerId: number;
  ownerUsername: string;
  createdAt: string;
}

export interface TeamMemberResponse {
  userId: number;
  username: string;
  fullName: string | null;
  role: TeamRole;
}

export interface CommentResponse {
  id: number;
  taskId: number;
  authorId: number;
  authorUsername: string;
  content: string;
  createdAt: string;
}

export interface AttachmentResponse {
  id: number;
  taskId: number;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedById: number;
  uploadedByUsername: string;
  createdAt: string;
}

export interface NotificationResponse {
  id: number;
  message: string;
  taskId: number | null;
  read: boolean;
  createdAt: string;
}

export interface GeneratedTextResponse {
  text: string;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors: Record<string, string> | null;
}

// --- Request payloads ---

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  dueDate?: string | null;
  priority?: TaskPriority;
  assigneeId?: number | null;
  teamId?: number | null;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  dueDate?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface UpdateProfileRequest {
  fullName?: string;
  bio?: string;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
}

export interface TaskListParams {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: number;
  teamId?: number;
  search?: string;
  dueBefore?: string;
  page?: number;
  size?: number;
  sort?: string;
}
