import { supabase } from './supabaseClient.js';

const loginForm = document.getElementById('loginForm');
const loginMsg = document.getElementById('loginMsg');

function showMsg(el, text, type = 'error') {
  el.textContent = text;
  el.className = 'msg' + (type === 'success' ? ' success' : '');
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPass').value;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) throw error;
    if (!data.session) throw new Error('Sessão não iniciada.');

    showMsg(loginMsg, 'Login realizado com sucesso!', 'success');

    setTimeout(() => window.location.href = 'Home.html', 800);

  } catch (err) {
    showMsg(loginMsg, 'Erro: ' + err.message);
    console.error('Erro no login:', err);
  }
});
