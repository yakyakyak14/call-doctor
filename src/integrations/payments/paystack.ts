export type PaystackSuccessResponse = {
  reference: string;
  trans: string;
  status: string;
  message: string;
  transaction: string;
  trxref: string;
};

function ensureWindow(): any {
  if (typeof window === "undefined") throw new Error("Paystack can only run in the browser");
  return window as any;
}

export async function loadPaystackScript(): Promise<void> {
  const w = ensureWindow();
  if (w.PaystackPop) return;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paystack script"));
    document.head.appendChild(script);
  });
}

export async function payWithPaystack(opts: {
  publicKey: string;
  email: string;
  amountKobo: number; // NGN in kobo (amount * 100)
  reference: string;
  metadata?: Record<string, any>;
  onSuccess: (resp: PaystackSuccessResponse) => void;
  onClose?: () => void;
}) {
  await loadPaystackScript();
  const w = ensureWindow();
  const handler = w.PaystackPop.setup({
    key: opts.publicKey,
    email: opts.email,
    amount: opts.amountKobo,
    currency: "NGN",
    ref: opts.reference,
    metadata: opts.metadata || {},
    callback: (response: PaystackSuccessResponse) => opts.onSuccess(response),
    onClose: () => opts.onClose?.(),
  });
  handler.openIframe();
  return handler;
}
