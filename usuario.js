import { supabase } from "./supabaseClient.js";

async function init() {
  console.log("[init] start");

  // 🔹 1. Garante que a sessão atual é restaurada logo no início
  const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) console.warn("[init] Erro ao obter sessão inicial:", sessionError);

  if (!currentSession) {
    console.warn("[init] Nenhuma sessão ativa detectada. Verificando URL de login...");
  } else {
    console.log("[init] Sessão ativa detectada:", currentSession);
  }

  // 🔹 2. Captura tokens de login que vierem na URL (de login OAuth/email link)
  try {
    if (location.hash.includes("access_token") || location.hash.includes("refresh_token")) {
      console.log("[init] detectei tokens na URL");
      const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
      if (error) {
        console.warn("[init] getSessionFromUrl falhou:", error);
      } else {
        console.log("[init] Sessão salva após login via URL:", data.session);
      }
      history.replaceState(null, "", location.pathname + location.search);
    }
  } catch (e) {
    console.warn("[init] erro ao processar hash", e);
  }

  // 🔹 3. Observa mudanças na sessão (logout, login, refresh)
  supabase.auth.onAuthStateChange((event, session) => {
    console.log("[onAuthStateChange]", event, session);
    if (event === "SIGNED_OUT" || !session) {
      console.warn("[onAuthStateChange] sessão encerrada → redirect");
      window.location.href = "index.html";
    }
  });

  // 🔹 4. Carrega dados do usuário
  await loadUser();
}

async function loadUser() {
  try {
    // 🔸 Pega sessão e usuário atual
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user || null;

    console.log("[loadUser] SESSION:", session);
    console.log("[loadUser] USER:", user);

    if (!user) {
      console.warn("[loadUser] usuário não encontrado, redirecionando...");
      window.location.href = "index.html";
      return;
    }

    // 🔸 Busca perfil na tabela 'usuario'
    const { data: profile, error: profileError } = await supabase
      .from("usuario")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) console.error("[loadUser] profileError:", profileError);
    console.log("[loadUser] profile:", profile);

    // 🔸 Atualiza DOM
    document.getElementById("userName").textContent =
      profile?.name || user.user_metadata?.full_name || (user.email || "Usuário").split("@")[0];
    document.getElementById("userEmail").textContent = user.email || "";
    document.getElementById("userCGM").textContent = profile?.cgm || "CGM não encontrado";
    document.getElementById("userPhoto").src = profile?.avatar_url || "gatinho-rock.png";

    // 🔸 Busca livro emprestado
    const { data: livro, error: livroError } = await supabase
      .from("livros_emprestados")
      .select("titulo, data_devolucao")
      .eq("usuario_id", user.id)
      .maybeSingle();

    if (livroError) console.error("[loadUser] livroError:", livroError);
    console.log("[loadUser] livro:", livro);

    document.getElementById("bookTitle").textContent = livro?.titulo || "Nenhum livro emprestado";
    document.getElementById("dueDate").textContent = `Data de devolução: ${livro?.data_devolucao || "Não definida"}`;

    // 🔸 Botão de logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("[logout] erro:", error);
          alert("Erro ao deslogar: " + error.message);
        } else {
          console.log("[logout] Usuário deslogado com sucesso.");
          window.location.href = "index.html";
        }
      });
    }

  } catch (err) {
    console.error("[loadUser] erro capturado:", err);
    const errEl = document.getElementById("errorMsg");
    if (errEl) errEl.textContent = "Erro ao carregar perfil. Veja o console.";
  }
}

window.addEventListener("DOMContentLoaded", init);
