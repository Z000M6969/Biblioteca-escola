import { supabase } from './supabaseClient.js';

document.addEventListener("DOMContentLoaded", () => {

  const loginForm = document.getElementById("loginForm");
  const loginMsg = document.getElementById("loginMsg");

  // Função para mostrar mensagens
  function showMsg(el, text, type = "success") {
    el.textContent = text;
    el.className = `msg ${type}`;
  }

  // LOGIN
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("Form submit clicado!"); // debug

      const email = document.getElementById("loginEmail").value.trim().toLowerCase();
      const senha = document.getElementById("loginPass").value.trim().toLowerCase();

      try {
        const { data: usuario, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', email)
          .eq('senha', senha)
          .single();

        console.log("Resultado Supabase:", usuario, error);

        if (error || !usuario) throw new Error("E-mail ou senha incorretos");

        // Salva na sessão
        sessionStorage.setItem("usuario", JSON.stringify(usuario));
        showMsg(loginMsg, "Login realizado com sucesso!", "success");

        setTimeout(() => window.location.href = "Home.html", 500);

      } catch (err) {
        showMsg(loginMsg, "Erro: " + err.message, "error");
        console.error("Login erro:", err);
      }
    });
  }

  // VERIFICAÇÃO DE SESSÃO NA HOME
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

  // LOGOUT
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("usuario");
      window.location.href = "index.html";
    });
  }

});
