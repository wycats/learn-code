CREATE TABLE "user_progress" (
	"profile_id" text NOT NULL,
	"level_id" text NOT NULL,
	"status" text DEFAULT 'locked' NOT NULL,
	"stars" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_progress_profile_id_level_id_pk" PRIMARY KEY("profile_id","level_id")
);
--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;