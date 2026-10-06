export interface AdzunaJob {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string;
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted: "0" | "1";
  contract_type?: string;
  created: string;
  category: { tag: string; label: string };
}

export async function searchJobs(
  jobTitle: string,
  location: string,
  country: string = "us",
): Promise<AdzunaJob[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) {
    throw new Error("Adzuna is not configured.");
  }

  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    what: jobTitle,
    category: "it-jobs",
    results_per_page: "25",
    "content-type": "application/json",
  });

  const where = normalizeLocation(location);
  if (where) {
    params.set("where", where);
  }

  const response = await fetch(
    `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`,
  );

  if (!response.ok) {
    throw new Error(`Adzuna API error: ${response.status}`);
  }

  const data = await response.json();
  return (data.results || []) as AdzunaJob[];
}

function normalizeLocation(location: string): string {
  const NON_PLACE_TOKENS = /^(remote|remotely|hybrid|onsite|on\s*site|anywhere|flexible|in\s*office)$/i;

  return location
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part && !NON_PLACE_TOKENS.test(part))
    .join(", ");
}
