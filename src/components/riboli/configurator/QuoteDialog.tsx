import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitQuoteRequest } from "@/lib/quote.functions";

type Props = {
  open: boolean;
  onClose: () => void;
  config: {
    modelSlug: string;
    hullColor: string;
    tubeColor: string;
    canopyColor: string;
    engineHp: number;
    equipment: string[];
  };
};

export function QuoteDialog({ open, onClose, config }: Props) {
  const submit = useServerFn(submitQuoteRequest);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [refId, setRefId] = useState<string | null>(null);

  if (!open) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await submit({
        data: {
          ...config,
          fullName: String(fd.get("fullName") || ""),
          email: String(fd.get("email") || ""),
          phone: String(fd.get("phone") || ""),
          country: String(fd.get("country") || ""),
          message: String(fd.get("message") || ""),
        },
      });
      setRefId(res.id);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-paper text-ink w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 md:p-10 border border-ink/10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-2xl leading-none text-ink/60 hover:text-ink"
          aria-label="Close"
        >
          ×
        </button>

        {status === "success" ? (
          <div className="text-center py-6">
            <div className="text-[10px] uppercase tracking-[0.3em] text-copper mb-3">Received</div>
            <h3 className="font-display text-4xl mb-4">Thank you.</h3>
            <p className="text-ink/70 text-sm mb-6">
              Your configuration has been sent to our team. We'll get back within 48 hours.
            </p>
            <div className="text-[10px] uppercase tracking-[0.3em] text-ink/40 mb-6">
              Reference · {refId?.slice(0, 8)}
            </div>
            <button
              onClick={onClose}
              className="bg-ink text-paper px-6 py-3 text-[11px] uppercase tracking-[0.3em] hover:bg-copper transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="text-[10px] uppercase tracking-[0.3em] text-copper mb-2">Request Quote</div>
            <h3 className="font-display text-3xl mb-1">Get pricing.</h3>
            <p className="text-ink/60 text-xs mb-6">
              {config.modelSlug.toUpperCase()} · {config.engineHp} HP · {config.equipment.length} extras
            </p>

            <form onSubmit={onSubmit} className="space-y-4">
              <Field name="fullName" label="Full name" required />
              <Field name="email" label="Email" type="email" required />
              <div className="grid grid-cols-2 gap-3">
                <Field name="phone" label="Phone" />
                <Field name="country" label="Country" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.3em] text-ink/60 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  rows={3}
                  maxLength={1000}
                  className="w-full bg-transparent border border-ink/20 px-3 py-2 text-sm focus:border-ink outline-none"
                />
              </div>

              {error && <div className="text-xs text-red-700">{error}</div>}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-ink text-paper px-6 py-4 text-[11px] uppercase tracking-[0.3em] hover:bg-copper transition-colors disabled:opacity-50"
              >
                {status === "loading" ? "Sending…" : "Send request"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.3em] text-ink/60 mb-2">
        {label} {required && <span className="text-copper">*</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        maxLength={type === "email" ? 255 : 100}
        className="w-full bg-transparent border border-ink/20 px-3 py-2 text-sm focus:border-ink outline-none"
      />
    </div>
  );
}
