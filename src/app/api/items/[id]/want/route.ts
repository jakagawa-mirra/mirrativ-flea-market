import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getDb, Item } from "@/lib/db";

export const dynamic = "force-dynamic";
import { postWantToSlack } from "@/lib/slack";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = await getDb();
  const result = await db.execute({ sql: "SELECT * FROM items WHERE id = ?", args: [id] });
  const item = result.rows[0] as unknown as Item | undefined;

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!item.slack_message_ts) {
    return NextResponse.json(
      { error: "Slack message not found" },
      { status: 400 }
    );
  }

  await postWantToSlack(
    item.slack_message_ts,
    user.slackId,
    item.seller_slack_id,
    item.title
  );

  return NextResponse.json({ success: true });
}
