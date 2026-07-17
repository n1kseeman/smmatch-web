"use client";

import { useEffect } from "react";

import { createClient } from "@/shared/api/supabase/client";
import type { Database } from "@/shared/types/database.generated";

type Message = Database["public"]["Tables"]["messages"]["Row"];

export function useMessagesChannel(
  conversationId: string | null,
  onMessage: (message: Message) => void,
) {
  useEffect(() => {
    if (!conversationId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => onMessage(payload.new as Message),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, onMessage]);
}
