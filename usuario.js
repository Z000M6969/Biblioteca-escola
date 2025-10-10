import { supabase } from "./supabaseClient.js";

async function init() {
  console.log("[init] start");

  supabase.auth.onAuthStateChange((event, session) => {
    console.log("[onAuthStateChange]", event, session);
    if (!session) {
      console.warn("[onAuthStateChange] sem sessão -> redirect");
      window.location.href = "index.html";
    }
  });

  try {
    if (location.hash.includes("access_token") || location.hash.includes("refresh_token")) {
      console.log("[init] detectei tokens na URL");
      await supabase.auth.getSessionFromUrl().catch(e => console.warn("getSessionFromUrl falhou:", e));
      history.replaceState(null, "", location.pathname + location.search);
    }
  } catch (e) {
    console.warn("[init] erro ao processar hash", e);
  }

  await loadUser();
}

async function loadUser() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const { data: { user } } = await supabase.auth.getUser();

    console.log("[loadUser] SESSION:", session);
    console.log("[loadUser] USER:", user);

    if (!user) {
      console.warn("[loadUser] usuário não encontrado, redirecionando...");
      window.location.href = "index.html";
      return;
    }

    // Perfil
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    console.log("[loadUser] profile:", profile, "profileError:", profileError);

    const displayName = profile?.name || user.user_metadata?.full_name || (user.email || "").split("@")[0] || "Usuário";

    document.getElementById("userName").textContent = displayName;
    document.getElementById("userEmail").textContent = user.email || "";
    document.getElementById("userCGM").textContent = profile?.cgm || "CGM não encontrado";
    document.getElementById("userPhoto").src = profile?.avatar_url || "gatinho-rock.png";

    // Livro emprestado
    const { data: livro, error: livroError } = await supabase
      .from("livros_emprestados")
      .select("titulo, data_devolucao")
      .eq("usuario_id", user.id)
      .maybeSingle();

    console.log("[loadUser] livro:", livro, "livroError:", livroError);

    document.getElementById("bookTitle").textContent = livro?.titulo || "Nenhum livro emprestado";
    document.getElementById("dueDate").textContent = `Data de devolução: ${livro?.data_devolucao || "Não definida"}`;

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("[logout] erro:", error);
          alert("Erro ao deslogar: " + error.message);
        } else {
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
