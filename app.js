
const chat = document.querySelector('#chat');
const form = document.querySelector('#chat-form');
const input = document.querySelector('#message');
const note = document.querySelector('#note');
const mic = document.querySelector('#mic');

const BABY_API =
  'https://billowing-violet-50a7.hellobabu9776.workers.dev';

let history = [];
let recognition = null;

function addBubble(text, who) {
  const el = document.createElement('div');
  el.className = `bubble ${who}`;
  el.textContent = text;
  chat.appendChild(el);
  el.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest'
  });
}

function detectLanguage(text) {
  if (/[\u0600-\u06FF]/.test(text)) return 'ur-PK';

  if (/[\u0900-\u097F]/.test(text)) {
    if (/आहे|नाही|मला|तुम्ही|काय|माझे|करा/.test(text)) {
      return 'mr-IN';
    }
    return 'hi-IN';
  }

  return 'en-IN';
}

function speak(text) {
  if (!('speechSynthesis' in window)) {
    note.textContent = 'Voice support nahi hai.';
    return;
  }

  speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = detectLanguage(text);
  speech.rate = 0.9;
  speech.pitch = 1.1;
  speech.volume = 1;

  const voices = speechSynthesis.getVoices();

  const voice = voices.find(v =>
    v.lang.toLowerCase() === speech.lang.toLowerCase()
  ) || voices.find(v =>
    v.lang.toLowerCase().startsWith(
      speech.lang.split('-')[0].toLowerCase()
    )
  );

  if (voice) speech.voice = voice;

  speech.onstart = () => {
    note.textContent = 'BABY bol rahi hai ❤️';
  };

  speech.onend = () => {
    note.textContent = 'BABY ready hai 😊';
  };

  speech.onerror = () => {
    note.textContent = 'Voice error.';
  };

  speechSynthesis.speak(speech);
}

function stopSpeaking() {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
}

async function reply(message) {
  const response = await fetch(BABY_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message,
      history
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.reply || 'AI connection error');
  }

  return data.reply || 'Boss, mujhe jawab nahi mila.';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const message = input.value.trim();
  if (!message) return;

  stopSpeaking();

  addBubble(message, 'user');
  input.value = '';
  input.disabled = true;
  note.textContent = 'BABY soch rahi hai... 🧠';

  try {
    const answer = await reply(message);

    history.push(
      { role: 'user', text: message },
      { role: 'model', text: answer }
    );

    history = history.slice(-12);

    addBubble(answer, 'baby');
    speak(answer);

  } catch (error) {
    addBubble(
      'Boss, connection error: ' + error.message,
      'baby'
    );
    note.textContent = 'AI connection check karo.';
  } finally {
    input.disabled = false;
    input.focus();
  }
});

document.querySelectorAll('[data-prompt]').forEach(btn => {
  btn.addEventListener('click', () => {
    input.value = btn.dataset.prompt;
    input.focus();
  });
});

const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;

if (mic) {
  mic.addEventListener('click', () => {
    if (!SpeechRecognition) {
      note.textContent =
        'Chrome voice recognition support nahi karta.';
      return;
    }

    stopSpeaking();

    recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.interimResults = false;
    recognition.continuous = false;

    note.textContent = 'BABY sun rahi hai 🎤';

    recognition.onresult = event => {
      input.value = event.results[0][0].transcript;
      form.requestSubmit();
    };

    recognition.onerror = event => {
      note.textContent = 'Mic error: ' + event.error;
    };

    recognition.start();
  });
}

if ('speechSynthesis' in window) {
  speechSynthesis.getVoices();
  speechSynthesis.onvoiceschanged = () => {
    speechSynthesis.getVoices();
  };
}

if ('serviceWorker' in navigator &&
    location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('./sw.js')
    .catch(error => console.log(error));
}
