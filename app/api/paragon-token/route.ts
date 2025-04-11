// app/api/paragon-token/route.ts
import { NextResponse } from "next/server";
import { sign } from "jsonwebtoken";

export async function GET(request: Request) {
  try {
    console.log("API route hit with request:", request.url);

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    console.log("Received userId:", userId);

    if (!userId) {
      console.log("No userId provided");
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Check for both PARAGON_PROJECT_ID and NEXT_PUBLIC_PARAGON_PROJECT_ID
    const projectId = process.env.PARAGON_PROJECT_ID || process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID;
    let signingKey = process.env.PARAGON_SIGNING_KEY;
    
    console.log("Project ID:", projectId ? projectId.substring(0, 8) + "..." : "missing");
    console.log("Signing Key length:", signingKey ? signingKey.length : 0);
    console.log("Signing Key first 20 chars:", signingKey ? signingKey.substring(0, 20) + "..." : "missing");
    console.log("Signing Key format check:", signingKey ? (signingKey.includes("PRIVATE KEY") ? "contains PRIVATE KEY" : "missing PRIVATE KEY") : "no key");

    if (!projectId || !signingKey) {
      console.error("Missing environment variables for Paragon token generation");
      console.error("PARAGON_PROJECT_ID:", projectId ? "present" : "missing");
      console.error("PARAGON_SIGNING_KEY:", signingKey ? "present" : "missing");
      return NextResponse.json({
        error: "Missing environment variables",
        details: {
          missingProjectId: !projectId,
          missingSigningKey: !signingKey
        }
      }, { status: 500 });
    }
    
    // Validate the signing key format
    if (signingKey && !signingKey.includes("PRIVATE KEY") && signingKey.length > 100) {
      console.log("Signing key doesn't contain PRIVATE KEY marker, attempting to format as PEM");
    } else if (signingKey.length < 100) {
      console.error("Signing key appears to be too short to be valid");
      return NextResponse.json({
        error: "Invalid signing key",
        details: "The signing key is too short to be a valid private key"
      }, { status: 500 });
    }

    try {
      // 1. Clean the key: remove markers and whitespace/newlines
      const cleanedKey = signingKey
        .replace(/-----BEGIN PRIVATE KEY-----/g, "")
        .replace(/-----END PRIVATE KEY-----/g, "")
        .replace(/\s+/g, ""); // Remove all whitespace and newline characters

      console.log("Cleaned Key length:", cleanedKey.length);
      console.log("Cleaned Key first 20 chars:", cleanedKey.substring(0, 20) + "...");

      // 2. Always reconstruct the PEM format
      const pemKey = `-----BEGIN PRIVATE KEY-----\n${cleanedKey.match(/.{1,64}/g)?.join("\n")}\n-----END PRIVATE KEY-----`;
      console.log("Reconstructed PEM Key (first 50 chars):", pemKey.substring(0, 50) + "...");
      
      // Add more detailed logging for the token payload
      const payload = {
        sub: userId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      console.log("Token payload:", JSON.stringify(payload));
      
      const token = sign(
        payload,
        pemKey, // Use the reconstructed PEM key
        { algorithm: "RS256" }
      );
      console.log("Token generated successfully (first 20 chars):", token.substring(0, 20) + "...");
      
      // Validate the token format
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error("Generated token has invalid format - should have 3 parts separated by dots");
        return NextResponse.json({
          error: "Invalid token format",
          details: "The generated token does not have the expected JWT format"
        }, { status: 500 });
      }
      
      // Try to decode the payload for validation
      try {
        const decodedPayload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        console.log("Token payload successfully decoded:", JSON.stringify(decodedPayload));
      } catch (decodeError) {
        console.error("Failed to decode token payload:", decodeError);
        // Continue anyway as the token might still be valid
      }
      
      return NextResponse.json({ token });
    } catch (signError) {
      console.error("Error signing JWT token:", signError);
      
      // Provide more detailed error information
      const errorMessage = signError instanceof Error ? signError.message : "Unknown error";
      const errorStack = signError instanceof Error ? signError.stack : undefined;
      
      console.error("JWT signing error details:", {
        message: errorMessage,
        stack: errorStack
      });
      
      return NextResponse.json({
        error: "Failed to generate Paragon token",
        details: errorMessage
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error generating Paragon token:", error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error("Error details:", {
      message: errorMessage,
      stack: errorStack
    });
    
    return NextResponse.json({ 
      error: "Internal server error", 
      details: errorMessage 
    }, { status: 500 });
  }
}