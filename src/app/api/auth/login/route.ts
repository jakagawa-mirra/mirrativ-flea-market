import { NextRequest, NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";

export const dynamic = "force-dynamic";

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email?.trim()) {
    return NextResponse.json(
      { error: "メールアドレスを入力してください" },
      { status: 400 }
    );
  }

  const trimmedEmail = email.trim().toLowerCase();

  // ミラティブドメインのメアドのみ許可
  if (!trimmedEmail.endsWith("@mirrativ.com")) {
    return NextResponse.json(
      { error: "ミラティブのメールアドレス（@mirrativ.com）を入力してください" },
      { status: 403 }
    );
  }

  // メールアドレスからSlackユーザーを検索
  try {
    const result = await slack.users.lookupByEmail({ email: trimmedEmail });
    if (!result.ok || !result.user) {
      return NextResponse.json(
        { error: "このメールアドレスのSlackアカウントが見つかりません" },
        { status: 403 }
      );
    }

    const slackUser = result.user;
    const slackId = slackUser.id!;
    const name =
      slackUser.profile?.display_name ||
      slackUser.real_name ||
      slackUser.name ||
      "名無し";

    const user = { name, slackId };
    const res = NextResponse.json({ success: true, user });

    res.cookies.set(
      "flea-market-user",
      encodeURIComponent(JSON.stringify(user)),
      {
        path: "/",
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: "lax",
      }
    );

    return res;
  } catch {
    return NextResponse.json(
      { error: "Slackアカウントの検索に失敗しました。メールアドレスを確認してください" },
      { status: 403 }
    );
  }
}
