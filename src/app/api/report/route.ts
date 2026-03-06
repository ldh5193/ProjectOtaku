import { NextRequest, NextResponse } from "next/server";
import { createGitHubIssue } from "@/lib/github-api";
import { createRateLimiter } from "@/lib/rate-limit";

const checkRateLimit = createRateLimiter(5, 60_000);

interface ReportBody {
  type: "report" | "suggestion" | "review";
  storeId?: string;
  storeName?: string;
  reportType?: string;
  details: string;
  suggestedName?: string;
  suggestedAddress?: string;
  naverMapUrl?: string;
  genres?: string[];
  nickname?: string;
}

export async function POST(request: NextRequest) {
  try {
    // 레이트리밋
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = checkRateLimit(ip);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    const body: ReportBody = await request.json();

    if (!body.type || !body.details) {
      return NextResponse.json(
        { error: "type and details are required" },
        { status: 400 }
      );
    }

    let title: string;
    let issueBody: string;
    let labels: string[];

    if (body.type === "review") {
      if (!body.storeId || !body.storeName || !body.details) {
        return NextResponse.json(
          { error: "storeId, storeName, and details are required for reviews" },
          { status: 400 }
        );
      }
      if (body.details.length > 200) {
        return NextResponse.json(
          { error: "리뷰는 200자 이내로 작성해주세요." },
          { status: 400 }
        );
      }
      const nick = body.nickname?.trim().slice(0, 20) || "익명";
      title = `[리뷰] ${body.storeName}`;
      issueBody = [
        `## 매장 리뷰`,
        `- **매장 ID**: ${body.storeId}`,
        `- **매장명**: ${body.storeName}`,
        `- **닉네임**: ${nick}`,
        ``,
        `## 리뷰 내용`,
        body.details,
        ``,
        `---`,
        `_이 이슈는 오덕로드 앱 내 리뷰 기능으로 자동 생성되었습니다._`,
      ].join("\n");
      labels = ["store-review"];
    } else if (body.type === "report") {
      if (!body.storeId || !body.storeName) {
        return NextResponse.json(
          { error: "storeId and storeName are required for reports" },
          { status: 400 }
        );
      }
      title = `[정보 수정] ${body.storeName}`;
      issueBody = [
        `## 매장 정보`,
        `- **매장 ID**: ${body.storeId}`,
        `- **매장명**: ${body.storeName}`,
        `- **수정 유형**: ${body.reportType || "기타"}`,
        ``,
        `## 상세 내용`,
        body.details,
        ``,
        `---`,
        `_이 이슈는 오덕로드 앱 내 제보 기능으로 자동 생성되었습니다._`,
      ].join("\n");
      labels = ["store-report"];
    } else {
      title = `[매장 추가] ${body.suggestedName || "새 매장"}`;
      issueBody = [
        `## 매장 정보`,
        body.suggestedName ? `- **매장명**: ${body.suggestedName}` : "",
        body.suggestedAddress ? `- **주소**: ${body.suggestedAddress}` : "",
        body.naverMapUrl ? `- **네이버 지도 URL**: ${body.naverMapUrl}` : "",
        body.genres?.length ? `- **장르**: ${body.genres.join(", ")}` : "",
        ``,
        `## 추가 정보`,
        body.details || "없음",
        ``,
        `---`,
        `_이 이슈는 오덕로드 앱 내 매장 제안 기능으로 자동 생성되었습니다._`,
      ]
        .filter(Boolean)
        .join("\n");
      labels = ["store-suggestion"];
    }

    const result = await createGitHubIssue({ title, body: issueBody, labels });
    return NextResponse.json({
      success: true,
      issueUrl: result.url,
      issueNumber: result.number,
    });
  } catch (err) {
    console.error("Report API error:", err);
    return NextResponse.json(
      { error: "제보 전송에 실패했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
