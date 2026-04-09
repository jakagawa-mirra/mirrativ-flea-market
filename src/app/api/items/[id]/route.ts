import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getDb, Item } from "@/lib/db";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";

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

// Update item
export async function PUT(
  request: NextRequest,
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

  const formData = await request.formData();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const deliveryMethod = formData.get("delivery_method") as string;
  const deliveryNote = formData.get("delivery_note") as string | null;
  const category = (formData.get("category") as string) || "other";
  const image = formData.get("image") as File | null;

  let imagePath = item.image_path;
  if (image && image.size > 0) {
    const blob = await put(`items/${Date.now()}-${image.name}`, image, {
      access: "public",
    });
    imagePath = blob.url;
  }

  await db.execute({
    sql: `UPDATE items SET title = ?, description = ?, image_path = ?, delivery_method = ?, delivery_note = ?, category = ? WHERE id = ?`,
    args: [title, description, imagePath, deliveryMethod, deliveryNote ?? null, category, id],
  });

  return NextResponse.json({ success: true });
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
