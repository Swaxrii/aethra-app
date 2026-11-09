ALTER TABLE "conversations" ADD COLUMN "legacy_id" varchar(120);--> statement-breakpoint
CREATE UNIQUE INDEX "conversations_user_legacy_unique" ON "conversations" USING btree ("user_id","legacy_id");