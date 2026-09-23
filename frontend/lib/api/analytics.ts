import { fetchApi } from "./client";
import { VelocityStatsDTO, TelemetryEventPayload } from "@top1/shared";

/**
 * ANLT-002: Fetch personal velocity stats for the dashboard widget.
 */
export async function fetchVelocityStats(): Promise<VelocityStatsDTO> {
  return fetchApi<VelocityStatsDTO>("/analytics/velocity");
}

/**
 * ANLT-001: Fire a telemetry event — best-effort, never throws.
 * Returns immediately; the server responds 202 and stores async.
 */
export async function fireTelemetryEvent(payload: TelemetryEventPayload): Promise<void> {
  try {
    await fetchApi<{ accepted: boolean }>("/analytics/event", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
    // Silently swallow — telemetry must never block learner UX
  }
}
