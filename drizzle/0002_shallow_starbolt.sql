DROP INDEX "messages_conversation_created_idx";--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "position" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX "messages_conversation_created_idx" ON "messages" USING btree ("conversation_id","position");