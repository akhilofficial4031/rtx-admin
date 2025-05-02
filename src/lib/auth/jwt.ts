import { createHash, createHmac } from "crypto";

// Secret key for JWT - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  exp?: number;
}

export function createToken(payload: JwtPayload): string {
  // Set expiration (7 days from now)
  const expiresIn = 7 * 24 * 60 * 60; // 7 days in seconds
  const now = Math.floor(Date.now() / 1000);

  const tokenPayload = {
    ...payload,
    exp: now + expiresIn,
  };

  // Convert payload to base64
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" })
  ).toString("base64");
  const payload64 = Buffer.from(JSON.stringify(tokenPayload)).toString(
    "base64"
  );

  // Create signature
  const signature = createHmac("sha256", JWT_SECRET)
    .update(`${header}.${payload64}`)
    .digest("base64");

  // Combine to form JWT
  return `${header}.${payload64}.${signature}`;
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const [header, payload, signature] = token.split(".");

    // Verify signature
    const expectedSignature = createHmac("sha256", JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest("base64");

    if (signature !== expectedSignature) {
      return null;
    }

    // Decode payload
    const decodedPayload = JSON.parse(
      Buffer.from(payload, "base64").toString()
    ) as JwtPayload;

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (decodedPayload.exp && decodedPayload.exp < now) {
      return null; // Token expired
    }

    return decodedPayload;
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}
