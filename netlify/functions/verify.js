// netlify/functions/verify.js
// 运行在 Netlify 服务器上，激活码永远不会暴露给前端

exports.handler = async (event) => {
  // 只允许 POST 请求
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let inputCode;
  try {
    const body = JSON.parse(event.body);
    inputCode = (body.code || '').trim().toUpperCase();
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: '请求格式错误' }) };
  }

  if (!inputCode) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: '请输入激活码' })
    };
  }

  // ── 从环境变量读取激活码池 ──
  // 格式：CODE1:page1.html,CODE2:page1.html,CODE3:page2.html
  // 在 Netlify 后台 Environment Variables 里设置 CODES 变量
  const raw = process.env.CODES || '';
  const codeMap = {};
  raw.split(',').forEach(entry => {
    const [code, page] = entry.trim().split(':');
    if (code && page) codeMap[code.trim().toUpperCase()] = page.trim();
  });

  const target = codeMap[inputCode];

  if (!target) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: '无效的激活码，请确认后重试' })
    };
  }

  // 生成一个带签名的 token：目标页面 + 当天日期 + 密钥
  // 使用 SECRET 环境变量作为签名密钥（在 Netlify 后台设置）
  const secret = process.env.SECRET || 'default_secret_change_me';
  const today  = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const raw_token = `${target}|${today}|${secret}`;

  // 用简单哈希生成签名（纯 Node.js 内置，无需安装依赖）
  const crypto = require('crypto');
  const sig    = crypto.createHash('sha256').update(raw_token).digest('hex').slice(0, 16);
  const token  = `${today}.${sig}`;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, target, token })
  };
};
