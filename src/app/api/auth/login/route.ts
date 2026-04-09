import { NextRequest, NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

export async function POST(request: NextRequest) {
  const { name, slackId } = await request.json();

  if (!name?.trim() || !slackId?.trim()) {
    return NextResponse.json(
      { error: "名前とSlack IDは必須です" },
      { status: 400 }
    );
  }

  // Slack IDがミラティブのワークスペースに存在するか検証
  try {
    const result = await slack.users.info({ user: slackId.trim() });
    if (!result.ok || !result.user) {
      return NextResponse.json(
        { error: "このSlack IDはミラティブのワークスペースに存在しません" },
        { status: 403 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Slack IDの検証に失敗しました。正しいメンバーIDか確認してください" },
      { status: 403 }
    );
  }

  const user = { name: name.trim(), slackId: slackId.trim() };
  const res = NextResponse.json({ success: true, user });

  res.cookies.set("flea-market-user", encodeURIComponent(JSON.stringify(user)), {
    path: "/",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: "lax",
  });

  return res;
}
