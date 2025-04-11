// lib/getUserContext.ts
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

/**
 * Error types for user context operations
 */
export enum UserContextErrorType {
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  API_ERROR = "API_ERROR",
  INVALID_PARAMS = "INVALID_PARAMS",
  UNKNOWN_ERROR = "UNKNOWN_ERROR"
}

/**
 * Custom error class for user context operations
 */
export class UserContextError extends Error {
  type: UserContextErrorType;
  
  constructor(message: string, type: UserContextErrorType) {
    super(message);
    this.type = type;
    this.name = "UserContextError";
  }
}

/**
 * Interface representing user context data from the Convex database
 * This is used to provide personalized context to the AI agent
 */
export interface UserContextData {
  userId: string;
  organizationId: string;
  companyName: string;
  targetedAudience: string;
  companyShortTermGoals: string;
  companyLongTermGoals: string;
  companyAdditionalContext: string;
  userFullName: string;
  userShortTermGoals: string;
  userLongTermGoals: string;
  userAdditionalContext: string;
  files: {
    name: string;
    type: string;
    size: number;
    storageId: string;
    content?: string; // Added content property
    uploadedAt: number; // Changed from optional to required to match schema
    metadata?: {
      title?: string;
      author?: string;
      subject?: string;
      keywords?: string;
      creator?: string;
      producer?: string;
      creationDate?: string;
      modificationDate?: string;
      pageCount?: number;
      version?: string;
    };
  }[];
}

/**
 * Interface for file content that can be fetched separately
 */
export interface FileContent {
  content: string;
  mimeType: string;
  fileName: string;
}

// Cache for user context to avoid repeated database calls
// Using a more structured approach with a Map
class UserContextCache {
  private cache: Map<string, { data: UserContextData, timestamp: number }> = new Map();
  private readonly TTL: number = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  get(userId: string, organizationId: string): UserContextData | undefined {
    const cacheKey = this.generateKey(userId, organizationId);
    const entry = this.cache.get(cacheKey);
    
    if (!entry) return undefined;
    
    const now = Date.now();
    if (now - entry.timestamp < this.TTL) {
      return entry.data;
    }
    
    // Cache expired, remove it
    this.cache.delete(cacheKey);
    return undefined;
  }
  
  set(userId: string, organizationId: string, data: UserContextData): void {
    const cacheKey = this.generateKey(userId, organizationId);
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }
  
  clear(userId?: string, organizationId?: string): void {
    if (userId && organizationId) {
      const cacheKey = this.generateKey(userId, organizationId);
      this.cache.delete(cacheKey);
    } else {
      this.cache.clear();
    }
  }
  
  private generateKey(userId: string, organizationId: string): string {
    return `${userId}-${organizationId}`;
  }
}

// Create a singleton instance of the cache
const userContextCache = new UserContextCache();

/**
 * Validates user and organization IDs
 * @param userId The user ID to validate
 * @param organizationId The organization ID to validate
 * @throws UserContextError if validation fails
 */
function validateIds(userId?: string, organizationId?: string): void {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new UserContextError(
      "Invalid or missing user ID",
      UserContextErrorType.INVALID_PARAMS
    );
  }
  
  if (!organizationId || typeof organizationId !== 'string' || organizationId.trim() === '') {
    throw new UserContextError(
      "Invalid or missing organization ID",
      UserContextErrorType.INVALID_PARAMS
    );
  }
}

/**
 * Creates a Convex client with proper error handling
 * @returns A configured Convex HTTP client
 * @throws UserContextError if configuration is invalid
 */
function createConvexClient(): ConvexHttpClient {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new UserContextError(
      "NEXT_PUBLIC_CONVEX_URL is not defined in environment variables",
      UserContextErrorType.API_ERROR
    );
  }
  
  return new ConvexHttpClient(convexUrl);
}

/**
 * Retrieves user context data from Convex with improved security and performance
 * @param userId The user ID
 * @param organizationId The organization ID
 * @param options Configuration options
 * @returns The user context data
 * @throws UserContextError if retrieval fails
 */
