import { Phone, MessageCircle } from "lucide-react";
import { cafeSite } from "@/config/site";

export function CafeFloatingActions() {
  return (
    <div className="cafe-floating-actions" aria-label="Quick contact">
      <a
        className="cafe-floating-btn cafe-floating-call"
        href={cafeSite.phone.startsWith("[") ? "#visit" : `tel:${cafeSite.phone}`}
        aria-label="Call 7 Bites Cafe"
      >
        <Phone aria-hidden="true" />
      </a>
      <a
        className="cafe-floating-btn cafe-floating-wa"
        href={
          cafeSite.whatsapp.startsWith("[")
            ? "#visit"
            : `https://wa.me/${cafeSite.whatsapp.replace(/\D/g, "")}`
        }
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp 7 Bites Cafe"
      >
        <MessageCircle aria-hidden="true" />
      </a>
    </div>
  );
}
