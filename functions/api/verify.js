// functions/verify.js
// Cloudflare Pages Functions 格式
// 激活码存放在 Cloudflare Dashboard 的环境变量里，前端永远看不到

export async function onRequestPost(context) {
  const { request, env } = context;

  // 解析请求体
  let inputCode;
  try {
    const body = await request.json();
    inputCode = (body.code || '').trim().toUpperCase();
  } catch {
    return json({ error: '请求格式错误' }, 400);
  }

  if (!inputCode) {
    return json({ error: '请输入激活码' }, 400);
  }

  // ── 从环境变量读取激活码池 ──
  // 格式：CODE1:page1.html,CODE2:page1.html,CODE3:page2.html
  // 在 Cloudflare Dashboard → Settings → Environment variables 里设置 CODES
  const raw = env.CODES || '';
  const codeMap = {};
  raw.split(',').forEach(entry => {
    const parts = entry.trim().split(':');
    if (parts.length === 2) {
      const code = parts[0].trim().toUpperCase();
      const page = parts[1].trim();
      if (code && page) codeMap[code] = page;
    }
  });

  const target = codeMap[inputCode];

  if (!target) {
    return json({ ok: false, error: '无效的激活码，请确认后重试' });
  }

  // ── 生成签名 token ──
  // 格式：YYYYMMDD.签名前16位
  const secret = env.SECRET || 'default_secret_change_me';
  const today  = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const raw_token = `${target}|${today}|${secret}`;

  // 使用 Web Crypto API（Cloudflare Workers 环境内置，无需任何依赖）
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(raw_token);

  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );
  const sigBuffer = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  const sigArray  = Array.from(new Uint8Array(sigBuffer));
  const sigHex    = sigArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
  const token     = `${today}.${sigHex}`;

  return json({ ok: true, target, token });
}

// 拒绝非 POST 请求
export async function onRequestGet() {
  return new Response('Not Found', { status: 404 });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
