import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getDb, Item } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDb();
  const result = await db.execute({ sql: "SELECT * FROM items WHERE id = ?", args: [id] });
  const item = result.rows[0] as unknown as Item | undefined;

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(item);
}

// Mark as sold/completed
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();
  const result = await db.execute({ sql: "SELECT * FROM items WHERE id = ?", args: [id] });
  const item = result.rows[0] as unknown as Item | undefined;

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (item.seller_slack_id !== user.slackId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.execute({ sql: "UPDATE items SET status = 'sold' WHERE id = ?", args: [id] });
  return NextResponse.json({ success: true });
}
