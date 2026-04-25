export const DASHBOARD_COOKIE_NAME = "cv_dashboard_session";
export const DASHBOARD_COOKIE_VALUE = "ok";

export function getDashboardPassword(): string {
  return process.env.DASHBOARD_PASSWORD ?? "change-me";
}
