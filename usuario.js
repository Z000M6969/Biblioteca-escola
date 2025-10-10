import { supabase } from "./supabaseClient.js";

async function init() {
  console.log("[init] start");

  // Observa mudanças de sessão
  supabase.auth.onAuthStateChange((event, session) => {
    console.log("[onAuthStateChange]", event, session);
  });

  // Tenta parsear hash de OAuth
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
    // Pega sessão e usuário
    const { data: { session } } = await supabase.auth.getSession();
    const { data: { user } } = await supabase.auth.getUser();

    console.log("[loadUser] SESSION:", session);
    console.log("[loadUser] USER:", user);

    if (!user) {
      console.warn("[loadUser] usuário não encontrado.");
      return; // não redireciona automaticamente
    }

    // --- Busca perfil na tabela 'usuario' ---
    // Certifique-se de que a coluna que referencia o auth é "user_id"
    const { data: profile, error: profileError } = await supabase
      .from("usuario")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("[loadUser] profileError:", profileError);
    }
    if (!profile) {
      console.warn("[loadUser] Nenhum perfil encontrado na tabela 'usuario' para este user_id:", user.id);
    }
    console.log("[loadUser] profile:", profile);

    // Atualiza DOM
    document.getElementById("userName").textContent = profile?.name || user.user_metadata?.full_name || (user.email || "Usuário").split("@")[0];
    document.getElementById("userEmail").textContent = user.email || "";
    document.getElementById("userCGM").textContent = profile?.cgm || "CGM não encontrado";
    document.getElementById("userPhoto").src = profile?.avatar_url || "gatinho-rock.png";

    // --- Livro emprestado ---
    const { data: livro, error: livroError } = await supabase
      .from("livros_emprestados")
      .select("titulo, data_devolucao")
      .eq("usuario_id", user.id)
      .maybeSingle();

    if (livroError) {
      console.error("[loadUser] livroError:", livroError);
    }
    if (!livro) {
      console.warn("[loadUser] Nenhum livro encontrado para este usuário:", user.id);
    }
    console.log("[loadUser] livro:", livro);

    document.getElementById("bookTitle").textContent = livro?.titulo || "Nenhum livro emprestado";
    document.getElementById("dueDate").textContent = `Data de devolução: ${livro?.data_devolucao || "Não definida"}`;

    // --- Logout ---
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("[logout] erro:", error);
          alert("Erro ao deslogar: " + error.message);
        } else {
          console.log("[logout] Usuário deslogado com sucesso.");
        }
      });
    }

  } catch (err) {
    console.error("[loadUser] erro capturado:", err);
  }
}

window.addEventListener("DOMContentLoaded", init);
