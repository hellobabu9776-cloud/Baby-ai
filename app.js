
const chat = document.querySelector('#chat');
const form = document.querySelector('#chat-form');
const input = document.querySelector('#message');
const note = document.querySelector('#note');
const mic = document.querySelector('#mic');

const BABY_API =
  'https://billowing-violet-50a7.hellobabu9776.workers.dev';

let babySpeaking = false;

// Chat message
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

// Language detection
function detectLanguage(text) {
  if (/[\u0600-\u06FF]/.test(text)) return 'ur-PK';

  if (/[a-zA-Z]/.test(text) &&
      !/[\u0900-\u097F]/.test(text)) {
    return 'en-IN';
  }

  if (/आहे|नाही|मला|तुम्ही|काय|माझे|करा/.test(text)) {
    return 'mr-IN';
  }

  return 'hi-IN';
}

// BABY speaks
function speak(text) {
  if (!('speechSynthesis' in window)) {
    note.textContent = 'Voice support available nahi hai.';
    return;
  }

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = detectLanguage(text);
  speech.rate = 0.92;
  speech.pitch = 1.08;
  speech.volume = 1;

  const voices = window.speechSynthesis.getVoices();

  const voice = voices.find(v =>
    v.lang.toLowerCase() === speech.lang.toLowerCase()
  ) || voices.find(v =>
    v.lang.toLowerCase().startsWith(
      speech.lang.split('-')[0].toLowerCase()
    )
  );

  if (voice) speech.voice = voice;

  speech.onstart = () => {
    babySpeaking = true;
    note.textContent = 'BABY bol rahi hai... ❤️';
  };

  speech.onend = () => {
    babySpeaking = false;
    note.textContent = 'BABY ready hai 😊';
  };

  speech.onerror = () => {
    babySpeaking = false;
    note.textContent = 'Voice mein problem hai.';
  };

  window.speechSynthesis.speak(speech);
}

// Stop speaking
function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  babySpeaking = false;
}

// AI Brain connection
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
    throw new Error(
      data.reply ||
      data.error ||
      'AI connection error'
    );
  }

  return (
    data.reply ||
    data.response ||
    data.text ||
    'Boss, mujhe jawab nahi mila.'
  );
}

// Send message
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const value = input.value.trim();

  if (!value) return;

  stopSpeaking();

  addBubble(value, 'user');

  input.value = '';
  input.disabled = true;
  note.textContent = 'BABY soch rahi hai... ❤️';

  try {
    const answer = await reply(value);

    addBubble(answer, 'baby');
    speak(answer);

  } catch (error) {
    const errorMessage =
      'Boss, connection mein problem hai: ' +
      error.message;

    addBubble(errorMessage, 'baby');
    note.textContent = 'AI connection check karo.';

  } finally {
    input.disabled = false;
    input.focus();
  }
});

// Suggested prompts
document.querySelectorAll('[data-prompt]').forEach((btn) => {
  btn.addEventListener('click', () => {
    input.value = btn.dataset.prompt;
    input.focus();
  });
});

// Voice recognition
const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;

if (mic) {
  mic.addEventListener('click', () => {

    if (!SpeechRecognition) {
      note.textContent =
        'Chrome mein voice recognition support nahi hai.';
      return;
    }

    stopSpeaking();

    const recognition = new SpeechRecognition();

    recognition.lang = 'hi-IN';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    note.textContent = 'BABY sun rahi hai... 🎤';

    recognition.onresult = (event) => {
      const spokenText =
        event.results[0][0].transcript;

      input.value = spokenText;
      form.requestSubmit();
    };

    recognition.onerror = (event) => {
      note.textContent =
        'Microphone error: ' + event.error;
    };

    recognition.onend = () => {
      if (!input.disabled) {
        note.textContent = 'BABY ready hai 😊';
      }
    };

    try {
      recognition.start();
    } catch (error) {
      note.textContent =
        'Microphone dobara try karo.';
    }
  });
}

// Load available voices
if ('speechSynthesis' in window) {
  window.speechSynthesis.getVoices();

  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

// Stop voice when page is closed
window.addEventListener('beforeunload', stopSpeaking);

// Service Worker
if (
  'serviceWorker' in navigator &&
  location.protocol.startsWith('http')
) {
  navigator.serviceWorker
    .register('./sw.js')
    .catch(error => {
      console.log('Service Worker:', error);
    });
}
