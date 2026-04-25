"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/admin";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    if (!response.ok) {
      setError("Mật khẩu không đúng");
      setLoading(false);
      return;
    }

    router.replace(next);
    router.refresh();
  }

  return (
    <main className="min-h-screen grid place-items-center bg-bg-app px-4 py-10">
      <section className="w-full max-w-md rounded-xl bg-bg-surface shadow-card-lg border border-line p-7">
        <div className="flex items-center gap-3 mb-5">
          <div className="grid place-items-center w-10 h-10 rounded-lg bg-brand-soft text-brand">
            <Lock size={18} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-fg-soft m-0">
              Truy cập riêng tư
            </p>
            <h1 className="m-0 mt-0.5 text-xl font-semibold text-fg">
              Đăng nhập bảng điều khiển
            </h1>
          </div>
        </div>

        <p className="text-sm text-fg-muted leading-relaxed mb-5">
          Phase 1 dùng mật khẩu chung. Sang Phase 2 sẽ chuyển sang magic link của
          Supabase.
        </p>

        <form onSubmit={onSubmit} className="grid gap-3">
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-fg">Mật khẩu</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
              className="rounded-md border border-line bg-bg-surface px-3 py-2.5 text-fg placeholder:text-fg-soft outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
            />
          </label>
          {error ? (
            <p className="text-sm text-accent-rose m-0">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-md bg-brand text-white font-semibold py-2.5 hover:bg-brand-hover disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? "Đang kiểm tra..." : "Vào bảng điều khiển"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
