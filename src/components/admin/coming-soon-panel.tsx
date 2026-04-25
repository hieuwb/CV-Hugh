import { Sparkles } from "lucide-react";

type Props = {
  title: string;
  description: string;
  tables?: string[];
};

// Panel chung cho các trang admin chưa có tính năng thật (Phase 2/3/4).
// Giữ tinh thần "todo rõ ràng" thay vì trang trống.
export function ComingSoonPanel({ title, description, tables = [] }: Props) {
  return (
    <section className="rounded-xl border border-line bg-bg-surface shadow-card p-8 flex items-start gap-5">
      <div className="grid place-items-center w-12 h-12 rounded-xl bg-brand-soft text-brand shrink-0">
        <Sparkles size={22} />
      </div>
      <div className="min-w-0">
        <h2 className="m-0 text-lg font-semibold text-fg">{title}</h2>
        <p className="mt-2 mb-0 text-sm text-fg-muted leading-relaxed max-w-2xl">
          {description}
        </p>
        {tables.length ? (
          <p className="mt-3 mb-0 text-xs text-fg-soft">
            Bảng dữ liệu:{" "}
            {tables.map((t, i) => (
              <span key={t}>
                {i > 0 ? ", " : ""}
                <code className="px-1.5 py-0.5 rounded bg-bg-muted text-fg-muted font-mono">
                  {t}
                </code>
              </span>
            ))}
          </p>
        ) : null}
      </div>
    </section>
  );
}
