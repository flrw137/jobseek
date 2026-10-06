import { readFileSync } from "node:fs";

const session = JSON.parse(
  readFileSync("C:\\Users\\freid\\AppData\\Local\\Temp\\opencode\\e2e-session.json", "utf8").replace(/^\uFEFF/, ""),
);

const started = Date.now();

async function post(body, cookie) {
  const res = await fetch("http://localhost:3000/api/agent/research", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  console.log("STATUS", res.status, "in", Date.now() - started, "ms");
  console.log("BODY", text.slice(0, 4000));
  return { status: res.status, text };
}

console.log("=== 1) no auth -> expect 401 ===");
await post({ jobId: session.jobId }, "");

console.log("\n=== 2) wrong jobId (authed) -> expect 404 ===");
await post({ jobId: "00000000-0000-0000-0000-000000000000" }, `insforge_access_token=${session.accessToken}`);

console.log("\n=== 3) real research (authed) ===");
const { status } = await post({ jobId: session.jobId }, `insforge_access_token=${session.accessToken}`);
process.exit(status === 200 ? 0 : 1);
