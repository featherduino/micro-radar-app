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
      footer: {
        text: "Powered by Featherduino",
        link: "https://featherduino.in",
      },
    });

    // Add a small always-visible badge near the chat bubble for clearer attribution.
    let badgeEl;
    if (typeof document !== "undefined") {
      badgeEl = document.createElement("div");
      badgeEl.innerHTML =
        '<a href="https://featherduino.in" target="_blank" rel="noreferrer">Powered by Featherduino</a>';
      Object.assign(badgeEl.style, {
        position: "fixed",
        bottom: "22px",
        right: "96px",
        padding: "6px 10px",
        borderRadius: "10px",
        background: "#0f172a",
        color: "#e5e7eb",
        fontSize: "12px",
        fontFamily: "Inter, system-ui, sans-serif",
        boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
        zIndex: "9999",
      });
      badgeEl.querySelector("a").style.color = "#38bdf8";
      badgeEl.querySelector("a").style.textDecoration = "none";
      badgeEl.querySelector("a").onmouseover = () => {
        badgeEl.querySelector("a").style.textDecoration = "underline";
      };
      badgeEl.querySelector("a").onmouseout = () => {
        badgeEl.querySelector("a").style.textDecoration = "none";
      };
      document.body.appendChild(badgeEl);
    }

    return () => {
      if (chatInstance && typeof chatInstance.destroy === "function") {
        chatInstance.destroy();
      }
      if (badgeEl && badgeEl.parentNode) {
        badgeEl.parentNode.removeChild(badgeEl);
      }
    };
  }, [webhookUrl]);

  return null;
}
