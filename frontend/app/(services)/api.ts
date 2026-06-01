import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Paginated<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
  bio?: string | null;
  avatarUrl?: string | null;
  role: string | { name: string };
}

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
}

export interface RestaurantImageDto {
  id: string;
  url: string;
  alt?: string | null;
  position?: number;
}

export interface RestaurantDto {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  address: string;
  area?: string | null;
  city?: string | null;
  priceRange?: "CHEAP" | "MODERATE" | "EXPENSIVE" | "LUXURY";
  ratingAvg?: string | number;
  ratingCount?: number;
  coverImage?: string | null;
  category?: CategoryDto | null;
  images?: RestaurantImageDto[];
}

export interface PostImageDto {
  id: string;
  url: string;
  alt?: string | null;
  position?: number;
}

export interface TagDto {
  tag?: { id: string; name: string; slug: string };
}

export interface CommentDto {
  id: string;
  content: string;
  createdAt: string;
  author: Pick<UserDto, "id" | "name" | "avatarUrl">;
  replies?: CommentDto[];
}

export interface PostDto {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  rating: number;
  readTime?: string | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  favoriteCount: number;
  createdAt: string;
  author: Pick<UserDto, "id" | "name" | "avatarUrl">;
  restaurant?: RestaurantDto | null;
  category?: CategoryDto | null;
  images: PostImageDto[];
  tags?: TagDto[];
  comments?: CommentDto[];
}

export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  readAt?: string | null;
}

export interface AuthResponse {
  user: UserDto;
  accessToken: string;
  refreshToken: string;
}

const ACCESS_TOKEN_KEY = "freshbite_access_token";
const REFRESH_TOKEN_KEY = "freshbite_refresh_token";

export const tokenStorage = {
  getAccessToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefreshToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  set(tokens: Pick<AuthResponse, "accessToken" | "refreshToken">) {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  },
  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" }
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string | null> | null = null;

function apiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message;
  }
  return error instanceof Error ? error.message : "Unexpected API error";
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (error.response?.status !== 401 || !original || original._retry || original.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    original._retry = true;
    refreshing ??= authApi
      .refresh()
      .then((data) => {
        tokenStorage.set(data);
        return data.accessToken;
      })
      .catch(() => {
        tokenStorage.clear();
        return null;
      })
      .finally(() => {
        refreshing = null;
      });

    const token = await refreshing;
    if (!token) return Promise.reject(error);
    original.headers.Authorization = `Bearer ${token}`;
    return apiClient(original);
  }
);

async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>) {
  try {
    const response = await promise;
    return response.data.data;
  } catch (error) {
    throw new Error(apiErrorMessage(error));
  }
}

export const authApi = {
  register(payload: { name: string; email: string; password: string }) {
    return unwrap<AuthResponse>(apiClient.post("/auth/register", payload));
  },
  login(payload: { email: string; password: string }) {
    return unwrap<AuthResponse>(apiClient.post("/auth/login", payload));
  },
  google(idToken: string) {
    return unwrap<AuthResponse>(apiClient.post("/auth/google", { idToken }));
  },
  refresh() {
    return unwrap<AuthResponse>(apiClient.post("/auth/refresh", { refreshToken: tokenStorage.getRefreshToken() }));
  },
  logout() {
    return apiClient.post("/auth/logout").finally(() => tokenStorage.clear());
  }
};

export const userApi = {
  me() {
    return unwrap<UserDto>(apiClient.get("/users/me"));
  },
  updateMe(payload: { name?: string; bio?: string; avatarUrl?: string }) {
    return unwrap<UserDto>(apiClient.patch("/users/me", payload));
  },
  uploadAvatar(file: File) {
    const form = new FormData();
    form.append("image", file);
    return unwrap<{ user: UserDto; image: UploadedImage }>(apiClient.post("/users/avatar", form, { headers: { "Content-Type": "multipart/form-data" } }));
  }
};

export const postsApi = {
  list(params?: Record<string, string | number | undefined>) {
    return unwrap<Paginated<PostDto>>(apiClient.get("/posts", { params }));
  },
  get(id: string) {
    return unwrap<PostDto>(apiClient.get(`/posts/${id}`));
  },
  create(payload: CreatePostPayload) {
    return unwrap<PostDto>(apiClient.post("/posts", payload));
  },
  update(id: string, payload: Partial<CreatePostPayload>) {
    return unwrap<PostDto>(apiClient.patch(`/posts/${id}`, payload));
  },
  remove(id: string) {
    return apiClient.delete(`/posts/${id}`);
  }
};

export const commentsApi = {
  create(payload: { postId: string; parentId?: string; content: string }) {
    return unwrap<CommentDto>(apiClient.post("/comments", payload));
  },
  update(id: string, payload: { content: string }) {
    return unwrap<CommentDto>(apiClient.patch(`/comments/${id}`, payload));
  },
  remove(id: string) {
    return apiClient.delete(`/comments/${id}`);
  }
};

export const restaurantsApi = {
  list(params?: Record<string, string | number | undefined>) {
    return unwrap<Paginated<RestaurantDto>>(apiClient.get("/restaurants", { params }));
  },
  get(id: string) {
    return unwrap<RestaurantDto>(apiClient.get(`/restaurants/${id}`));
  },
  create(payload: CreateRestaurantPayload) {
    return unwrap<RestaurantDto>(apiClient.post("/restaurants", payload));
  },
  update(id: string, payload: Partial<CreateRestaurantPayload>) {
    return unwrap<RestaurantDto>(apiClient.patch(`/restaurants/${id}`, payload));
  },
  remove(id: string) {
    return apiClient.delete(`/restaurants/${id}`);
  }
};

export const votesApi = {
  like(postId: string) {
    return apiClient.post("/votes", { postId });
  },
  unlike(postId: string) {
    return apiClient.delete("/votes", { data: { postId } });
  }
};

export const favoritesApi = {
  save(postId: string) {
    return apiClient.post("/favorites", { postId });
  },
  unsave(postId: string) {
    return apiClient.delete("/favorites", { data: { postId } });
  }
};

export const notificationsApi = {
  list(params?: Record<string, string | number | undefined>) {
    return unwrap<Paginated<NotificationDto>>(apiClient.get("/notifications", { params }));
  }
};

export const searchApi = {
  search(params: { q: string; type?: "all" | "posts" | "restaurants"; page?: number; limit?: number }) {
    return unwrap<{ posts: PostDto[]; restaurants: RestaurantDto[] }>(apiClient.get("/search", { params }));
  }
};

export interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

export const uploadsApi = {
  images(files: File[], folder = "posts") {
    const form = new FormData();
    files.forEach((file) => form.append("images", file));
    form.append("folder", folder);
    return unwrap<UploadedImage[]>(apiClient.post("/uploads/images", form, { headers: { "Content-Type": "multipart/form-data" } }));
  }
};

export interface CreateRestaurantPayload {
  name: string;
  description?: string;
  address: string;
  area?: string;
  city?: string;
  priceRange?: "CHEAP" | "MODERATE" | "EXPENSIVE" | "LUXURY";
  coverImage?: string;
  imageUrls?: string[];
}

export interface CreatePostPayload {
  title: string;
  content: string;
  excerpt?: string;
  rating: number;
  restaurantId?: string;
  restaurant?: CreateRestaurantPayload;
  imageUrls?: string[];
  tags?: string[];
  published?: boolean;
}
