import * as crypto from "crypto"

// Hash password with bcrypt-like algorithm (simple version for demo)
export function hashPassword(password: string): string {
  // In production, use bcryptjs: import bcrypt from 'bcryptjs'; await bcrypt.hash(password, 10)
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, hash: string): boolean {
  const [salt, storedHash] = hash.split(":")
  const hash2 = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
  return hash2 === storedHash
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex")
}
