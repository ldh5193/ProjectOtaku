"use client";

import {
  getFreshness,
  freshnessConfig,
  formatVerifiedDate,
} from "@/lib/freshness";

interface FreshnessBadgeProps {
  lastVerified?: string;
  compact?: boolean;
}

export default function FreshnessBadge({
  lastVerified,
  compact,
}: FreshnessBadgeProps) {
  const tier = getFreshness(lastVerified);
  const config = freshnessConfig[tier];

  if (compact) {
    return (
      <span
        className={`inline-block w-2 h-2 rounded-full ${config.bgColor}`}
        title={config.label}
      />
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 text-xs ${config.color}`}>
      <span className={`w-2 h-2 rounded-full ${config.bgColor}`} />
      {formatVerifiedDate(lastVerified)}
    </span>
  );
}
