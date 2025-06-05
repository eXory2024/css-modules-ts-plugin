import crypto from "node:crypto"

export function sha256Sync(str: string): string {
	return crypto.createHash("sha256").update(str).digest("hex")
}
