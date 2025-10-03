import { supabase } from './supabaseClient.js';

document.addEventListener("DOMContentLoaded", () => {

  const loginForm = document.getElementById("loginForm");
  const loginMsg = document.getElementById("loginMsg");

  // Função para mostrar mensagens
  function showMsg(el, text, type = "success") {
    el.textContent = text;
    el.className = `msg ${type}`;
  }

  // ===== LOGIN =====
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Captura os valores dos inputs com IDs corretos
      const emailInput = document.getElementById("loginEmail")?.value.trim().toLowerCase();
      const senhaInput = document.getElementById("loginPass")?.value.trim().toLowerCase();

      // Verifica se os inputs existem
      if (!emailInput || !senhaInput) {
        showMsg(loginMsg, "Preencha os campos corretamente", "error");
        return;
      }

      try {
        // Busca pelo email ignorando maiúsculas
        const { data: usuarios, error } = await supabase
          .from('usuarios')
          .select('*')
          .ilike('email', emailInput);

        if (error) throw error;
        if (!usuarios || usuarios.length === 0) throw new Error("E-mail ou senha incorretos");

        const usuario = usuarios[0];

        // Compara a senha ignorando maiúsculas e espaços
        if (!usuario.senha || usuario.senha.trim().toLowerCase() !== senhaInput) {
          throw new Error("E-mail ou senha incorretos");
        }

        // Salva dados do usuário na sessão
        sessionStorage.setItem("usuario", JSON.stringify(usuario));
        showMsg(loginMsg, "Login realizado com sucesso!", "success");

        setTimeout(() => window.location.href = "Home.html", 500);

      } catch (err) {
        showMsg(loginMsg, "Erro: " + err.message, "error");
        console.error("Login erro:", err);
      }
    });
  }

  // ===== VERIFICAÇÃO DE SESSÃO =====
  function checkSession() {
    const usuario = JSON.parse(sessionStorage.getItem("usuario"));
    const userNameEl = document.getElementById("userName");
    const userTipoEl = document.getElementById("userTipo");

    if (!usuario) {
      window.location.href = "index.html";
    } else if (userNameEl && userTipoEl) {
      userNameEl.textContent = usuario.email;
      userTipoEl.textContent = usuario.tipo;
    }
  }

  if (document.getElementById("userName")) {
    checkSession();
  }

  // ===== LOGOUT =====
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("usuario");
      window.location.href = "index.html";
    });
  }

});

