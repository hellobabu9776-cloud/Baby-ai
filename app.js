
const chat = document.querySelector('#chat');
const form = document.querySelector('#chat-form');
const input = document.querySelector('#message');
const note = document.querySelector('#note');

let lastLanguage = 'hi-IN';

function addBubble(text, who) {
  const el = document.createElement('div');
  el.className = `bubble ${who}`;
  el.textContent = text;
  chat.appendChild(el);
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Language detection
function detectLanguage(text) {
  if (/[\u0600-\u06FF]/.test(text)) return 'ur-PK';

  const t = text.toLowerCase();

  const marathiWords =
    /\b(namaskar|kasa ahes|kashi ahes|mala|majha|majhi|tumhi|ahe|aahe|kay|dhanyawad)\b|नमस्कार|माझं|माझे|माझी|मला|तुम्ही|काय|आहे|आहोत|धन्यवाद|छान|बरं|करा|सांगा/;

  if (marathiWords.test(t)) return 'mr-IN';

  if (/[a-z]/i.test(text)) return 'en-IN';

  return 'hi-IN';
}

// Voice engine
function speak(text, language) {
  if (!window.speechSynthesis) {
    note.textContent = 'Voice is not supported in this browser.';
    return;
  }

  const synth = window.speechSynthesis;
  synth.cancel();

  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = language;
  speech.rate = 0.9;
  speech.pitch = 1.05;
  speech.volume = 1;

  const voices = synth.getVoices();
  const prefix = language.toLowerCase().split('-')[0];

  const voice = voices.find(v =>
    v.lang.toLowerCase() === language.toLowerCase()
  ) || voices.find(v =>
    v.lang.toLowerCase().startsWith(prefix)
  );

  if (voice) speech.voice = voice;

  speech.onstart = () => {
    note.textContent = '🔊 BABY बोल रही है...';
  };

  speech.onend = () => {
    note.textContent = 'BABY Ready है 😊';
  };

  speech.onerror = (event) => {
    note.textContent = 'Voice Error: ' + event.error;
  };

  synth.speak(speech);
  synth.resume();
}

// Four-language replies
function reply(text, lang) {
  const t = text.toLowerCase();

  if (/hello|hi|hey|नमस्ते|हेलो|السلام علیکم|سلام|नमस्कार/.test(t)) {
    if (lang === 'ur-PK')
      return 'وعلیکم السلام باس! 😊 میں بیبی ہوں۔ بتائیں، میں آپ کی کیا مدد کر سکتی ہوں؟';

    if (lang === 'mr-IN')
      return 'नमस्कार Boss! 😊 मी BABY आहे. सांगा, मी तुमची काय मदत करू?';

    if (lang === 'en-IN')
      return 'Hello Boss! 😊 I am BABY. How can I help you?';

    return 'नमस्ते Boss! 😊 मैं BABY हूँ। बताइए, क्या करना है?';
  }

  if (/your name|what is your name|name|नाम|نا م|نام/.test(t)) {
    if (lang === 'ur-PK') return 'میرا نام BABY AI ہے۔';
    if (lang === 'mr-IN') return 'माझं नाव BABY AI आहे.';
    if (lang === 'en-IN') return 'My name is BABY AI.';
    return 'मेरा नाम BABY AI है।';
  }

  if (/time|समय|وقت|वेळ/.test(t)) {
    const time = new Date().toLocaleTimeString();

    if (lang === 'ur-PK') return 'موجودہ وقت ہے: ' + time;
    if (lang === 'mr-IN') return 'आत्ताची वेळ आहे: ' + time;
    if (lang === 'en-IN') return 'The current time is: ' + time;
    return 'अभी का समय है: ' + time;
  }

  if (/date|today|तारीख|आज|تاریخ|آج|दिनांक/.test(t)) {
    const date = new Date().toLocaleDateString();

    if (lang === 'ur-PK') return 'آج کی تاریخ ہے: ' + date;
    if (lang === 'mr-IN') return 'आजची तारीख आहे: ' + date;
    if (lang === 'en-IN') return 'Today’s date is: ' + date;
    return 'आज की तारीख है: ' + date;
  }

  if (/how are you|कैसे हो|کیسی ہو|کیسے ہو|कशी आहेस|कसा आहेस/.test(t)) {
    if (lang === 'ur-PK') return 'میں بالکل ٹھیک ہوں باس! آپ کیسے ہیں؟';
    if (lang === 'mr-IN') return 'मी एकदम छान आहे Boss! तुम्ही कसे आहात?';
    if (lang === 'en-IN') return 'I am doing great, Boss! How are you?';
    return 'मैं बिल्कुल बढ़िया हूँ Boss! आप कैसे हैं?';
  }

  if (/thank you|thanks|धन्यवाद|شکریہ/.test(t)) {
    if (lang === 'ur-PK') return 'آپ کا بہت شکریہ باس!';
    if (lang === 'mr-IN') return 'तुमचं स्वागत आहे Boss!';
    if (lang === 'en-IN') return 'You are welcome, Boss!';
    return 'आपका स्वागत है Boss!';
  }

  if (/help|मदद|مدد|मदत/.test(t)) {
    if (lang === 'ur-PK') return 'جی باس! بتائیں آپ کو کس چیز میں مدد چاہیے؟';
    if (lang === 'mr-IN') return 'नक्की Boss! तुम्हाला कशात मदत हवी आहे?';
    if (lang === 'en-IN') return 'Of course Boss! What do you need help with?';
    return 'ज़रूर Boss! बताइए आपको किस चीज़ में मदद चाहिए?';
  }

  if (lang === 'ur-PK')
    return 'باس، میں BABY AI ہوں۔ ابھی میرا ابتدائی پروٹوٹائپ ہے۔';

  if (lang === 'mr-IN')
    return 'Boss, मी BABY AI आहे. सध्या माझं सुरुवातीचं prototype सुरू आहे.';

  if (lang === 'en-IN')
    return 'Boss, I am BABY AI. I am currently a starter prototype.';

  return 'Boss, मैं BABY AI हूँ। अभी मेरा शुरुआती prototype चल रहा है।';
}

// Chat system
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const value = input.value.trim();
  if (!value) return;

  addBubble(value, 'user');

  lastLanguage = detectLanguage(value);

  const answer = reply(value, lastLanguage);
  addBubble(answer, 'baby');

  speak(answer, lastLanguage);

  input.value = '';
});

// Quick prompts
document.querySelectorAll('[data-prompt]').forEach((btn) => {
  btn.addEventListener('click', () => {
    input.value = btn.dataset.prompt;
    input.focus();
  });
});

// Microphone
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const mic = document.querySelector('#mic');

if (mic) {
  mic.addEventListener('click', () => {
    if (!SpeechRecognition) {
      note.textContent = 'Voice recognition is not supported. Please use Chrome.';
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lastLanguage;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      input.value = event.results[0][0].transcript;
      form.requestSubmit();
    };

    recognition.onerror = () => {
      note.textContent = 'Please check microphone permission.';
    };

    recognition.start();
  });
}

// Load voice list
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

// Service worker
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
