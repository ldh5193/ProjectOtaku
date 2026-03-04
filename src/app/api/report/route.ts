import { NextRequest, NextResponse } from "next/server";
import { createGitHubIssue } from "@/lib/github-api";

interface ReportBody {
  type: "report" | "suggestion";
  storeId?: string;
  storeName?: string;
  reportType?: string;
  details: string;
  suggestedName?: string;
  suggestedAddress?: string;
  naverMapUrl?: string;
  genres?: string[];
}

export async function POST(request: NextRequest) {
  try {
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

    if (body.type === "report") {
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
