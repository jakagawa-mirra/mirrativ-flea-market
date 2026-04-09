import { WebClient } from "@slack/web-api";

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
const CHANNEL_ID = process.env.SLACK_CHANNEL_ID!;

export async function postItemToSlack(
  sellerSlackId: string,
  title: string,
  description: string,
  deliveryMethod: string,
  category: string,
  itemUrl: string
): Promise<string | undefined> {
  const deliveryLabel =
    deliveryMethod === "shipping"
      ? "📦 郵送"
      : deliveryMethod === "handoff"
      ? "🤝 社内手渡し"
      : `📝 ${deliveryMethod}`;

  const categoryLabel = getCategoryLabel(category);

  try {
    const result = await slack.chat.postMessage({
      channel: CHANNEL_ID,
      text: `🎁 <@${sellerSlackId}> さんが「${title}」を出品しました！`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `🎁 *<@${sellerSlackId}> さんが出品しました！*`,
          },
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*商品名*\n${title}` },
            { type: "mrkdwn", text: `*カテゴリ*\n${categoryLabel}` },
            { type: "mrkdwn", text: `*受け渡し方法*\n${deliveryLabel}` },
          ],
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*説明*\n${description.substring(0, 200)}${description.length > 200 ? "..." : ""}`,
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "🔗 フリマサイトで見る",
              },
              url: itemUrl,
            },
          ],
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: "気になる方はこのスレッドで声をかけてください 👋",
            },
          ],
        },
      ],
    });
    console.log("Slack post success, ts:", result.ts);
    return result.ts;
  } catch (error) {
    console.error("Slack post error:", error);
    return undefined;
  }
}

export async function postWantToSlack(
  messageTs: string,
  buyerSlackId: string,
  sellerSlackId: string,
  itemTitle: string
): Promise<void> {
  try {
    await slack.chat.postMessage({
      channel: CHANNEL_ID,
      thread_ts: messageTs,
      text: `💕 <@${buyerSlackId}> さんが <@${sellerSlackId}> さんの出品「${itemTitle}」に欲しい・気になると言っています！ここやDMでやり取りしましょう 🙌`,
    });
    console.log("Slack want reply success");
  } catch (error) {
    console.error("Slack thread reply error:", error);
  }
}

function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    baby: "👶 ベビー用品",
    toy: "🧸 おもちゃ",
    clothes: "👕 衣類",
    furniture: "🪑 家具・家電",
    book: "📚 本・雑誌",
    other: "📦 その他",
  };
  return map[category] || "📦 その他";
}
