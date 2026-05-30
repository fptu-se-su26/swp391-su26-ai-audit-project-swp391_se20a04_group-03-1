/**
 * @module core/api
 * Public API for HTTP client and service endpoints.
 */
export { apiClient, setAuthToken, clearAuthToken, getAuthToken } from './client';
export {
  fetchDashboardSummary,
  fetchNotifications,
  fetchAppointments,
  fetchYardSpots,
} from './portal-api';
