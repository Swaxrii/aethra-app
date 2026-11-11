DROP INDEX "messages_conversation_created_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "messages_conversation_position_unique" ON "messages" USING btree ("conversation_id","position");--> statement-breakpoint
CREATE INDEX "rate_limits_reset_idx" ON "rate_limits" USING btree ("reset_at");--> statement-breakpoint
CREATE INDEX "sessions_expires_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_title_check" CHECK (char_length(btrim("conversations"."title")) between 1 and 300);--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_model_check" CHECK ("conversations"."model" in ('Aethra 1.0', 'Aethra 1.1'));--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_role_check" CHECK ("messages"."role" in ('user', 'ai'));--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_content_check" CHECK (char_length("messages"."content") between 1 and 10000);--> statement-breakpoint
ALTER TABLE "preferences" ADD CONSTRAINT "preferences_model_check" CHECK ("preferences"."model" in ('Aethra 1.0', 'Aethra 1.1'));--> statement-breakpoint
ALTER TABLE "preferences" ADD CONSTRAINT "preferences_temperature_check" CHECK ("preferences"."temperature" between 0 and 2);--> statement-breakpoint
ALTER TABLE "preferences" ADD CONSTRAINT "preferences_response_length_check" CHECK ("preferences"."response_length" in ('Short', 'Balanced', 'Detailed'));--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_status_check" CHECK ("users"."status" in ('active', 'disabled'));