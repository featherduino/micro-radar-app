import { useEffect } from "react";
import "@n8n/chat/style.css";
import { createChat } from "@n8n/chat";

export default function N8nChatWidget({ webhookUrl }) {
  useEffect(() => {
    if (!webhookUrl) return undefined;

    const chatInstance = createChat({
      webhookUrl,
      mode: "window",
      showWelcomeScreen: true,
      metadata: {
        source: "macro-radar-dashboard",
      },
    });

    return () => {
      if (chatInstance && typeof chatInstance.destroy === "function") {
        chatInstance.destroy();
      }
    };
  }, [webhookUrl]);

  return null;
}
