// PassThugh — script.js
// موبایل‌اول — منطق تولید پسورد، کپی، تاریخچه در LocalStorage و تم

// کاراکترها
const LOWER_CHARS = "abcdefghijklmnopqrstuvwxyz";
const UPPER_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBER_CHARS = "0123456789";
const SYMBOL_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>/?~`";

// عناصر DOM
const lengthInput = document.getElementById('length');
const lengthValue = document.getElementById('lengthValue');
const lower = document.getElementById('lower');
const upper = document.getElementById('upper');
const numbers = document.getElementById('numbers');
const symbols = document.getElementById('symbols');
const generateBtn = document.getElementById('generate');
const passwordBox = document.getElementById('passwordBox');
const copyBtn = document.getElementById('copyBtn');
const msg = document.getElementById('msg');
const historyList = document.getElementById('historyList');
const toggleTheme = document.getElementById('toggleTheme');

// مقدار اولیه طول
lengthValue.textContent = lengthInput.value;

// بروزرسانی مقدار هنگام تغییر اسلایدر
lengthInput.addEventListener('input', () => {
  lengthValue.textContent = lengthInput.value;
});

// نمایش پیام‌های کوتاه (توست ساده)
function showMessage(text, ok=true){
  msg.textContent = text;
  msg.style.color = ok ? 'var(--accent)' : '#ff6b6b';
  setTimeout(()=>{ msg.textContent = '' }, 3000);
}

// تابع تولید پسورد
function generatePassword(len, options){
  let pool = '';
  if(options.lower) pool += LOWER_CHARS;
  if(options.upper) pool += UPPER_CHARS;
  if(options.numbers) pool += NUMBER_CHARS;
  if(options.symbols) pool += SYMBOL_CHARS;
  if(!pool) return '';
  let pw = '';
  // تضمین حضور حداقل یک نوع از هر بخش انتخابی
  const guaranteed = [];
  if(options.lower) guaranteed.push(randomFrom(LOWER_CHARS));
  if(options.upper) guaranteed.push(randomFrom(UPPER_CHARS));
  if(options.numbers) guaranteed.push(randomFrom(NUMBER_CHARS));
  if(options.symbols) guaranteed.push(randomFrom(SYMBOL_CHARS));
  // ساخت با استفاده از pool
  for(let i=0;i<len;i++){
    pw += randomFrom(pool);
  }
  // جایگزینی اولین مقادیر با موارد تضمین‌شده
  for(let i=0;i<guaranteed.length && i<pw.length;i++){
    // جایگزینی در مکان تصادفی
    const pos = Math.floor(Math.random()*pw.length);
    pw = pw.substring(0,pos) + guaranteed[i] + pw.substring(pos+1);
  }
  return pw;
}

function randomFrom(str){ return str.charAt(Math.floor(Math.random()*str.length)); }

// مدیریت تاریخچه در localStorage (آخرین 5)
const STORAGE_KEY = 'passthugh_history_v1';

function loadHistory(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  }catch(e){
    return [];
  }
}

function saveToHistory(pw){
  if(!pw) return;
  let hist = loadHistory();
  // حذف تکراری‌ها
  hist = hist.filter(x => x !== pw);
  // افزودن به ابتدا
  hist.unshift(pw);
  // نگه داشتن حداکثر 5
  hist = hist.slice(0,5);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(hist));
  renderHistory();
}

function renderHistory(){
  const hist = loadHistory();
  historyList.innerHTML = '';
  if(hist.length === 0){
    const li = document.createElement('li');
    li.textContent = 'هنوز پسوردی تولید نشده.';
    li.style.opacity = '0.7';
    historyList.appendChild(li);
    return;
  }
  hist.forEach(item => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.textContent = 'کپی';
    btn.addEventListener('click', ()=>{
      copyText(item);
    });
    const span = document.createElement('span');
    span.textContent = item;
    span.style.flex = '1';
    span.style.textAlign = 'right';
    span.style.marginLeft = '10px';
    // کلیک روی متن هم کپی می‌کند
    span.addEventListener('click', ()=> copyText(item));
    li.appendChild(span);
    li.appendChild(btn);
    historyList.appendChild(li);
  });
}

// کپی به کلیپ‌بورد
async function copyText(text){
  try{
    await navigator.clipboard.writeText(text);
    showMessage('کپی شد ✔︎', true);
  }catch(e){
    // fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try{ document.execCommand('copy'); showMessage('کپی شد ✔︎', true); }catch(e2){ showMessage('کپی ناموفق', false); }
    ta.remove();
  }
}

// رویداد تولید
generateBtn.addEventListener('click', ()=>{
  const len = parseInt(lengthInput.value,10);
  const options = {
    lower: lower.checked,
    upper: upper.checked,
    numbers: numbers.checked,
    symbols: symbols.checked
  };
  // اگر هیچ کدام انتخاب نشده باشد، خطا نمایش بده
  if(!options.lower && !options.upper && !options.numbers && !options.symbols){
    showMessage('حداقل یک نوع کاراکتر را انتخاب کنید!', false);
    // اضافه کردن افکت لرزش کوتاه
    passwordBox.animate([{transform:'translateX(-4px)'},{transform:'translateX(4px)'},{transform:'translateX(0)'}],{duration:300});
    return;
  }
  const pw = generatePassword(len, options);
  passwordBox.textContent = pw;
  // ذخیره در تاریخچه و لوکال استوریج
  saveToHistory(pw);
  showMessage('پسورد تولید شد', true);
});

// دکمه کپی برای کپی سریع پسورد نمایشی
copyBtn.addEventListener('click', ()=>{
  const text = passwordBox.textContent.trim();
  if(!text || text === '—'){ showMessage('هیچ پسوردی برای کپی وجود ندارد', false); return; }
  copyText(text);
});

// بارگذاری اولیه تاریخچه هنگام باز شدن صفحه
document.addEventListener('DOMContentLoaded', ()=>{
  renderHistory();
  // بارگذاری تم از localStorage
  const theme = localStorage.getItem('passthugh_theme');
  if(theme === 'light') document.body.classList.remove('dark'), document.body.classList.add('light');
});

// تغییر تم
toggleTheme.addEventListener('click', ()=>{
  document.body.classList.toggle('light');
  const isLight = document.body.classList.contains('light');
  localStorage.setItem('passthugh_theme', isLight ? 'light' : 'dark');
});

// keyboard accessibility: Generate with Enter when focused on password box
passwordBox.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter') generateBtn.click();
});
