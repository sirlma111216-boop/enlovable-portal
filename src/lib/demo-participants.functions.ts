import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  playerKey: z.string().min(1).max(100),
  classCode: z.string().min(1).max(40),
});

export const findDemoParticipant = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: row, error } = await supabaseAdmin
      .from("demo_participants")
      .select("id, class_code, nickname, created_at, updated_at")
      .eq("player_key", data.playerKey)
      .eq("class_code", data.classCode)
      .maybeSingle();
    if (error) throw error;
    return row;
  });
