import ThemeClient from "ginga-ui/ai";

export default async function handler(req, res) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "APIキーが設定されていません。" });
  }

  const themeClient = new ThemeClient({
    clientType: "openai",
    apiKey, // サーバーサイドで安全にAPIキーを使用
  });

  try {
    const { CSSCode } = await themeClient.generateTheme("modern and clean");
    res.status(200).json({ CSSCode });
  } catch (error) {
    console.error("テーマ生成エラー:", error);
    res.status(500).json({ error: "テーマ生成に失敗しました。" });
  }
}
