import posthog from "posthog-js";

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (!projectToken) {
  if (process.env.NODE_ENV === "development") {
    throw new Error(
      "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is configured",
    );
  }
} else if (!host) {
  if (process.env.NODE_ENV === "development") {
    throw new Error(
      "NEXT_PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_HOST is configured",
    );
  }
} else {
  posthog.init(projectToken, {
    api_host: host,
    defaults: "2026-01-30",
    capture_exceptions: true,
    // Jobseek tracks custom events only — never load PostHog's lazily
    // fetched feature scripts (the host does not serve them, which previously
    // caused `[SessionRecording] "could not load recorder"` and
    // `[Dead Clicks] "failed to load script"` errors in the console).
    // The remote config would otherwise enable both via `defaults`.
    disable_session_recording: true,
    capture_dead_clicks: false,
    // Also disable heatmaps: the heatmaps feature spawns its own dead-clicks
    // recorder (`en: () => true`) that is not covered by capture_dead_clicks,
    // and remote config would otherwise enable heatmaps server-side.
    capture_heatmaps: false,
    enable_heatmaps: false,
    debug: process.env.NODE_ENV === "development",
  });
}
