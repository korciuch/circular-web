"use client";

import { useState } from "react";

export interface TipSelectorProps {
  subtotal: number;
  onTipChange: (tip: number) => void;
}

const TIP_PERCENTAGES = [0, 15, 18, 20];

export function TipSelector({ subtotal, onTipChange }: TipSelectorProps): React.JSX.Element {
  const [selected, setSelected] = useState(0);

  const subtotalDollars = subtotal / 100;

  function tipForPercentage(percentage: number): number {
    return parseFloat((subtotalDollars * (percentage / 100)).toFixed(2));
  }

  function select(percentage: number): void {
    setSelected(percentage);
    onTipChange(tipForPercentage(percentage));
  }

  return (
    <section aria-labelledby="add-a-tip" className="rounded-lg border border-slate-200 p-4">
      <h2 id="add-a-tip" className="text-base font-semibold text-slate-900">
        Add a tip
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        Tips go directly to the delivery team.
      </p>

      <div className="mt-3 flex gap-2">
        {TIP_PERCENTAGES.map((percentage) => (
          <button
            key={percentage}
            type="button"
            onClick={() => select(percentage)}
            aria-pressed={selected === percentage}
            className={
              selected === percentage
                ? "flex-1 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
                : "flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
            }
          >
            {percentage === 0 ? "None" : `${percentage}%`}
          </button>
        ))}
      </div>

      {selected > 0 ? (
        <p className="mt-3 text-sm text-slate-600">
          Tip: ${tipForPercentage(selected).toFixed(2)}
        </p>
      ) : null}
    </section>
  );
}
