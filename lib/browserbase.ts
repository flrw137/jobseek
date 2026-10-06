import Browserbase from "@browserbasehq/sdk";

export async function createCompanyResearchSession(): Promise<string> {
  const apiKey = process.env.BROWSERBASE_API_KEY;
  const projectId = process.env.BROWSERBASE_PROJECT_ID;

  if (!apiKey || !projectId) {
    throw new Error("Browserbase is not configured. Set BROWSERBASE_API_KEY and BROWSERBASE_PROJECT_ID.");
  }

  const bb = new Browserbase({ apiKey });

  const session = await bb.sessions.create({
    projectId,
    timeout: 120,
  });

  return session.id;
}
