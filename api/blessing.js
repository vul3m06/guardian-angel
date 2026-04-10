export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { angelNum, digitDescs, dateLabel, digitNames, theme, themeDesc } = req.body;
  if (!angelNum || !theme) return res.status(400).json({ error: 'Missing fields' });

  const prompt = `你是一位溫柔、靈性的天使數字解讀師，擅長塔羅牌與生命靈數。

使用者的日期時間是：${dateLabel}
對應的天使數字序列：${angelNum}
各數字能量：${digitDescs}
解讀主題：【${theme}】（${themeDesc}）

請融合所有數字的整體能量，圍繞【${theme}】主題，輸出剛好 5 句話，每句換行，順序與語氣如下：
第一句：【肯定】語氣 — 肯定對方的特質或已有的能量
第二句：【安慰】語氣 — 安撫擔憂、給予心靈支持
第三句：【狀況】語氣 — 根據數字能量，描述今天在【${theme}】方面可能遇到的具體狀況或情境。狀況可以是正面的好運、機會、驚喜，也可以是需要注意的挑戰、阻礙或考驗，依數字能量自然判斷，不要每次都是正面，保持真實感
第四句：【建議】語氣 — 針對第三句的狀況，提供一個溫柔具體的行動或心態建議
第五句：【祝福】語氣 — 送上最終的祝福與期許

要求：
- 每句 15～25 字，繁體中文
- 自然融合靈性語彙（天使、宇宙、能量、磁場等），不要每句都有
- 只輸出 5 句話本身，每句單獨一行，不要加標題、編號或任何說明文字`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const blessing = (data.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('')
      .trim();

    return res.status(200).json({ blessing });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'API call failed' });
  }
}
