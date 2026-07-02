import { apiRequest } from "./_helpers";
import type { Notification } from "@/types/notification.types";
import type { ID } from "@/types/common.types";

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface PageEnvelope<T> {
  content: T[];
  totalElements: number;
}

export const notificationsService = {
  list: async (): Promise<Notification[]> => {
    const env = await apiRequest<ApiEnvelope<PageEnvelope<Notification>>>({
      url: "/notifications/me",
      params: { size: 50 },
    });
    return env.data?.content ?? [];
  },
  markRead: (id: ID) => apiRequest<ApiEnvelope<void>>({ method: "PATCH", url: `/notifications/${id}/read` }),
  markAllRead: () => apiRequest<ApiEnvelope<Record<string, number>>>({ method: "PATCH", url: "/notifications/me/read-all" }),
  remove: (id: ID) => apiRequest<ApiEnvelope<void>>({ method: "DELETE", url: `/notifications/${id}` }),
};
