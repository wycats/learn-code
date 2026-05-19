ALTER TABLE "feedback" ADD COLUMN IF NOT EXISTS "url" text;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN IF NOT EXISTS "pack_id" text;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN IF NOT EXISTS "level_id" text;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN IF NOT EXISTS "context" text DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN IF NOT EXISTS "user_id" text;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN IF NOT EXISTS "profile_id" text;--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'feedback_user_id_users_id_fk'
	) THEN
		ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
	END IF;
END $$;--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'feedback_profile_id_profiles_id_fk'
	) THEN
		ALTER TABLE "feedback" ADD CONSTRAINT "feedback_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
	END IF;
END $$;