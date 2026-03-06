"use client";

import type { ProductType } from "@/types/store";
import { productTypeLabels } from "@/types/store";

interface ProductTypeFilterBarProps {
  allProductTypes: ProductType[];
  activeProductTypes: Set<ProductType>;
  onToggle: (pt: ProductType) => void;
  onClear: () => void;
}

export default function ProductTypeFilterBar({
  allProductTypes,
  activeProductTypes,
  onToggle,
  onClear,
}: ProductTypeFilterBarProps) {
  if (allProductTypes.length === 0) return null;

  return (
    <div className="flex gap-1.5 items-center flex-wrap">
      {activeProductTypes.size > 0 && (
        <button
          onClick={onClear}
          className="px-2 py-1 text-[11px] rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
        >
          초기화
        </button>
      )}
      {allProductTypes.map((pt) => {
        const active = activeProductTypes.has(pt);
        return (
          <button
            key={pt}
            onClick={() => onToggle(pt)}
            className={`px-2.5 py-1 text-[11px] rounded-full font-medium transition-colors ${
              active
                ? "bg-teal-100 text-teal-700 ring-1 ring-teal-300"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {productTypeLabels[pt]}
          </button>
        );
      })}
    </div>
  );
}
