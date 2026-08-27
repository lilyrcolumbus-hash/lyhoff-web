"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Note } from "./ui";

type Status = { running: boolean; conclusion: string | null; url: string | null };

/**
 * Publishing is a rebuild, so it takes a minute or two. Showing that plainly —
 * and polling until it finishes — is the difference between a button that
 * inspires confidence and one that seems to do nothing.
 */
export function PublishBar() {
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const timer = useRef<number | null>(null);

  const check = useCallback(async () => {
    const res = await fetch("/api/admin/publish", { credentials: "same-origin" }).catch(() => null);
    if (!res?.ok) {
      // 503 means no GitHub token is configured yet — the bar says so rather
      // than showing a button that will fail.
      if (res?.status === 503) setError("not_configured");
      return;
    }
    const data = (await res.json()) as Status;
    setStatus(data);
    return data;
  }, []);

  useEffect(() => {
    void check();
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [check]);

  // Poll only while something is actually building.
  useEffect(() => {
    if (!status?.running) {
      if (timer.current) window.clearInterval(timer.current);
      timer.current = null;
      return;
    }
    timer.current = window.setInterval(() => void check(), 8000);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [status?.running, check]);

  async function publish() {
    if (busy) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/publish", {
      method: "POST",
      credentials: "same-origin",
    }).catch(() => null);
    if (!res?.ok) {
      setError(res?.status === 503 ? "not_configured" : "failed");
      setBusy(false);
      return;
    }
    // The run takes a moment to appear in GitHub's API.
    setStatus({ running: true, conclusion: null, url: null });
    window.setTimeout(() => void check(), 3000);
    setBusy(false);
  }

  if (error === "not_configured") {
    return (
      <div className="mb-4 border border-stone-300 bg-white px-4 py-3">
        <p className="text-[13px] font-semibold text-forest-950">Publishing isn&apos;t connected yet</p>
        <Note>
          Saving records your changes, but the site is rebuilt by GitHub Actions and that needs two
          tokens set up once. Until then, ask and the site gets deployed by hand.
        </Note>
      </div>
    );
  }

  const running = status?.running ?? false;
  const failed = status?.conclusion === "failure";

  return (
    <div
      className={`mb-4 flex flex-wrap items-center gap-3 border px-4 py-3 ${
        failed ? "border-clay-600 bg-clay-50" : "border-earth-500 bg-earth-50"
      }`}
    >
      <span className="text-[13px] text-forest-950">
        {running ? (
          <>Publishing… the site updates in a minute or two.</>
        ) : failed ? (
          <>The last publish failed.</>
        ) : (
          <>Saved changes are live only after publishing.</>
        )}
      </span>

      <div className="ml-auto flex items-center gap-2">
        {status?.url && (
          <a
            href={status.url}
            target="_blank"
            rel="noreferrer"
            className="text-[12px] text-indigo-600 underline underline-offset-2"
          >
            View build
          </a>
        )}
        <Button variant="accent" onClick={publish} disabled={busy || running}>
          {running ? "Publishing…" : "Publish"}
        </Button>
      </div>

      {error === "failed" && (
        <p className="w-full text-[12.5px] text-clay-600">Couldn&apos;t start the publish.</p>
      )}
    </div>
  );
}
