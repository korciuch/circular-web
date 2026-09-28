import Link from "next/link";

export default function HomePage(): React.JSX.Element {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">Your basket is ready</h1>
      <p className="text-sm text-slate-600">
        Review your order and complete payment. Card details are handled by our payments
        service and are never stored in the browser.
      </p>
      <Link
        href="/checkout"
        className="inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
      >
        Go to checkout
      </Link>
    </div>
  );
}
