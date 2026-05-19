ALTER TABLE "feedback" ADD COLUMN "url" text;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "pack_id" text;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "level_id" text;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "context" text DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "profile_id" text;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;