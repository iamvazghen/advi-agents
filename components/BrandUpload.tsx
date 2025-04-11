"use client";

import React, { useState, ChangeEvent, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useUser, useOrganization } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "./ui/use-toast";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { X, UploadCloud } from "lucide-react"; // Added UploadCloud
import { useParams } from "next/navigation";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function Brand() {
  const { user } = useUser();
  const { organization } = useOrganization();
  const params = useParams();
  const organizationId = params.orgId as string;
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Text field states
  const [companyName, setCompanyName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [targetedAudience, setTargetedAudience] = useState("");
  const [companyShortTermGoals, setCompanyShortTermGoals] = useState("");
  const [companyLongTermGoals, setCompanyLongTermGoals] = useState("");
  const [companyAdditionalContext, setCompanyAdditionalContext] = useState("");
  const [userShortTermGoals, setUserShortTermGoals] = useState("");
  const [userLongTermGoals, setUserLongTermGoals] = useState("");
  const [userAdditionalContext, setUserAdditionalContext] = useState("");
  const [userFullName, setUserFullName] = useState("");

  // File handling states
  const [filesToRemove, setFilesToRemove] = useState<string[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [lastRemovedFile, setLastRemovedFile] = useState<{ id: string; name: string } | null>(null);
  const [isUndoVisible, setIsUndoVisible] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false); // State for drag-over effect

  const hideUndoButton = useCallback(() => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsUndoVisible(false);
      setLastRemovedFile(null);
      setIsAnimatingOut(false);
    }, 300);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isUndoVisible) {
      timeout = setTimeout(() => {
        hideUndoButton();
      }, 3000);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isUndoVisible, hideUndoButton]);

  const userData = useQuery(
    api.userData.getUserData,
    user && organizationId ? { userId: user.id, organizationId } : "skip"
  );

  const files = useQuery(
    api.userData.getUserFiles,
    user ? { userId: user.id, organizationId } : "skip"
  );

  const upsertUserData = useMutation(api.userData.upsertUserData);
  const addFile = useMutation(api.userData.addFile);
  const removeFile = useMutation(api.userData.removeFile);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (userData) {
      setCompanyName(userData.companyName || "");
      setTargetedAudience(userData.targetedAudience || "");
      setCompanyShortTermGoals(userData.companyShortTermGoals || "");
      setCompanyLongTermGoals(userData.companyLongTermGoals || "");
      setCompanyAdditionalContext(userData.companyAdditionalContext || "");
      setUserShortTermGoals(userData.userShortTermGoals || "");
      setUserLongTermGoals(userData.userLongTermGoals || "");
      setUserAdditionalContext(userData.userAdditionalContext || "");
      setUserFullName(userData.userFullName || "");
    }
  }, [userData]);

  const ensureUserDataExists = async () => {
    if (!user) return;

    if (!userData) {
      await upsertUserData({
        userId: user.id,
        organizationId,
        companyName: companyName || "Company Name",
        targetedAudience: targetedAudience || "",
        companyShortTermGoals: companyShortTermGoals || "",
        companyLongTermGoals: companyLongTermGoals || "",
        companyAdditionalContext: companyAdditionalContext || "",
        userShortTermGoals: userShortTermGoals || "",
        userLongTermGoals: userLongTermGoals || "",
        userAdditionalContext: userAdditionalContext || "",
        userFullName: userFullName || "",
      });
    }
  };

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const inputElement = document.getElementById('file-upload') as HTMLInputElement;
      if (inputElement) {
        inputElement.files = files;
        // Create and dispatch a change event
        const event = new Event('change', { bubbles: true });
        inputElement.dispatchEvent(event);
      }
      e.dataTransfer.clearData();
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;

    setIsUploading(true);
    await ensureUserDataExists();

    try {
      for (const file of Array.from(e.target.files)) {
        try {
          // Define allowed file types
          const allowedTypes = [
            "application/pdf",                 // PDF
            "text/plain",                      // TXT
            "application/msword",              // DOC
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
            "application/vnd.ms-excel",        // XLS
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
            "application/vnd.ms-powerpoint",   // PPT
            "application/vnd.openxmlformats-officedocument.presentationml.presentation", // PPTX
            "text/csv",                        // CSV
            "application/json",                // JSON
            "text/markdown",                   // MD
          ];

          if (!allowedTypes.includes(file.type)) {
            toast({
              title: "Invalid File Type",
              description: "Supported file types: PDF, TXT, DOC, DOCX, XLS, XLSX, PPT, PPTX, CSV, JSON, MD",
              variant: "destructive",
              duration: 3000,
            });
            continue;
          }

          // Check file size to estimate token count before uploading
          // A rough estimate is 1 byte ≈ 0.25 tokens or 4 bytes ≈ 1 token
          const estimatedTokens = Math.ceil(file.size / 4);
          const MAX_TOKEN_LIMIT = 200000;

          if (estimatedTokens > MAX_TOKEN_LIMIT) {
            toast({
              title: "File Too Large",
              description: `${file.name} exceeds the maximum token limit (${estimatedTokens.toLocaleString()} tokens > ${MAX_TOKEN_LIMIT.toLocaleString()} tokens). Please upload a smaller file.`,
              variant: "destructive",
              duration: 5000,
            });
            continue;
          }

          const timestamp = Date.now();
          const storageId = `file-${timestamp}-${file.name}`;

          // Show uploading toast
          toast({
            title: "Processing File",
            description: `Extracting text from ${file.name}...`,
            duration: 5000,
          });

          const formData = new FormData();
          formData.append("file", file);

          console.log("Uploading file:", file.name, "to /api/upload");

          // Use the absolute URL to ensure correct routing
          const uploadUrl = new URL("/api/upload", window.location.origin).toString();
          console.log("Uploading to URL:", uploadUrl);

          const uploadResponse = await fetch(uploadUrl, {
            method: "POST",
            body: formData,
            headers: {
              // Don't set Content-Type header when using FormData
              // The browser will automatically set it with the correct boundary
            },
          });

          if (!uploadResponse.ok) {
            console.error("Upload response not OK:", uploadResponse.status, uploadResponse.statusText);
            // Try to get more detailed error information
            let errorMessage = `Upload failed: ${uploadResponse.statusText}`;
            try {
              const errorData = await uploadResponse.text();
              console.error("Error response body:", errorData);
              errorMessage = `Upload failed: ${uploadResponse.statusText}. Details: ${errorData}`;
            } catch (e) {
              console.error("Could not parse error response:", e);
            }
            throw new Error(errorMessage);
          }

          const responseData = await uploadResponse.json();
          console.log("Upload response data:", responseData);

          if (!responseData.success) {
            throw new Error(responseData.error || "Failed to process file");
          }

          // Add the file to the database with the extracted content
          await addFile({
            userId: user.id,
            organizationId,
            file: {
              name: file.name,
              type: file.type,
              size: file.size,
              storageId,
              content: responseData.content || `No text content could be extracted from ${file.name}`,
              metadata: {
                title: responseData.metadata?.title || file.name,
                author: responseData.metadata?.author,
                subject: responseData.metadata?.subject,
                keywords: responseData.metadata?.keywords,
                creator: responseData.metadata?.creator,
                producer: responseData.metadata?.producer,
                creationDate: responseData.metadata?.creationDate,
                modificationDate: responseData.metadata?.modificationDate,
                pageCount: responseData.metadata?.pageCount,
                version: responseData.metadata?.version,
                // Use type assertion to include additional properties
                ...(responseData.metadata || {}),
              },
            },
          });

          // Check if the file was truncated due to token limitations
          if (responseData.metadata && 'truncated' in responseData.metadata && responseData.metadata.truncated) {
            const originalCount = responseData.metadata && 'originalTokenCount' in responseData.metadata ?
              responseData.metadata.originalTokenCount : 'unknown';

            toast({
              title: "File Uploaded with Limitations",
              description: `${file.name} was uploaded but its content was truncated due to token limitations. Original size: ~${typeof originalCount === 'number' ? originalCount.toLocaleString() : originalCount} tokens, limit: 200,000 tokens.`,
              duration: 5000,
              variant: "destructive",
            });
          } else {
            toast({
              title: "File Uploaded",
              description: `${file.name} has been uploaded and text extraction completed.`,
              duration: 3000,
              variant: "success",
            });
          }
        } catch (error) {
          console.error("Upload error:", error);
          toast({
            title: "Upload Failed",
            description:
              error instanceof Error
                ? error.message
                : `Failed to upload ${file.name}. Please try again.`,
            variant: "destructive",
            duration: 3000,
          });
        }
      }
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await upsertUserData({
        userId: user.id,
        organizationId,
        companyName,
        targetedAudience,
        companyShortTermGoals,
        companyLongTermGoals,
        companyAdditionalContext,
        userShortTermGoals,
        userLongTermGoals,
        userAdditionalContext,
        userFullName,
      });

      for (const storageId of filesToRemove) {
        await removeFile({
          userId: user.id,
          organizationId,
          storageId,
        });
      }

      setFilesToRemove([]);

      toast({
        title: "Changes Saved",
        description: "Your brand information and file changes have been updated successfully.",
        duration: 3000,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleRemoveFile = (file: { storageId: string; name: string }) => {
    setFilesToRemove((prev) => [...prev, file.storageId]);
    setLastRemovedFile({ id: file.storageId, name: file.name });
    setIsUndoVisible(true);
  };

  const handleUndo = () => {
    if (lastRemovedFile) {
      setFilesToRemove((prev) => prev.filter((id) => id !== lastRemovedFile.id));
      hideUndoButton();
    }
  };

  if (
    userData === undefined ||
    files === undefined ||
    isInitialLoading ||
    !user ||
    !organizationId
  ) {
    return (
      <div className={cn(
        "h-full w-full p-6",
        isDark ? "bg-gray-900" : "bg-gray-50"
      )}>
        <div className="max-w-2xl mx-auto">
          <h1 className={cn(
            "text-2xl font-semibold mb-6",
            isDark ? "text-white" : "text-gray-900"
          )}>Files Database</h1>
          <div className="flex justify-start animate-in fade-in-0">
            <div className={cn(
              "rounded-2xl px-4 py-3 shadow-sm ring-1 ring-inset",
              isDark ? "bg-gray-800 text-purple-300 ring-purple-700" : "bg-white text-purple-900 ring-purple-200"
            )}>
              <div className="flex items-center gap-1.5">
                <p>Loading your private information</p>
                {[0.3, 0.15, 0].map((delay, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full animate-bounce",
                      isDark ? "bg-purple-500" : "bg-purple-400"
                    )}
                    style={{ animationDelay: `-${delay}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "w-full h-full p-6", // Added h-full here
      isDark ? "bg-gray-900" : "bg-gray-50"
    )}>
      <div className="max-w-4xl mx-auto">
        <h2 className={cn(
          "text-2xl font-semibold mb-6",
          isDark ? "text-white" : "text-gray-900"
        )}>Files Database</h2>
        <p className={cn(
          "mb-8",
          isDark ? "text-gray-300" : "text-gray-600"
        )}>
          Provide your company details and upload reference files to tailor AI responses.
          <span className={cn(
            "ml-2 font-medium",
            isDark ? "text-purple-400" : "text-purple-600"
          )}>
            Organization: {organization?.name || "Loading..."}
          </span>
        </p>
        <div className={cn(
          "p-4 rounded-md mb-6 border",
          isDark ? "bg-purple-900/20 border-purple-700" : "bg-purple-50 border-purple-200"
        )}>
          <h4 className={cn(
            "font-medium mb-1",
            isDark ? "text-purple-400" : "text-purple-700"
          )}>Setup Note</h4>
          <p className={cn(
            "text-sm",
            isDark ? "text-purple-300" : "text-purple-600"
          )}>
            Upload relevant documents like brand guidelines, product descriptions, or marketing materials.
            These files will be accessible to the AI agents, allowing them to provide more accurate and
            context-aware responses tailored to your organization.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">

            {/* File Upload Section - Updated with Drag and Drop */}
            <div>
              <label className={cn(
                "block text-sm font-medium mb-1",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>
                Upload Files
              </label>
              <div className="mt-1">
                <label
                  htmlFor="file-upload"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-32 px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                    isDark ? "border-gray-600 hover:border-gray-500" : "border-gray-300 hover:border-gray-400",
                    isDragging ? (isDark ? "bg-gray-700/50 border-purple-500" : "bg-gray-100/50 border-purple-500") : (isDark ? "bg-gray-800/30" : "bg-white/30")
                  )}
                >
                  <UploadCloud className={cn("w-8 h-8 mb-3", isDark ? "text-gray-400" : "text-gray-500")} />
                  <p className={cn("mb-2 text-sm", isDark ? "text-gray-400" : "text-gray-500")}>
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-400")}>
                    PDF, TXT, DOC(X), XLS(X), PPT(X), CSV, JSON, MD (Max 200k tokens)
                  </p>
                  <input
                    id="file-upload" // ID is used by handleDrop
                    type="file"
                    multiple
                    accept=".pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.json,.md"
                    className="sr-only"
                    onChange={handleFileUpload} // Keep original handler
                  />
                </label>
              </div>
            </div>
          </div>

          {files && files.length > 0 && (
            <div className={cn(
              "mt-6 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition-shadow",
              isDark ? "bg-gray-800/50" : "bg-white/50"
            )}>
              <div className="overflow-x-auto max-h-[350px]">
                <table className={cn(
                  "w-full divide-y",
                  isDark ? "divide-gray-700" : "divide-gray-200"
                )}>
                  <thead className={cn(
                    "sticky top-0",
                    isDark ? "bg-gray-800" : "bg-white"
                  )}>
                    <tr>
                      <th className={cn(
                        "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors",
                        isDark ? "text-purple-400" : "text-purple-700"
                      )}>
                        File Name
                      </th>
                      <th className={cn(
                        "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors",
                        isDark ? "text-purple-400" : "text-purple-700"
                      )}>
                        Size
                      </th>
                      <th className={cn(
                        "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors",
                        isDark ? "text-purple-400" : "text-purple-700"
                      )}>
                        Type
                      </th>
                      <th className={cn(
                        "px-6 py-3 text-right text-xs font-medium uppercase tracking-wider transition-colors",
                        isDark ? "text-purple-400" : "text-purple-700"
                      )}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className={cn(
                    "divide-y",
                    isDark ? "bg-gray-800/30 divide-gray-700" : "bg-white divide-gray-200"
                  )}>
                    {files.map((file) => {
                      const isMarkedForRemoval = filesToRemove.includes(file.storageId);
                      return (
                        <tr
                          key={file.storageId}
                          className={cn(
                            isMarkedForRemoval && "opacity-50",
                            isDark ? "bg-gray-800/50" : "bg-gray-50"
                          )}
                        >
                          <td className={cn(
                            "px-6 py-4 whitespace-nowrap text-sm",
                            isDark ? "text-gray-200" : "text-gray-900"
                          )}>
                            <span title={file.name}>
                              {file.name.length > 20
                                ? `${file.name.substring(0, 30)}...`
                                : file.name}
                            </span>
                          </td>
                          <td className={cn(
                            "px-6 py-4 whitespace-nowrap text-sm",
                            isDark ? "text-gray-400" : "text-gray-500"
                          )}>
                            {(file.size / 1024).toFixed(2)} KB
                          </td>
                          <td className={cn(
                            "px-6 py-4 whitespace-nowrap text-sm",
                            isDark ? "text-gray-400" : "text-gray-500"
                          )}>
                            {file.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {!isMarkedForRemoval && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveFile(file)}
                                className={cn(
                                  isDark ? "text-gray-400" : "text-gray-500"
                                )}
                              >
                                Remove
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-6">
            <Button
              type="submit"
              className={cn(
                "w-full sm:w-auto text-white shadow-sm hover:shadow-md transition-colors duration-300",
                isDark ? "bg-purple-600 hover:bg-purple-700" : "bg-purple-600 hover:bg-purple-700"
              )}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {(isUndoVisible || isAnimatingOut) && lastRemovedFile && (
        <button
          onClick={handleUndo}
          className={`fixed bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg shadow-lg transition-opacity z-50 ${
            isAnimatingOut ? "opacity-0" : "opacity-100"
          }`}
        >
          <X className="h-4 w-4" />
          Undo remove
        </button>
      )}
    </div>
  );
}