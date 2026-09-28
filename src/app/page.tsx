import Link from "next/link";

export default function HomePage(): React.JSX.Element {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Your order is ready</h1>
      <p className="max-w-prose text-sm leading-relaxed text-slate-600">
        Take a moment to review your order before you pay. Card details go straight to our
        payments service and are never stored in your browser.
      </p>
      <Link
        href="/checkout"
        className="inline-block rounded-md bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
      >
        Continue to checkout
      </Link>
    </div>
  );
}
