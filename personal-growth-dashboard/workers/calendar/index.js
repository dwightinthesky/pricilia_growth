import ICAL from "ical.js";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function parseIcs(text, limit = 500) {
  const jcal = ICAL.parse(text);
  const comp = new ICAL.Component(jcal);
  const vevents = comp.getAllSubcomponents("vevent");

  const events = vevents.slice(0, limit).map((ev) => {
    const e = new ICAL.Event(ev);
    return {
      title: e.summary || "Untitled",
      start: e.startDate?.toString() || "",
      end: e.endDate?.toString() || "",
      location: e.location || "",
    };
  });

  return { count: vevents.length, events };
}

export default {
  async fetch(req) {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    const url = new URL(req.url);

    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: corsHeaders() });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      });
    }

    const icalUrl = body?.icalUrl;
    if (!icalUrl || typeof icalUrl !== "string") {
      return new Response(JSON.stringify({ error: "Missing icalUrl" }), {
        status: 400,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      });
    }

    try {
      const res = await fetch(icalUrl, {
        headers: { "User-Agent": "PriciliaCalendarWorker/1.0" },
      });

      if (!res.ok) {
        return new Response(JSON.stringify({ error: "Fetch failed", status: res.status }), {
          status: 400,
          headers: { ...corsHeaders(), "Content-Type": "application/json" },
        });
      }

      const text = await res.text();

      if (url.pathname === "/verify") {
        const parsed = parseIcs(text, 3);
        return new Response(
          JSON.stringify({
            ok: true,
            count: parsed.count,
            sampleEvents: parsed.events,
          }),
          { headers: { ...corsHeaders(), "Content-Type": "application/json" } }
        );
      }

      if (url.pathname === "/sync") {
        const parsed = parseIcs(text, 500);
        return new Response(
          JSON.stringify({
            ok: true,
            count: parsed.count,
            events: parsed.events,
          }),
          { headers: { ...corsHeaders(), "Content-Type": "application/json" } }
        );
      }

      return new Response("Not Found", { status: 404, headers: corsHeaders() });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e) }), {
        status: 500,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      });
    }
  },
};
