// lib/tokenManagement.ts
import type { UserContextData } from "./getUserContext";

/**
 * Manages token usage by truncating file information if needed to stay within token limits
 * 
 * @param userContext The user context data
 * @param maxUserContextTokens The maximum number of tokens to allocate for user context
 * @returns A potentially modified user context with truncated information
 */
export function optimizeUserContextTokens(
  userContext: UserContextData,
  maxUserContextTokens: number = 4000 // Adjust based on your needs
): UserContextData {
  // Create a deep copy of the user context
  const optimizedContext: UserContextData = JSON.parse(JSON.stringify(userContext));
  
  // Simple token estimation (very approximate)
  // A better approach would be to use a proper tokenizer
  const estimateTokens = (text: string): number => {
    return Math.ceil(text.length / 4); // Rough approximation
  };
  
  // Estimate tokens for each part of the context
  let estimatedTokens = 0;
  
  // Company information
  estimatedTokens += estimateTokens(optimizedContext.companyName || "");
  estimatedTokens += estimateTokens(optimizedContext.targetedAudience || "");
  estimatedTokens += estimateTokens(optimizedContext.companyShortTermGoals || "");
  estimatedTokens += estimateTokens(optimizedContext.companyLongTermGoals || "");
  estimatedTokens += estimateTokens(optimizedContext.companyAdditionalContext || "");
  
  // User information
  estimatedTokens += estimateTokens(optimizedContext.userFullName || "");
  estimatedTokens += estimateTokens(optimizedContext.userShortTermGoals || "");
  estimatedTokens += estimateTokens(optimizedContext.userLongTermGoals || "");
  estimatedTokens += estimateTokens(optimizedContext.userAdditionalContext || "");
  
  // If already over the limit, truncate the longer fields
  if (estimatedTokens > maxUserContextTokens) {
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
      if (estimatedTokens <= maxUserContextTokens) break;
      
      if (optimizedContext[field as keyof UserContextData]) {
        const currentField = optimizedContext[field as keyof UserContextData] as string;
        const currentTokens = estimateTokens(currentField);
        
        if (currentTokens > 100) {
          const tokensToKeep = Math.max(50, currentTokens - (estimatedTokens - maxUserContextTokens));
          const charsToKeep = tokensToKeep * 4;
          const truncated = currentField.substring(0, charsToKeep) + "... [truncated]";
          
          // Update the context and token estimate
          (optimizedContext as any)[field] = truncated;
          estimatedTokens -= (currentTokens - estimateTokens(truncated));
        }
      }
    }
  }
  
  // Calculate tokens for files information
  let filesTokens = 0;
  if (optimizedContext.files) {
    for (const file of optimizedContext.files) {
      filesTokens += estimateTokens(file.name) + 
                     estimateTokens(file.type) + 
                     estimateTokens(file.storageId) +
                     50; // Extra tokens for formatting, etc.
    }
  }
  
  // If files information exceeds remaining token budget, limit the number of files
  const remainingTokens = maxUserContextTokens - (estimatedTokens - filesTokens);
  if (filesTokens > remainingTokens && optimizedContext.files.length > 0) {
    // Calculate how many files we can include
    let totalFileTokens = 0;
    let fileLimit = 0;
    
    for (const file of optimizedContext.files) {
      const fileTokens = estimateTokens(file.name) + 
                        estimateTokens(file.type) + 
                        estimateTokens(file.storageId) +
                        50;
      
      if (totalFileTokens + fileTokens <= remainingTokens) {
        totalFileTokens += fileTokens;
        fileLimit++;
      } else {
        break;
      }
    }
    
    // Truncate the files list if needed
    if (fileLimit < optimizedContext.files.length) {
      optimizedContext.files = optimizedContext.files.slice(0, fileLimit);
      
      // Add a note about truncated files
      if (fileLimit > 0) {
        // Add a dummy "file" with information about truncation
        optimizedContext.files.push({
          name: `[${optimizedContext.files.length - fileLimit} more files not shown due to token limitations]`,
          type: "text/plain",
          size: 0,
          storageId: "not-a-real-file", // This won't be used, just for display
          uploadedAt: Date.now(), // Add the required uploadedAt property
        });
      }
    }
  }
  
  return optimizedContext;
}

/**
 * Gets a truncated version of the file content for inclusion in context
 * @param content The full file content
 * @param maxTokens Maximum tokens to allocate for the content
 * @returns Truncated content
 */
export function getTruncatedFileContent(content: string, maxTokens: number = 1000): string {
  // Simple token estimation
  const estimateTokens = (text: string): number => {
    return Math.ceil(text.length / 4);
  };
  
  const contentTokens = estimateTokens(content);
  
  if (contentTokens <= maxTokens) {
    return content;
  }
  
  // Truncate content to fit within token limit
  const charsToKeep = maxTokens * 4;
  return content.substring(0, charsToKeep) + `\n\n[Content truncated due to length - ${contentTokens - maxTokens} tokens not shown]`;
}

/**
 * Calculates the total estimated tokens for a given string
 * @param text The text to estimate
 * @returns Estimated token count
 */
export function estimateTokenCount(text: string): number {
  // This is a simple approximation - for production use, consider a proper tokenizer
  return Math.ceil(text.length / 4);
}