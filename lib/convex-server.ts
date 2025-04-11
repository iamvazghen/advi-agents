import { ConvexHttpClient } from "convex/browser";

let convexClient: ConvexHttpClient | null = null;

export const getServerConvexClient = (token?: string): ConvexHttpClient => {
  if (!convexClient) {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error("NEXT_PUBLIC_CONVEX_URL is not defined");
    }
    convexClient = new ConvexHttpClient(convexUrl);
  }
  if (token) {
    convexClient.setAuth(token);
  }
  return convexClient;
};