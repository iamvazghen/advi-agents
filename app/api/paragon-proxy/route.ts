// app/api/paragon-proxy/route.ts
import { NextResponse } from "next/server";
import { sign } from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { userId, organizationId, endpoint, method = "GET", data = null } = body;

    if (!userId || !endpoint) {
      return NextResponse.json(
        { error: "userId and endpoint are required" },
        { status: 400 }
      );
    }

    // Get the Paragon project ID
    const projectId = process.env.PARAGON_PROJECT_ID || process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID;
    let signingKey = process.env.PARAGON_SIGNING_KEY;
    
    console.log("Using Paragon project ID:", projectId);

    if (!projectId || !signingKey) {
      console.error("Missing environment variables");
      return NextResponse.json(
        { error: "Missing environment variables" },
        { status: 500 }
      );
    }

    console.log("Proxy request received:", {
      userId,
      organizationId,
      endpoint,
      method,
      hasData: !!data
    });

    // Generate a token
    let token;
    let tokenSubject;
    
    try {
      // Validate the signing key format
      if (!signingKey.includes("PRIVATE KEY")) {
        // Try to reconstruct the PEM format
        signingKey = `-----BEGIN PRIVATE KEY-----\n${signingKey.match(/.{1,64}/g)?.join("\n")}\n-----END PRIVATE KEY-----`;
      }
      
      // Use the combined userId:organizationId format if organizationId is provided
      tokenSubject = organizationId ? `${userId}:${organizationId}` : userId;
      console.log("Using token subject:", tokenSubject);
      
      token = sign(
        {
          sub: tokenSubject,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
        },
        signingKey,
        { algorithm: "RS256" }
      );
      
      console.log("Generated JWT token (first 20 chars):", token.substring(0, 20) + "...");
    } catch (tokenError) {
      console.error("Error generating JWT token:", tokenError);
      return NextResponse.json({
        error: "Failed to generate authentication token",
        details: tokenError instanceof Error ? tokenError.message : "Unknown error"
      }, { status: 500 });
    }
    
    console.log("Generated JWT token (first 20 chars):", token.substring(0, 20) + "...");

    // Construct the URL
    let url = endpoint;
    
    // Handle different endpoint formats
    if (endpoint === "integrations") {
      // For integrations, use the specific format
      url = `https://api.useparagon.com/projects/${projectId}/integrations`;
      console.log("Using integrations URL:", url);
    } else if (endpoint.includes("actions")) {
      // For actions, use the actions endpoint
      url = `https://actions.useparagon.com/projects/${projectId}/actions`;
      console.log("Using actions URL:", url);
    } else if (endpoint.includes("projects") && !endpoint.includes(projectId)) {
      url = endpoint.replace("projects", `projects/${projectId}`);
    } else if (!endpoint.includes("projects")) {
      url = `https://api.useparagon.com/projects/${projectId}/${endpoint}`;
    }
    
    console.log("Making request to Paragon API:", {
      url,
      method,
      tokenSubject,
      hasData: !!data
    });

    // Validate the token before making the request
    if (!token || token.length < 50) {
      console.error("Generated token appears invalid:", token ? token.substring(0, 20) + "..." : "null");
      return NextResponse.json({
        error: "Failed to generate valid authentication token",
        details: "Token generation failed or produced an invalid token"
      }, { status: 500 });
    }

    try {
      // Make the request to Paragon
      // Add more detailed debugging for the request
      console.log("Paragon API request details:", {
        url,
        method,
        headers: {
          Authorization: `Bearer ${token.substring(0, 20)}...`, // Only log part of the token for security
          "Content-Type": "application/json",
        },
        body: data ? JSON.stringify(data).substring(0, 100) + "..." : "No body"
      });
      
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        ...(data && method !== "GET" ? { body: JSON.stringify(data) } : {}),
      });
      console.log("Paragon API response status:", response.status);
      
      // Get response headers for debugging
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.log("Paragon API response headers:", headers);
      
      // Return the response
      const responseData = await response.json();
      console.log("Paragon API response data:", JSON.stringify(responseData, null, 2));
      
      // If response is not OK, log more details
      if (!response.ok) {
        console.error("Paragon API error response:", {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
          url,
          method
        });
        
        // For 401 errors, provide more specific debugging information
        if (response.status === 401) {
          console.error("Authentication error with Paragon API. Check the following:");
          console.error("1. PARAGON_PROJECT_ID is correct:", projectId);
          console.error("2. PARAGON_SIGNING_KEY is valid (first 20 chars):",
                       signingKey ? signingKey.substring(0, 20) + "..." : "Missing");
          console.error("3. Token subject format is correct:", tokenSubject);
          console.error("4. JWT token (first 50 chars):", token.substring(0, 50) + "...");
          
          // Check if the token has the correct structure (header.payload.signature)
          const tokenParts = token.split('.');
          if (tokenParts.length !== 3) {
            console.error("JWT token has invalid format - should have 3 parts separated by dots");
          } else {
            try {
              // Try to decode the payload (middle part)
              const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
              console.error("Token payload:", JSON.stringify(payload));
            } catch (decodeError) {
              console.error("Failed to decode token payload:", decodeError);
            }
          }
          
          // Return a more helpful error message
          return NextResponse.json({
            error: "Authentication failed with Paragon API",
            message: "The request to Paragon API failed due to authentication issues. Please check your credentials.",
            details: responseData
          }, { status: 401 });
        }
      }
      
      return NextResponse.json(responseData, { status: response.status });
    } catch (fetchError) {
      console.error("Error fetching from Paragon API:", fetchError);
      
      const errorMessage = fetchError instanceof Error ? fetchError.message : "Unknown error";
      const errorStack = fetchError instanceof Error ? fetchError.stack : undefined;
      
      console.error("Fetch error details:", {
        message: errorMessage,
        stack: errorStack,
        url,
        method,
        hasData: !!data
      });
      
      return NextResponse.json(
        {
          error: "Error communicating with Paragon API",
          details: errorMessage,
          url,
          method,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Error in Paragon proxy:", error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error("Error details:", {
      message: errorMessage,
      stack: errorStack
    });
    
    return NextResponse.json(
      {
        error: "Internal server error",
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}