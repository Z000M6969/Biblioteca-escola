import { supabase } from "./supabaseClient.js";

// Função para mostrar mensagens
function showMsg(el, text, type = "success") {
  el.textContent = text;
  el.className = `msg ${type}`;
}

// ===== CADASTRO =====
const signupForm = document.getElementById("signupForm");
const signupMsg = document.getElementById("signupMsg");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const password = document.getElementById("signupPass").value;
    const cgm = document.getElementById("signupCgm").value.trim();

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .insert([{ email, senha: password, cgm }]);
      
      if (error) throw error;

      showMsg(signupMsg, "Cadastro realizado com sucesso!", "success");
      signupForm.reset();
    } catch (err) {
      showMsg(signupMsg, "Erro: " + err.message, "error");
      console.error("Cadastro erro:", err);
    }
  });
}

// ===== LOGIN =====
const loginForm = document.getElementById("loginForm");
const loginMsg = document.getElementById("loginMsg");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPass").value;

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('senha', password)
        .single();
      
      if (error || !data) throw new Error("Email ou senha incorretos.");

      showMsg(loginMsg, "Login realizado com sucesso!", "success");

      setTimeout(() => window.location.href = "Home.html", 500);
    } catch (err) {
      showMsg(loginMsg, "Erro: " + err.message, "error");
      console.error("Login erro:", err);
    }
  });
}

// ===== TOGGLE ENTRE FORMULÁRIOS =====
document.getElementById("toggleForm").addEventListener("click", () => {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const formTitle = document.getElementById("formTitle");
  const toggleText = document.getElementById("toggleText");

  if (loginForm.style.display !== "none") {
    loginForm.style.display = "none";
    signupForm.style.display = "block";
    formTitle.textContent = "Cadastro";
    toggleText.textContent = "Já tem uma conta? Faça login";
  } else {
    loginForm.style.display = "block";
    signupForm.style.display = "none";
    formTitle.textContent = "Login";
    toggleText.textContent = "Não tem uma conta? Cadastre-se";
  }
});
