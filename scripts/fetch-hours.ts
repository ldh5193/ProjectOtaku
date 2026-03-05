/**
 * 네이버 지도에서 매장 영업시간을 일괄 수집하여 JSON 파일에 반영합니다.
 *
 * Usage: npx tsx scripts/fetch-hours.ts [--dry-run] [--file stores-naver.json]
 */

import fs from "fs";
import path from "path";

interface DayHours {
  day: string;
  open: string;
  close: string;
  off?: boolean;
}

interface Store {
  id: string;
  name: string;
  naverPlaceId?: string;
  openingHours?: string;
  businessHours?: DayHours[];
  [key: string]: unknown;
}

const ALL_DAYS = ["월", "화", "수", "목", "금", "토", "일"];

async function fetchBusinessHours(
  placeId: string
): Promise<{ businessHours: DayHours[]; openingHours: string } | null> {
  try {
    const res = await fetch(`https://m.place.naver.com/place/${placeId}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
      },
    });
    const html = await res.text();

    // Extract newBusinessHours JSON using balanced bracket matching
    const prefix = '"newBusinessHours":';
    const startIdx = html.indexOf(prefix);
    if (startIdx < 0) return null;

    const arrStart = startIdx + prefix.length;
    let depth = 0;
    let end = arrStart;
    for (; end < html.length; end++) {
      if (html[end] === "[") depth++;
      if (html[end] === "]") depth--;
      if (depth === 0) break;
    }

    const jsonStr = html.substring(arrStart, end + 1);
    const data = JSON.parse(jsonStr);

    if (!Array.isArray(data) || data.length === 0) return null;

    const entry = data[0];
    if (!entry.businessHours || !Array.isArray(entry.businessHours))
      return null;

    // Build day-by-day hours
    const dayMap = new Map<string, DayHours>();
    for (const item of entry.businessHours) {
      if (!item.day || !item.businessHours) continue;
      dayMap.set(item.day, {
        day: item.day,
        open: item.businessHours.start,
        close: item.businessHours.end,
      });
    }

    // Fill in all days, marking missing ones as off
    const businessHours: DayHours[] = ALL_DAYS.map((day) => {
      const found = dayMap.get(day);
      if (found) return found;
      return { day, open: "", close: "", off: true };
    });

    // Build human-readable string
    const openingHours = buildOpeningHoursString(businessHours, entry.comingRegularClosedDays);

    return { businessHours, openingHours };
  } catch {
    return null;
  }
}

function buildOpeningHoursString(hours: DayHours[], closedDaysStr?: string): string {
  const openDays = hours.filter((h) => !h.off);
  if (openDays.length === 0) return "";

  // Check if all open days have the same hours
  const uniqueTimes = new Set(openDays.map((h) => `${h.open}-${h.close}`));

  if (uniqueTimes.size === 1) {
    const { open, close } = openDays[0];
    const offDays = hours.filter((h) => h.off).map((h) => h.day);
    if (offDays.length === 0) {
      return `${open} - ${close}`;
    }
    return `${open} - ${close} (${offDays.join(",")} 휴무)`;
  }

  // Check weekday vs weekend pattern
  const weekdays = hours.filter((h) => ["월", "화", "수", "목", "금"].includes(h.day) && !h.off);
  const weekends = hours.filter((h) => ["토", "일"].includes(h.day) && !h.off);

  const weekdayTimes = new Set(weekdays.map((h) => `${h.open}-${h.close}`));
  const weekendTimes = new Set(weekends.map((h) => `${h.open}-${h.close}`));

  if (weekdayTimes.size === 1 && weekendTimes.size === 1 && weekdays.length > 0 && weekends.length > 0) {
    const wd = weekdays[0];
    const we = weekends[0];
    if (wd.open === we.open && wd.close === we.close) {
      const offDays = hours.filter((h) => h.off).map((h) => h.day);
      return offDays.length > 0
        ? `${wd.open} - ${wd.close} (${offDays.join(",")} 휴무)`
        : `${wd.open} - ${wd.close}`;
    }
    const offDays = hours.filter((h) => h.off).map((h) => h.day);
    let str = `평일 ${wd.open}-${wd.close}, 주말 ${we.open}-${we.close}`;
    if (offDays.length > 0) str += ` (${offDays.join(",")} 휴무)`;
    return str;
  }

  // Fallback: list each day
  const offDays = hours.filter((h) => h.off).map((h) => h.day);
  const parts = openDays.map((h) => `${h.day} ${h.open}-${h.close}`);
  let str = parts.join(", ");
  if (offDays.length > 0) str += ` (${offDays.join(",")} 휴무)`;
  return str;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const fileIdx = args.indexOf("--file");
  const targetFiles = fileIdx >= 0 ? [args[fileIdx + 1]] : ["stores-naver.json", "stores-manual.json", "stores-url.json"];

  const dataDir = path.join(process.cwd(), "public", "data");
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  for (const fileName of targetFiles) {
    const filePath = path.join(dataDir, fileName);
    if (!fs.existsSync(filePath)) {
      console.log(`  Skip: ${fileName} not found`);
      continue;
    }

    const stores: Store[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const targets = stores.filter((s) => s.naverPlaceId && !s.businessHours);
    console.log(`\n${fileName}: ${targets.length}/${stores.length} stores to fetch`);

    let updated = 0;
    for (let i = 0; i < targets.length; i++) {
      const store = targets[i];
      process.stdout.write(
        `  [${i + 1}/${targets.length}] ${store.name} (${store.naverPlaceId})... `
      );

      const result = await fetchBusinessHours(store.naverPlaceId!);
      if (result && result.businessHours.some((h) => !h.off)) {
        store.businessHours = result.businessHours;
        if (result.openingHours) {
          store.openingHours = result.openingHours;
        }
        updated++;
        console.log(`OK → ${result.openingHours || "(all days but no time range)"}`);
      } else {
        totalFailed++;
        console.log("no data");
      }

      // Rate limiting: 200ms between requests
      if (i < targets.length - 1) await sleep(200);
    }

    totalUpdated += updated;
    totalSkipped += stores.length - targets.length;

    if (!dryRun && updated > 0) {
      fs.writeFileSync(filePath, JSON.stringify(stores, null, 2) + "\n", "utf-8");
      console.log(`  Saved ${fileName} (${updated} updated)`);
    }
  }

  console.log(`\nDone: ${totalUpdated} updated, ${totalSkipped} skipped (already had data), ${totalFailed} failed`);
  if (dryRun) console.log("(dry-run mode — no files written)");
}

main().catch(console.error);
