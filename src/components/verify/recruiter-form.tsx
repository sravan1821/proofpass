"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function RecruiterForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-[24px] border border-emerald-400/20 bg-emerald-400/8 p-5 text-sm leading-7 text-[color:var(--muted-foreground)]">
        <p className="font-semibold text-emerald-300">Lead captured for the demo flow.</p>
        <p className="mt-2">
          In the full PDF implementation this posts to `/api/recruiter-leads`, writes to Supabase, and optionally triggers follow-up email.
        </p>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <input
        className="w-full rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
        defaultValue="Nisha Verma"
        placeholder="Recruiter name"
      />
      <input
        className="w-full rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
        defaultValue="Vertex Labs"
        placeholder="Company"
      />
      <input
        className="w-full rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
        defaultValue="nisha@vertexlabs.example"
        placeholder="Email"
      />
      <textarea
        className="min-h-28 w-full rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
        defaultValue="Interested in the full stack engineer and product lead profiles for internship interviews."
        placeholder="Message"
      />
      <Button type="submit" className="w-full">
        Capture lead
      </Button>
    </form>
  );
}