export async function getUserContext(
  userId: string,
  organizationId: string,
  options: {
    useCache?: boolean;
    includeFileContent?: boolean;
    maxRetries?: number;
  } = {}
): Promise<UserContextData> {
  const {
    useCache = true,
    includeFileContent = false,
    maxRetries = 2
  } = options;
  
  // Validate parameters
  validateIds(userId, organizationId);
  
  // Check cache first if enabled
  if (useCache) {
    const cachedData = userContextCache.get(userId, organizationId);
    if (cachedData) {
      console.log("Using cached user context data");
      return cachedData;
    }
  }
  
  let retries = 0;
  
  while (retries <= maxRetries) {
    try {
      // Create Convex client
      const convexClient = createConvexClient();
      
      // Fetch user data and files in a single function to reduce code duplication
      const userData = await fetchUserDataFromConvex(convexClient, userId, organizationId);
      
      // Cache the result
      userContextCache.set(userId, organizationId, userData);
      
      return userData;
    } catch (error) {
      retries++;
      
      // If it's already a UserContextError, rethrow it on the last retry
      if (error instanceof UserContextError) {
        if (retries > maxRetries) throw error;
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries - 1)));
        continue;
      }
      
      // For other errors, convert to UserContextError
      console.error("Error fetching user context:", error);
      
      if (retries > maxRetries) {
        throw new UserContextError(
          `Failed to fetch user context after ${maxRetries} retries: ${(error as Error).message}`,
          UserContextErrorType.API_ERROR
        );
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries - 1)));
    }
  }
  
  // This should never be reached due to the throw in the loop, but TypeScript needs it
  throw new UserContextError(
    "Unexpected error in retry loop",
    UserContextErrorType.UNKNOWN_ERROR
  );
}

/**
 * Helper function to fetch user data from Convex
 * @param convexClient The Convex client
 * @param userId The user ID
 * @param organizationId The organization ID
 * @returns The user context data
 * @throws UserContextError if retrieval fails
 */
async function fetchUserDataFromConvex(
  convexClient: ConvexHttpClient,
  userId: string,
  organizationId: string
): Promise<UserContextData> {
  try {
    // Fetch user data
    console.log("Fetching user data from Convex for", { userId, organizationId });
    const userData = await convexClient.query(api.userData.getUserData, {
      userId,
      organizationId,
    });
    
    if (!userData) {
      throw new UserContextError(
        `No user data found for userId: ${userId}, organizationId: ${organizationId}`,
        UserContextErrorType.NOT_FOUND
      );
    }
    
    // Fetch user files
    console.log("Fetching user files from Convex");
    const userFiles = await convexClient.query(api.userData.getUserFiles, {
      userId,
      organizationId,
    });
    
    // Prepare user context with proper defaults and type safety
    const userContext: UserContextData = {
      userId: userData.userId,
      organizationId: userData.organizationId,
      companyName: userData.companyName || "",
      targetedAudience: userData.targetedAudience || "",
      companyShortTermGoals: userData.companyShortTermGoals || "",
      companyLongTermGoals: userData.companyLongTermGoals || "",
      companyAdditionalContext: userData.companyAdditionalContext || "",
      userFullName: userData.userFullName || "",
      userShortTermGoals: userData.userShortTermGoals || "",
      userLongTermGoals: userData.userLongTermGoals || "",
      userAdditionalContext: userData.userAdditionalContext || "",
      files: (userFiles || []).map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        storageId: file.storageId,
        uploadedAt: file.uploadedAt || Date.now(), // Ensure uploadedAt is always present
        metadata: file.metadata
      })),
    };
    
    return userContext;
  } catch (error) {
    // If it's already a UserContextError, rethrow it
    if (error instanceof UserContextError) {
      throw error;
    }
    
    // Otherwise, wrap it in a UserContextError
    throw new UserContextError(
      `Error fetching user data: ${(error as Error).message}`,
      UserContextErrorType.API_ERROR
    );
  }
}

/**
 * Fetches file content separately for security
 * @param userId The user ID
 * @param organizationId The organization ID
 * @param storageId The file storage ID
 * @returns The file content or null if not found/accessible
 * @throws UserContextError if retrieval fails
 */
export async function getFileContent(
  userId: string,
  organizationId: string,
  storageId: string
): Promise<FileContent | null> {
  // Validate parameters
  validateIds(userId, organizationId);
  
  if (!storageId || typeof storageId !== 'string' || storageId.trim() === '') {
    throw new UserContextError(
      "Invalid or missing storage ID",
      UserContextErrorType.INVALID_PARAMS
    );
  }
  
  try {
    // Verify file access first
    const hasAccess = await verifyFileAccess(userId, organizationId, storageId);
    
    if (!hasAccess) {
      console.warn(`User ${userId} does not have access to file ${storageId}`);
      return null;
    }
    
    // Create Convex client
    const convexClient = createConvexClient();
    
    // Since there's no direct getFileContent API, we need to get the file from the user's files
    // First, get the user's files
    const userFiles = await convexClient.query(api.userData.getUserFiles, {
      userId,
      organizationId,
    });
    
    // Find the specific file by storageId
    const fileData = userFiles?.find(file => file.storageId === storageId);
    
    if (!fileData || !fileData.content) {
      return null;
    }
    
    return {
      content: fileData.content,
      mimeType: fileData.type || 'text/plain',
      fileName: fileData.name || 'unknown'
    };
  } catch (error) {
    console.error("Error fetching file content:", error);
    
    throw new UserContextError(
      `Failed to fetch file content: ${(error as Error).message}`,
      UserContextErrorType.API_ERROR
    );
  }
}

