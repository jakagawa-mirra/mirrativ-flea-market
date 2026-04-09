import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { name, slackId } = await request.json();

  if (!name?.trim() || !slackId?.trim()) {
    return NextResponse.json(
      { error: "名前とSlack IDは必須です" },
      { status: 400 }
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
