// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api"; // Import the API module to reference queries

// Expose getStatus as an HTTP endpoint
const getStatus = httpAction(async (ctx, request) => {
  const clerkToken = request.headers.get("convex-auth-token");
  if (!clerkToken) {
    return new Response(JSON.stringify({ error: "No authentication token provided" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  const { userId } = body;

  if (!userId || typeof userId !== "string") {
    return new Response(JSON.stringify({ error: "Invalid or missing userId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Run the registered query using api reference
  const integrations = await ctx.runQuery(api["integrations/getStatus"], { userId });

  return new Response(JSON.stringify(integrations), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

// Set up the HTTP router
const http = httpRouter();
http.route({
  path: "/integrations/getStatus",
  method: "POST",
  handler: getStatus,
});

export default http;