/**
 * Optimizes the user context for token efficiency
 * @param userContext The user context data
 * @param maxTokens Maximum tokens to use (approximate)
 * @returns Optimized user context
 */
export function optimizeUserContext(
  userContext: UserContextData,
  maxTokens: number = 4000
): UserContextData {
  // Create a deep copy of the user context
  const optimizedContext: UserContextData = JSON.parse(JSON.stringify(userContext));
  
  // Simple token estimation
  const estimateTokens = (text: string): number => {
    return Math.ceil(text.length / 4); // Rough approximation
  };
  
  // Calculate total tokens
  let totalTokens = 0;
  
  // Add up tokens for text fields
  const textFields: (keyof UserContextData)[] = [
    'companyName',
    'targetedAudience',
    'companyShortTermGoals',
    'companyLongTermGoals',
    'companyAdditionalContext',
    'userFullName',
    'userShortTermGoals',
    'userLongTermGoals',
    'userAdditionalContext'
  ];
  
  for (const field of textFields) {
    totalTokens += estimateTokens(optimizedContext[field] as string || '');
  }
  
  // If already over the limit, truncate the longer fields
  if (totalTokens > maxTokens * 0.7) { // Leave 30% for files and other overhead
    // Fields to truncate in order of preference (least important first)
    const fieldsToTruncate = [
      'companyAdditionalContext',
      'userAdditionalContext',
      'companyLongTermGoals',
      'companyShortTermGoals',
      'userLongTermGoals',
      'userShortTermGoals',
      'targetedAudience'
    ];
    
    for (const field of fieldsToTruncate) {
      if (totalTokens <= maxTokens * 0.7) break;
      
      const fieldKey = field as keyof UserContextData;
      const currentText = optimizedContext[fieldKey] as string;
      
      if (currentText && currentText.length > 100) {
        const currentTokens = estimateTokens(currentText);
        const tokensToRemove = Math.min(
          currentTokens - 50,  // Keep at least 50 tokens
          totalTokens - maxTokens * 0.7
        );
        
        if (tokensToRemove > 0) {
          const charsToKeep = Math.max(100, currentText.length - (tokensToRemove * 4));
          const truncated = currentText.substring(0, charsToKeep) + "... [truncated]";
          
          (optimizedContext as any)[fieldKey] = truncated;
          totalTokens -= (currentTokens - estimateTokens(truncated));
        }
      }
    }
  }
  
  // Handle file list if needed
  if (optimizedContext.files.length > 0) {
    const fileTokensPerFile = 50; // Rough estimate per file
    const totalFileTokens = optimizedContext.files.length * fileTokensPerFile;
    
    // If file information would push us over the limit, reduce the number of files
    const remainingTokens = maxTokens - totalTokens;
    const maxFiles = Math.floor(remainingTokens / fileTokensPerFile);
    
    if (optimizedContext.files.length > maxFiles && maxFiles > 0) {
      // Keep only the most recently uploaded files
      optimizedContext.files = optimizedContext.files
        .sort((a, b) => (b.uploadedAt || 0) - (a.uploadedAt || 0))
        .slice(0, maxFiles);
    }
  }
  
  return optimizedContext;
}

/**
 * Clears the user context cache for a specific user or all users
 * @param userId Optional user ID to clear cache for specific user
 * @param organizationId Optional organization ID (used with userId)
 */
export function clearUserContextCache(userId?: string, organizationId?: string): void {
  userContextCache.clear(userId, organizationId);
}

/**
 * Verifies that a user has access to a particular file
 * @param userId The user ID
 * @param organizationId The organization ID
 * @param storageId The file storage ID
 * @returns Boolean indicating if the user has access
 */
export async function verifyFileAccess(
  userId: string,
  organizationId: string,
  storageId: string
): Promise<boolean> {
  try {
    // Get convex URL from environment
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      console.error("NEXT_PUBLIC_CONVEX_URL is not defined in environment variables");
      return false;
    }
    
    // Create a Convex client
    const convexClient = new ConvexHttpClient(convexUrl);
    
    // Verify file access
    const fileMetadata = await convexClient.query(api.userData.verifyFileAccess, {
      userId,
      organizationId,
      storageId,
    });
    
    return fileMetadata !== null;
  } catch (error) {
    console.error("Error verifying file access:", error);
    return false;
  }
}