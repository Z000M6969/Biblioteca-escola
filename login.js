import { supabase } from './supabaseClient.js';

document.addEventListener("DOMContentLoaded", () => {

  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const loginMsg = document.getElementById("loginMsg");
  const signupMsg = document.getElementById("signupMsg");
  const formTitle = document.getElementById("formTitle");
  const toggleForm = document.getElementById("toggleForm");
  const toggleText = document.getElementById("toggleText");

  // Função para mostrar mensagens
  function showMsg(el, text, type = "success") {
    if (!el) return;
    el.textContent = text;
    el.className = `msg ${type}`;
  }

  // ===== LOGIN =====
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const emailInputEl = document.getElementById("loginEmail");
      const senhaInputEl = document.getElementById("loginPass");

      const emailInput = emailInputEl.value.trim().toLowerCase();
      const senhaInput = senhaInputEl.value.trim();

      if (!emailInput || !senhaInput) {
        showMsg(loginMsg, "Preencha os campos corretamente", "error");
        return;
      }

      try {
        const { data: usuarios, error } = await supabase
          .from('usuarios')
          .select('*')
          .ilike('email', emailInput);

        if (error) throw error;
        if (!usuarios || usuarios.length === 0) throw new Error("E-mail ou senha incorretos");

        const usuario = usuarios[0];

        if (!usuario.senha || usuario.senha !== senhaInput) {
          throw new Error("E-mail ou senha incorretos");
        }

        sessionStorage.setItem("usuario", JSON.stringify(usuario));
        showMsg(loginMsg, "Login realizado com sucesso!", "success");

        setTimeout(() => window.location.href = "Home.html", 500);

      } catch (err) {
        showMsg(loginMsg, "Erro: " + err.message, "error");
      }
    });
  }

  // ===== CADASTRO =====
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const emailInputEl = document.getElementById("signupEmail");
      const cgmInputEl = document.getElementById("signupCgm");
      const senhaInputEl = document.getElementById("signupPass");

      const emailInput = emailInputEl.value.trim().toLowerCase();
      const cgmInput = cgmInputEl.value.trim();
      const senhaInput = senhaInputEl.value.trim();

      if (!emailInput || !cgmInput || !senhaInput) {
        showMsg(signupMsg, "Preencha todos os campos corretamente", "error");
        return;
      }

      try {
        const { data, error } = await supabase
          .from('usuarios')
          .insert([{ email: emailInput, cgm: cgmInput, senha: senhaInput }]);

        if (error) throw error;

        showMsg(signupMsg, "Cadastro realizado com sucesso!", "success");

        setTimeout(() => {
          showMsg(signupMsg, "", "success");
          toggleForm.click();
        }, 2000);

      } catch (err) {
        showMsg(signupMsg, "Erro: " + err.message, "error");
      }
    });
  }

  // ===== TOGGLE ENTRE FORMULÁRIOS =====
  toggleForm.addEventListener("click", () => {
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
});

