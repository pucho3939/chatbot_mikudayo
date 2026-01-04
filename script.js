const chat = document.getElementById("chat");
const form = document.getElementById("form");
const input = document.getElementById("text");
const headerNote = document.getElementById("header-note");
const INITIAL_MESSAGES = [
  "ミクダヨーとお話するんダヨー。",
  "ミクダヨーの時間ダヨー。",
  "初音ミクダヨー。お話するんダヨー。",
  "ミクダヨー。ミクダヨー。ミクダヨー。"
];

let isTyping = false;

const intro = document.getElementById("intro");
let hasStartedConversation = false;

// memory（ユーザー入力のみ）
let memory = [];
const MEMORY_LIMIT = 5;

let lastFallback = null;


/* ---------- イベント ---------- */

form.addEventListener("submit", e => {
  e.preventDefault();
  if (isTyping) return;

  const text = input.value.trim();
  if (!text) return;

  addUserMessage(text);
  remember(text);
  input.value = "";

  const reply = getReply(text);
  addTypingMessage(reply);
});

/* ---------- 表示 ---------- */

function addUserMessage(text) {
  const div = document.createElement("div");
  div.className = "msg user";

  const bubble = document.createElement("div");
  bubble.className = "user-bubble";
  bubble.textContent = text;

  div.appendChild(bubble);
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function addTypingMessage(text) {
  isTyping = true;
  input.disabled = true;
  form.querySelector("button").disabled = true;

  const wrapper = document.createElement("div");
  wrapper.className = "msg bot";

  const icon = document.createElement("img");
  icon.src = "bot.png";
  icon.className = "bot-icon";

  const bubble = document.createElement("div");
  bubble.className = "bot-bubble thinking";

  wrapper.appendChild(icon);
  wrapper.appendChild(bubble);
  chat.appendChild(wrapper);
  chat.scrollTop = chat.scrollHeight;

  // ★ thinking時間を最低保証
  const minThinking = 500;
  const maxThinking = 1800;
  const thinkingTime =
    minThinking +
    Math.min(text.length * 40, maxThinking);

  setTimeout(() => {
    bubble.classList.remove("thinking");
    bubble.textContent = "";

    let i = 0;
    function typeNext() {
      const c = text[i];
      bubble.textContent += c;
      chat.scrollTop = chat.scrollHeight;
      i++;

      if (i >= text.length) {
        isTyping = false;
        input.disabled = false;
        form.querySelector("button").disabled = false;
        input.focus();
        return;
      }

      let delay = 30 + Math.random() * 40;
      if (c === "、") delay += 150;
      if (c === "。") delay += 300;

      setTimeout(typeNext, delay);
    }

    typeNext();
  }, thinkingTime);
}

/* ---------- 会話ロジック ---------- */

function getReply(text) {
  let reply = null;

  // ① 明示ルール
  for (const r of RULES) {
    if (text.includes(r.key)) {
      reply = randomPick(r.replies);
      break;
    }
  }

  // ② memory（たまに）
  if (!reply) {
    const mem = getMemoryReply(text);
    if (mem && Math.random() < 0.3) {
      reply = mem;
    }
  }

  // ③ fallback
  if (!reply) {
    reply = getFallback();
  }

  // ★ ここで必ず通す
  reply = decorateReply(reply);

  return reply;
}


function decorateReply(text) {
  let result = text;

  // ① たまに広げる
  if (Math.random() < 0.35) {
    result += " " + randomPick(EXTENDERS);
  }

  // ② さらに低確率で質問化
  result = maybeQuestion(result);

  return result;
}

function maybeQuestion(text) {
  if (Math.random() < 0.1 && !text.includes("？")) {
    return text + " どう思うんダヨー？";
  }
  return text;
}

function getMemoryReply(text) {
  if (memory.length < 2) return null;

  const prev = memory[memory.length - 2];

  if (text.includes(prev.slice(0, 2))) {
    return "さっきの話、まだ気になってるのかヨー？";
  }
  return null;
}

function getFallback() {
  let f;
  do {
    f = randomPick(FALLBACKS);
  } while (f === lastFallback);

  lastFallback = f;
  return f;
}

/* ---------- utils ---------- */

function remember(text) {
  memory.push(text);
  if (memory.length > MEMORY_LIMIT) {
    memory.shift();
  }
}

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

window.addEventListener("DOMContentLoaded", () => {
  addTypingMessage(INITIAL_MESSAGES[Math.floor(Math.random() * INITIAL_MESSAGES.length)], "ai");
});

