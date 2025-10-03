import { supabase } from './supabaseClient.js';

document.addEventListener("DOMContentLoaded", () => {

  const loginForm = document.getElementById("loginForm");
  const loginMsg = document.getElementById("loginMsg");

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

      // Verifica se os elementos existem
      if (!emailInputEl || !senhaInputEl) {
        console.error("Inputs de email ou senha não encontrados no DOM");
        showMsg(loginMsg, "Erro: elementos do formulário não encontrados", "error");
        return;
      }

      const emailInput = emailInputEl.value.trim().toLowerCase();
      const senhaInput = senhaInputEl.value.trim();

      if (!emailInput || !senhaInput) {
        showMsg(loginMsg, "Preencha os campos corretamente", "error");
        return;
      }

      try {
        // Busca pelo email (ignorando maiúsculas)
        const { data: usuarios, error } = await supabase
          .from('usuarios')
          .select('*')
          .ilike('email', emailInput);

        if (error) throw error;
        if (!usuarios || usuarios.length === 0) throw new Error("E-mail ou senha incorretos");

        const usuario = usuarios[0];

        // Compara a senha
        if (!usuario.senha || usuario.senha !== senhaInput) {
          throw new Error("E-mail ou senha incorretos");
        }

        // Salva na sessão
        sessionStorage.setItem("usuario", JSON.stringify(usuario));
        showMsg(loginMsg, "Login realizado com sucesso!", "success");

        setTimeout(() => window.location.href = "Home.html", 500);

      } catch (err) {
        console.error("Login erro:", err);
        showMsg(loginMsg, "Erro: " + err.message, "error");
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
    } else if (userNameEl) {
      userNameEl.textContent = usuario.email;
    }

    if (userTipoEl) {
      userTipoEl.textContent = usuario.tipo;
    }
  }

  if (document.getElementById("userName") || document.getElementById("userTipo")) {
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
