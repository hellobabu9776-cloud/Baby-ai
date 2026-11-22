
const chat = document.querySelector('#chat');
const form = document.querySelector('#chat-form');
const input = document.querySelector('#message');
const note = document.querySelector('#note');

const BABY_API =
  'https://billowing-violet-50a7.hellobabu9776.workers.dev';

function addBubble(text, who) {
  const el = document.createElement('div');
  el.className = `bubble ${who}`;
  el.textContent = text;
  chat.appendChild(el);
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function speak(text) {
  if (!('speechSynthesis' in window)) return;

  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = 'hi-IN';
  speech.rate = 0.9;
  speech.pitch = 1.1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);
}

async function reply(message) {
  const response = await fetch(BABY_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.reply || 'AI connection error');
  }

  return data.reply || 'Boss, mujhe jawab nahi mila.';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const value = input.value.trim();
  if (!value) return;

  addBubble(value, 'user');
  input.value = '';
  note.textContent = 'BABY soch rahi hai... ❤️';

  try {
    const answer = await reply(value);
    addBubble(answer, 'baby');
    speak(answer);
    note.textContent = 'BABY ready hai 😊';
  } catch (error) {
    addBubble('Boss, connection mein problem hai: ' + error.message, 'baby');
    note.textContent = 'AI connection check karo.';
  }
});

document.querySelectorAll('[data-prompt]').forEach((btn) => {
  btn.addEventListener('click', () => {
    input.value = btn.dataset.prompt;
    input.focus();
  });
});

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

document.querySelector('#mic').addEventListener('click', () => {
  if (!SpeechRecognition) {
    note.textContent = 'Chrome mein voice recognition available nahi hai.';
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'hi-IN';
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    input.value = event.results[0][0].transcript;
    form.requestSubmit();
  };

  recognition.onerror = () => {
    note.textContent = 'Microphone permission check karo.';
  };

  recognition.start();
});

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
