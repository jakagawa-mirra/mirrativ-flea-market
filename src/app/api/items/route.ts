import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getDb, Item } from "@/lib/db";
import { postItemToSlack } from "@/lib/slack";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const db = await getDb();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const myItems = searchParams.get("my");
  const user = await getUser();

  let query = "SELECT * FROM items WHERE status = 'active'";
  const params: string[] = [];

  if (myItems === "true" && user) {
    query = "SELECT * FROM items WHERE seller_slack_id = ?";
    params.push(user.slackId);
  } else if (category && category !== "all") {
    query += " AND category = ?";
    params.push(category);
  }

  query += " ORDER BY created_at DESC";

  const result = await db.execute({ sql: query, args: params });
  const items = result.rows as unknown as Item[];
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const deliveryMethod = formData.get("delivery_method") as string;
  const deliveryNote = formData.get("delivery_note") as string | null;
  const category = (formData.get("category") as string) || "other";
  const image = formData.get("image") as File | null;

  if (!title || !description || !deliveryMethod) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  let imagePath: string | null = null;
  if (image && image.size > 0) {
    const blob = await put(`items/${Date.now()}-${image.name}`, image, {
      access: "public",
    });
    imagePath = blob.url;
  }

  const db = await getDb();

  // Post to Slack
  const delivery = deliveryNote || deliveryMethod;
  const messageTs = await postItemToSlack(
    user.slackId,
    title,
    description,
    delivery,
    category
  );

  const result = await db.execute({
    sql: `INSERT INTO items (title, description, image_path, delivery_method, delivery_note, category, seller_slack_id, seller_name, seller_image, slack_message_ts)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      title,
      description,
      imagePath,
      deliveryMethod,
      deliveryNote ?? null,
      category,
      user.slackId,
      user.name,
      null,
      messageTs ?? null,
    ],
  });

  return NextResponse.json({ id: Number(result.lastInsertRowid) }, { status: 201 });
}
