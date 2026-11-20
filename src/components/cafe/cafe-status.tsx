import { useEffect, useState } from "react";
import { cafeSite } from "@/config/site";

function parseTime(value: string) {
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

export function CafeOpenStatus() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(id);
  }, []);

  const open = parseTime(cafeSite.openTime);
  const close = parseTime(cafeSite.closeTime);
  if (open === null || close === null) {
    return <span className="cafe-open-status is-unknown">Hours to be added</span>;
  }
  if (!now) return null;
  const minutes = now.getHours() * 60 + now.getMinutes();
  const isOpen =
    close > open ? minutes >= open && minutes < close : minutes >= open || minutes < close;
  return (
    <span className={`cafe-open-status ${isOpen ? "is-open" : "is-closed"}`}>
      {isOpen ? "Open now" : "Closed"}
    </span>
  );
}
