ALTER TABLE "password_reset_tokens" ALTER COLUMN "expires_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "total_credits" SET DEFAULT 0;