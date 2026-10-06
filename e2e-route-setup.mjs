import { createClient } from "@insforge/sdk";

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

const MT = "https://api.mail.tm";
const local = `jobseek-e2e-${Date.now()}`;
const email = `${local}@emalupe.com`;
const inboxPassword = `Rm!${Date.now()}x9aP`;
const appPassword = `Temp-${Date.now()}-xK9`;

async function mtJson(path, init = {}) {
  const res = await fetch(`${MT}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`mail.tm ${init.method ?? "GET"} ${path} -> ${res.status}: ${text}`);
  }
  return res.json();
}

async function waitForOtp(auth) {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    const messages = await mtJson("/messages", { headers: auth });
    const list = Array.isArray(messages)
      ? messages
      : Array.isArray(messages?.["hydra:member"])
        ? messages["hydra:member"]
        : [];
    for (const item of list) {
      const msg = await mtJson(`/messages/${item.id}`, { headers: auth });
      const subject = String(msg.subject ?? "");
      const content = (msg.html ?? []).join(" ") + " " + (msg.text ?? "");
      const subjectMatch = subject.match(/(\d{6})\b/);
      if (/verification|verify|code/i.test(subject) && subjectMatch) {
        return subjectMatch[1];
      }
      if (/welcome|mail\.tm|emalupe/i.test(subject) && !/verify|verification|code|otp/i.test(content)) {
        console.log("SKIP welcome email:", subject);
        continue;
      }
      const centerMatch = content.match(/text-align:\s*center;?">(\d{6})</);
      if (centerMatch) return centerMatch[1];
      console.log("MESSAGE FOUND, no 6-digit OTP yet:", subject, "| content:", content.slice(0, 500));
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  throw new Error("Timed out waiting for verification email");
}

const client = createClient({ baseUrl, anonKey });

await mtJson("/accounts", {
  method: "POST",
  body: JSON.stringify({ address: email, password: inboxPassword }),
});
console.log("INBOX READY", email);

const signup = await client.auth.signUp({ email, password: appPassword });
if (signup.error) {
  console.error("SIGNUP FAILED");
  console.error(JSON.stringify(signup.error, null, 2));
  process.exit(1);
}
console.log("SIGNUP OK", { requireEmailVerification: signup.data?.requireEmailVerification });

const otp = await waitForOtp({
  Authorization: `Bearer ${(
    await mtJson("/token", {
      method: "POST",
      body: JSON.stringify({ address: email, password: inboxPassword }),
    })
  ).token}`,
});
console.log("OTP OK", otp);

const verify = await client.auth.verifyEmail({ email, otp });
if (verify.error || !verify.data?.accessToken || !verify.data?.user) {
  console.error("VERIFY FAILED");
  console.error(JSON.stringify(verify.error ?? verify.data, null, 2));
  process.exit(1);
}
const { accessToken, user } = verify.data;
console.log("VERIFY OK", { userId: user.id, emailVerified: user.emailVerified });

const profile = {
  id: user.id,
  full_name: "Route E2E Tester",
  email,
  current_title: "Senior Full-Stack Engineer",
  experience_level: "senior",
  years_experience: 6,
  skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS"],
  industries: ["Fintech"],
  work_experience: [
    {
      company: "Acme",
      title: "Senior Software Engineer",
      startDate: "2021-01",
      currentlyWorking: true,
      responsibilities: "Built and shipped high-traffic APIs on AWS.",
    },
  ],
  education: { degree: "", fieldOfStudy: "", institution: "", graduationYear: "" },
  job_titles_seeking: ["Senior Software Engineer"],
  remote_preference: "remote",
  preferred_locations: [],
  salary_expectation: "150000",
};

const { error: profileError } = await client.database
  .from("profiles")
  .upsert([profile], { onConflict: "id" });
if (profileError) {
  console.error("PROFILE FAILED");
  console.error(JSON.stringify(profileError, null, 2));
  process.exit(1);
}
console.log("PROFILE OK");

const job = {
  source: "search",
  source_url: "https://www.stripe.com",
  external_apply_url: "https://www.stripe.com",
  title: "Senior Full-Stack Engineer",
  company: "Stripe",
  location: "Remote",
  salary: null,
  job_type: "fulltime",
  about_role: "Build the global payment infrastructure that powers businesses around the world.",
  match_score: 92,
  match_reason: "Strong TypeScript/React/PostgreSQL alignment with Stripe's stack.",
  matched_skills: ["TypeScript", "React", "PostgreSQL"],
  missing_skills: ["Kubernetes"],
  found_at: new Date().toISOString(),
  user_id: user.id,
  run_id: null,
};

const { data: inserted, error: jobError } = await client.database
  .from("jobs")
  .insert([job])
  .select("id")
  .single();
if (jobError) {
  console.error("JOB INSERT FAILED");
  console.error(JSON.stringify(jobError, null, 2));
  process.exit(1);
}
console.log("JOB OK", { jobId: inserted.id });

console.log(
  "SESSION " +
    JSON.stringify({ jobId: inserted.id, accessToken, email, baseUrl }),
);
