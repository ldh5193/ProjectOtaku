/**
 * GitHub Issues에서 승인된 리뷰를 수집하여 reviews.json으로 저장
 * 라벨이 "store-review"이고 "approved" 라벨이 있는 이슈만 수집
 *
 * 사용: GITHUB_TOKEN=xxx npm run fetch:reviews
 */

import fs from "fs";
import path from "path";

const REPO_OWNER = "ldh5193";
const REPO_NAME = "ProjectOtaku";
const OUTPUT_PATH = path.join(import.meta.dirname, "../public/data/reviews.json");

interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  labels: { name: string }[];
  created_at: string;
  state: string;
}

interface Review {
  storeId: string;
  nickname: string;
  content: string;
  date: string;
  issueNumber: number;
}

function parseReviewBody(body: string): { storeId: string; nickname: string; content: string } | null {
  const storeIdMatch = body.match(/\*\*매장 ID\*\*:\s*(.+)/);
  const nicknameMatch = body.match(/\*\*닉네임\*\*:\s*(.+)/);
  const contentMatch = body.match(/## 리뷰 내용\n([\s\S]*?)(?:\n---|\n$|$)/);

  if (!storeIdMatch || !contentMatch) return null;

  return {
    storeId: storeIdMatch[1].trim(),
    nickname: nicknameMatch?.[1]?.trim() || "익명",
    content: contentMatch[1].trim(),
  };
}

async function fetchReviews(): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("GITHUB_TOKEN 환경변수가 필요합니다");
    process.exit(1);
  }

  console.log("GitHub Issues에서 리뷰를 수집합니다...");

  const reviews: Review[] = [];
  let page = 1;

  while (true) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues?labels=store-review,approved&state=open&per_page=100&page=${page}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!res.ok) {
      console.error(`GitHub API 에러: ${res.status} ${await res.text()}`);
      process.exit(1);
    }

    const issues: GitHubIssue[] = await res.json();
    if (issues.length === 0) break;

    for (const issue of issues) {
      const parsed = parseReviewBody(issue.body);
      if (!parsed) {
        console.warn(`  이슈 #${issue.number} 파싱 실패, 건너뜀`);
        continue;
      }

      reviews.push({
        storeId: parsed.storeId,
        nickname: parsed.nickname,
        content: parsed.content,
        date: issue.created_at.slice(0, 10),
        issueNumber: issue.number,
      });
    }

    page++;
    if (issues.length < 100) break;
  }

  // 최신순 정렬
  reviews.sort((a, b) => b.date.localeCompare(a.date));

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(reviews, null, 2) + "\n");
  console.log(`\n${reviews.length}개 리뷰 저장 완료: ${OUTPUT_PATH}`);
}

fetchReviews();
