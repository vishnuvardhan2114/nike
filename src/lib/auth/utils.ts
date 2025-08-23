import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { guests } from "@/lib/db/schema/guests";
import { eq, and, lt } from "drizzle-orm";

/**
 * Get the current guest session token from cookies
 */
export async function getGuestSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("guest_session")?.value || null;
}

/**
 * Check if a guest session is valid and not expired
 */
export async function isValidGuestSession(token: string): Promise<boolean> {
  try {
    const now = new Date();
    const guest = await db
      .select()
      .from(guests)
      .where(and(eq(guests.sessionToken, token), lt(guests.expiresAt, now)))
      .limit(1);

    return guest.length > 0;
  } catch (error) {
    console.error("Error checking guest session validity:", error);
    return false;
  }
}

/**
 * Clean up expired guest sessions
 */
export async function cleanupExpiredGuestSessions(): Promise<void> {
  try {
    const now = new Date();
    await db.delete(guests).where(lt(guests.expiresAt, now));
  } catch (error) {
    console.error("Error cleaning up expired guest sessions:", error);
  }
}

/**
 * Generate a secure random token for guest sessions
 */
export function generateSecureToken(): string {
  return crypto.randomUUID();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (password.length > 128) {
    errors.push("Password must be less than 128 characters");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove < and >
    .trim()
    .slice(0, 1000); // Limit length
}

/**
 * Create a safe error message for client consumption
 */
export function createSafeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Don't expose internal error messages in production
    if (process.env.NODE_ENV === "production") {
      return "An error occurred. Please try again.";
    }
    return error.message;
  }
  
  return "An unexpected error occurred";
}
