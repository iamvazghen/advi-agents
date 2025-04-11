/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as automations from "../automations.js";
import type * as chats from "../chats.js";
import type * as http from "../http.js";
import type * as integrations_getStatus from "../integrations/getStatus.js";
import type * as integrations from "../integrations.js";
import type * as messages from "../messages.js";
import type * as stripeData from "../stripeData.js";
import type * as userData from "../userData.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  automations: typeof automations;
  chats: typeof chats;
  http: typeof http;
  "integrations/getStatus": typeof integrations_getStatus;
  integrations: typeof integrations;
  messages: typeof messages;
  stripeData: typeof stripeData;
  userData: typeof userData;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
