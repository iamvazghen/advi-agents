import { ConvexHttpClient } from "convex/browser";

let convexHttpClient: ConvexHttpClient | null = null;
let convexServerClient: ConvexHttpClient | null = null;

export const getConvexClient = (): ConvexHttpClient => {
  if (!convexHttpClient) {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error("NEXT_PUBLIC_CONVEX_URL is not defined");
    }
    convexHttpClient = new ConvexHttpClient(convexUrl);
  }
  return convexHttpClient;
};

export const getServerConvexClient = (token?: string): ConvexHttpClient => {
  if (!convexServerClient) {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error("NEXT_PUBLIC_CONVEX_URL is not defined");
    }
    convexServerClient = new ConvexHttpClient(convexUrl);
  }
  if (token) {
    convexServerClient.setAuth(token);
  }
  return convexServerClient;
};