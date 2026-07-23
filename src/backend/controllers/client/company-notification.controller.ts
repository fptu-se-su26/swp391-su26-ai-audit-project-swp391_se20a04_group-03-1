import { companyFeedFilter } from "../../services/notification-feed.service";
import { makeClientNotificationHandlers } from "./client-notification.controller";

/**
 * Chuông thông báo của doanh nghiệp vận tải — chỉ thấy thông báo có
 * recipientId là chính mình. Toàn bộ logic nằm ở nhà máy dùng chung.
 */
export const { listGet, markReadPatch, markAllReadPatch } =
  makeClientNotificationHandlers(companyFeedFilter);
