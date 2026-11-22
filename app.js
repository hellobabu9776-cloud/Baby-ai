const chat = document.querySelector('#chat');
const form = document.querySelector('#chat-form');
const input = document.querySelector('#message');
const note = document.querySelector('#note');

function addBubble(text, who) {
  const el = document.createElement('div');
  el.className = `bubble ${who}`;
  el.textContent = text;
  chat.appendChild(el);
  el.scrollIntoView({behavior:'smooth', block:'nearest'});
}
function reply(text) {
  const t = text.toLowerCase();
  if (/hello|hi|नमस्ते|हेलो/.test(t)) return 'Hello Boss! 😊 मैं BABY हूँ। बताइए, क्या करना है?';
  if (/नाम|name/.test(t)) return 'मेरा नाम BABY AI है।';
  if (/समय|time/.test(t)) return 'आपके डिवाइस का समय: ' + new Date().toLocaleTimeString();
  if (/तारीख|date|आज/.test(t)) return 'आज की तारीख: ' + new Date().toLocaleDateString();
  if (/todo|to-do|काम/.test(t)) return 'ज़रूर Boss! अपना पहला काम बताइए, हम आपकी to-do list बनाएँगे।';
  return 'Boss, यह अभी शुरुआती prototype है। असली AI जवाब देने के लिए हमें सुरक्षित AI backend जोड़ना होगा।';
}
form.addEventListener('submit', e => {
  e.preventDefault();
  const value = input.value.trim();
  if (!value) return;
  addBubble(value, 'user');
  addBubble(reply(value), 'baby');
  input.value = '';
});
document.querySelectorAll('[data-prompt]').forEach(btn => btn.addEventListener('click', () => {
  input.value = btn.dataset.prompt;
  input.focus();
}));
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
document.querySelector('#mic').addEventListener('click', () => {
  if (!SpeechRecognition) {
    note.textContent = 'इस browser में voice recognition उपलब्ध नहीं है। Chrome में microphone permission देकर कोशिश करें।';
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = 'hi-IN';
  recognition.interimResults = false;
  recognition.onresult = event => {
    input.value = event.results[0][0].transcript;
    form.requestSubmit();
  };
  recognition.onerror = () => note.textContent = 'Voice input नहीं चल पाया। Microphone permission जाँचें।';
  recognition.start();
});
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
