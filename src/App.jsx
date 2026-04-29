import React, { useState, useEffect } from "react";
import { TrendingUp, MessageCircle, Eye, Heart, Plus, Sparkles, Lightbulb, Trash2, BarChart3, Target, Loader2, X } from "lucide-react";

export default function App() {
  const [view, setView] = useState("dashboard");
  const [posts, setPosts] = useState([]);
  const [showLogger, setShowLogger] = useState(false);
  const [insight, setInsight] = useState("");
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [ideas, setIdeas] = useState([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [ideaTopic, setIdeaTopic] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("signal_posts_v1");
      if (raw) setPosts(JSON.parse(raw));
    } catch (e) { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("signal_posts_v1", JSON.stringify(posts));
    } catch (e) { /* ignore */ }
  }, [posts, hydrated]);

  const addPost = (post) => {
    setPosts([{ ...post, id: Date.now() }, ...posts]);
    setShowLogger(false);
  };

  const deletePost = (id) => setPosts(posts.filter((p) => p.id !== id));

  const totalPosts = posts.length;
  const totalImpr = posts.reduce((s, p) => s + (Number(p.impressions) || 0), 0);
  const totalComments = posts.reduce((s, p) => s + (Number(p.comments) || 0), 0);
  const totalReactions = posts.reduce((s, p) => s + (Number(p.reactions) || 0), 0);
  const cpp = totalPosts ? (totalComments / totalPosts).toFixed(1) : "0.0";
  const engRate = totalImpr ? (((totalComments + totalReactions) / totalImpr) * 100).toFixed(2) : "0.00";

  const sortedByComments = [...posts].sort((a, b) => (b.comments || 0) - (a.comments || 0));
  const bestPost = sortedByComments[0];

  const formatColors = {
    Provocation: "var(--rust)",
    Framework: "var(--ink)",
    "Field note": "var(--moss)",
    Newsletter: "var(--gold)",
  };

  const callClaude = async (prompt) => {
    const res = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "API call failed");
    }
    const data = await res.json();
    return data.text || "";
  };

  const generateInsight = async () => {
    if (posts.length < 2) {
      setInsight("Log at least 2 posts to unlock pattern analysis. The app needs comparison points to find what's working.");
      return;
    }
    setLoadingInsight(true);
    try {
      const summary = posts.map((p, i) =>
        `Post ${i + 1} (${p.format}): "${p.title}" — ${p.impressions || 0} impressions, ${p.comments || 0} comments, ${p.reactions || 0} reactions`
      ).join("\n");

      const prompt = `You are an analytics advisor for Syed Tufail Ahmed, an AI Governance thought leader in Saudi Arabia (author of "Human in the Loop"). His content focuses on AI governance, ethics, and Saudi Vision 2030. His core insight: comments-per-post matters more than impressions — provocation drives comments, comments drive authority.

Here is his recent post performance:

${summary}

Aggregate: ${totalPosts} posts, ${totalImpr} impressions, ${totalComments} comments, ${totalReactions} reactions, ${cpp} comments/post avg.

Give him ONE specific, actionable insight in exactly 3-4 sentences. Be direct — he prefers sharp, critical feedback over reassurance. Reference specific posts by their format or title. End with one concrete next move. No hedging, no preamble.`;

      const text = await callClaude(prompt);
      setInsight(text || "Couldn't generate an insight right now. Try again in a moment.");
    } catch (e) {
      setInsight("Connection issue: " + (e.message || "try again"));
    }
    setLoadingInsight(false);
  };

  const generateIdeas = async () => {
    setLoadingIdeas(true);
    setIdeas([]);
    try {
      const recentTitles = posts.slice(0, 5).map((p) => `"${p.title}" (${p.format})`).join(", ") || "no recent posts logged";
      const topic = ideaTopic.trim() || "AI governance, ethics, or human-in-the-loop systems";

      const prompt = `Generate 3 LinkedIn post ideas for Syed Tufail Ahmed, an AI Governance thought leader in Riyadh, author of "Human in the Loop." His voice is the "Philosopher-Guardian-Bridge-Builder" — engineering precision with philosophical depth, three-point frameworks, bold opening statements, direct audience challenges. Core conviction: AI should scale human judgment, not substitute it.

Topic focus: ${topic}

Recent posts (avoid duplicating these): ${recentTitles}

Return exactly 3 ideas. Return JSON only with no preamble or markdown fences:
[
  {"format": "Provocation", "hook": "the opening line, sharp and specific", "angle": "1-sentence description of what makes this post land"}
]

Use formats: "Provocation", "Framework", or "Field note". Make at least one a Provocation (disagree with the field). Make hooks specific and risky, not generic.`;

      const text = await callClaude(prompt);
      const cleaned = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      setIdeas(parsed);
    } catch (e) {
      setIdeas([{ format: "Error", hook: "Couldn't generate ideas.", angle: e.message || "Try again." }]);
    }
    setLoadingIdeas(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", color: "var(--ink)", fontFamily: "var(--body)" }}>
      <style>{`
        :root {
          --cream: #FFFFFF;
          --ink: #0B2A5B;
          --gold: #2563EB;
          --rust: #1E40AF;
          --moss: #3B82F6;
          --paper: #F1F5FC;
          --line: #0B2A5B1A;
          --display: 'Fraunces', Georgia, serif;
          --body: 'Inter', -apple-system, system-ui, sans-serif;
          --mono: 'JetBrains Mono', 'Courier New', monospace;
        }
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        .display { font-family: var(--display); font-feature-settings: 'ss01'; }
        .mono { font-family: var(--mono); }
        .slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .fade { animation: fade 0.5s ease-out both; }
        @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
        .grain { position: relative; }
        .grain::before {
          content: ''; position: absolute; inset: 0; pointer-events: none; opacity: 0.4;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0.04 0 0 0 0 0.16 0 0 0 0 0.36 0 0 0 0.06 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        .btn-hover:hover { transform: translateY(-1px); }
        .btn-hover { transition: transform 0.2s; }
        input, select { font-family: var(--body); }
        input:focus, select:focus { outline: 2px solid var(--gold); outline-offset: -1px; }
        .tab-btn { transition: all 0.2s; cursor: pointer; }
        .group .delete-btn { opacity: 0; transition: opacity 0.2s; }
        .group:hover .delete-btn { opacity: 0.6; }
        .group .delete-btn:hover { opacity: 1; }
      `}</style>

      <header style={{ padding: "40px 24px 24px", borderBottom: "1px solid var(--line)" }} className="grain">
        <div style={{ maxWidth: "768px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "4px" }}>
            <span className="mono" style={{ fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)" }}>Signal · v1</span>
            <span className="mono" style={{ fontSize: "12px", color: "var(--ink)", opacity: 0.5 }}>{new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
          </div>
          <h1 className="display" style={{ fontSize: "clamp(40px, 8vw, 64px)", fontWeight: 300, lineHeight: 1, letterSpacing: "-0.02em", color: "var(--ink)", margin: 0 }}>
            What is <em style={{ color: "var(--rust)", fontWeight: 400 }}>actually</em><br />working.
          </h1>
          <p style={{ marginTop: "16px", fontSize: "14px", maxWidth: "440px", color: "var(--ink)", opacity: 0.65 }}>
            A tracker for thought-leadership content. Comments-per-post is the metric that matters — not impressions, not reactions.
          </p>
        </div>
      </header>

      <nav style={{ position: "sticky", top: 0, zIndex: 10, padding: "12px 24px", background: "var(--cream)", borderBottom: "1px solid var(--line)" }}>
        <div style={{ maxWidth: "768px", margin: "0 auto", display: "flex", gap: "4px" }}>
          {[
            { id: "dashboard", label: "Dashboard", icon: BarChart3 },
            { id: "insights", label: "Insights", icon: Sparkles },
            { id: "ideas", label: "Idea Lab", icon: Lightbulb },
          ].map((t) => {
            const Icon = t.icon;
            const active = view === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setView(t.id)}
                className="tab-btn"
                style={{
                  display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", fontSize: "14px",
                  background: active ? "var(--ink)" : "transparent",
                  color: active ? "var(--cream)" : "var(--ink)",
                  border: "1px solid " + (active ? "var(--ink)" : "transparent"),
                  fontWeight: active ? 600 : 500,
                }}
              >
                <Icon size={14} strokeWidth={2} />
                {t.label}
              </button>
            );
          })}
        </div>
      </nav>

      {view === "dashboard" && (
        <main style={{ padding: "32px 24px", maxWidth: "768px", margin: "0 auto" }} className="fade">
          <div style={{ marginBottom: "40px", paddingBottom: "40px", borderBottom: "1px solid var(--line)" }}>
            <div className="mono" style={{ fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px", color: "var(--ink)", opacity: 0.5 }}>North-star metric</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
              <span className="display" style={{ fontSize: "clamp(64px, 12vw, 96px)", fontWeight: 300, lineHeight: 1, color: "var(--rust)" }}>{cpp}</span>
              <span style={{ fontSize: "14px", color: "var(--ink)", opacity: 0.6 }}>comments<br />per post</span>
            </div>
            <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "12px", fontSize: "12px" }}>
              <Target size={12} style={{ color: "var(--gold)" }} />
              <span className="mono" style={{ color: "var(--ink)", opacity: 0.7 }}>Target: 20+ &nbsp;·&nbsp; Below 15 means you're posting too much</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px", marginBottom: "40px" }}>
            {[
              { label: "Posts logged", value: totalPosts, icon: BarChart3 },
              { label: "Total comments", value: totalComments, icon: MessageCircle },
              { label: "Engagement", value: engRate + "%", icon: TrendingUp },
              { label: "Impressions", value: totalImpr.toLocaleString(), icon: Eye },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} style={{ padding: "16px", background: "var(--paper)", border: "1px solid var(--line)" }}>
                  <Icon size={14} style={{ color: "var(--gold)" }} />
                  <div className="display" style={{ fontSize: "30px", fontWeight: 300, marginTop: "8px", color: "var(--ink)" }}>{m.value}</div>
                  <div className="mono" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "4px", color: "var(--ink)", opacity: 0.5 }}>{m.label}</div>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px" }}>
            <h2 className="display" style={{ fontSize: "24px", fontWeight: 400, color: "var(--ink)", margin: 0 }}>Your posts</h2>
            <button
              onClick={() => setShowLogger(true)}
              className="btn-hover"
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", fontSize: "14px", fontWeight: 500, background: "var(--ink)", color: "var(--cream)", border: "none", cursor: "pointer" }}
            >
              <Plus size={14} /> Log a post
            </button>
          </div>

          {posts.length === 0 ? (
            <div style={{ padding: "64px 16px", textAlign: "center", background: "var(--paper)", border: "1px dashed var(--line)" }}>
              <p className="display" style={{ fontSize: "24px", fontWeight: 300, fontStyle: "italic", color: "var(--ink)", opacity: 0.4, margin: 0 }}>No posts logged yet.</p>
              <p style={{ fontSize: "14px", marginTop: "8px", color: "var(--ink)", opacity: 0.5 }}>Start with one. The patterns appear after the second.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {posts.map((p, i) => {
                const isBest = bestPost && p.id === bestPost.id && totalPosts > 1;
                return (
                  <div key={p.id} className="slide-up group" style={{ padding: "16px", display: "flex", alignItems: "flex-start", gap: "16px", background: "var(--paper)", border: "1px solid var(--line)", animationDelay: `${i * 30}ms` }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                        <span className="mono" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 500, color: formatColors[p.format] || "var(--ink)" }}>
                          {p.format}
                        </span>
                        {isBest && <span className="mono" style={{ fontSize: "10px", padding: "2px 8px", background: "var(--gold)", color: "var(--cream)" }}>TOP</span>}
                        <span className="mono" style={{ fontSize: "11px", color: "var(--ink)", opacity: 0.4 }}>· {p.date}</span>
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                      <div className="mono" style={{ marginTop: "8px", display: "flex", gap: "16px", fontSize: "11px", color: "var(--ink)", opacity: 0.7 }}>
                        <span><Eye size={10} style={{ display: "inline", marginRight: "4px" }} />{Number(p.impressions || 0).toLocaleString()}</span>
                        <span><MessageCircle size={10} style={{ display: "inline", marginRight: "4px" }} />{p.comments || 0}</span>
                        <span><Heart size={10} style={{ display: "inline", marginRight: "4px" }} />{p.reactions || 0}</span>
                      </div>
                    </div>
                    <button onClick={() => deletePost(p.id)} className="delete-btn" style={{ padding: "4px", background: "transparent", border: "none", cursor: "pointer", color: "var(--ink)" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      )}

      {view === "insights" && (
        <main style={{ padding: "32px 24px", maxWidth: "768px", margin: "0 auto" }} className="fade">
          <div style={{ marginBottom: "32px" }}>
            <div className="mono" style={{ fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px", color: "var(--gold)" }}>AI-generated · Sonnet 4</div>
            <h2 className="display" style={{ fontSize: "40px", fontWeight: 300, lineHeight: 1.1, color: "var(--ink)", margin: 0 }}>
              Patterns in <em style={{ color: "var(--rust)" }}>your</em> data.
            </h2>
            <p style={{ fontSize: "14px", marginTop: "12px", color: "var(--ink)", opacity: 0.65 }}>
              Direct, specific feedback on what's working and what isn't. No reassurance.
            </p>
          </div>

          <button
            onClick={generateInsight}
            disabled={loadingInsight}
            className="btn-hover"
            style={{ width: "100%", padding: "16px", marginBottom: "24px", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--ink)", color: "var(--cream)", opacity: loadingInsight ? 0.6 : 1, border: "none", cursor: "pointer" }}
          >
            <span style={{ fontWeight: 500, fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              {loadingInsight ? <Loader2 className="animate-spin" size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Sparkles size={14} />}
              {loadingInsight ? "Reading your data..." : insight ? "Generate a new insight" : "Generate insight"}
            </span>
            <span className="mono" style={{ fontSize: "12px", opacity: 0.7 }}>→</span>
          </button>
          <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>

          {insight && (
            <div className="slide-up" style={{ padding: "24px", background: "var(--paper)", border: "1px solid var(--line)", borderLeft: "3px solid var(--rust)" }}>
              <p className="display" style={{ fontSize: "20px", fontWeight: 300, lineHeight: 1.5, color: "var(--ink)", margin: 0 }}>{insight}</p>
            </div>
          )}

          {posts.length < 2 && !insight && (
            <p style={{ fontSize: "14px", fontStyle: "italic", marginTop: "16px", color: "var(--ink)", opacity: 0.5 }}>
              Log at least 2 posts on the Dashboard tab to unlock pattern analysis.
            </p>
          )}
        </main>
      )}

      {view === "ideas" && (
        <main style={{ padding: "32px 24px", maxWidth: "768px", margin: "0 auto" }} className="fade">
          <div style={{ marginBottom: "32px" }}>
            <div className="mono" style={{ fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px", color: "var(--gold)" }}>Post idea generator</div>
            <h2 className="display" style={{ fontSize: "40px", fontWeight: 300, lineHeight: 1.1, color: "var(--ink)", margin: 0 }}>
              Three sharper<br />angles, on demand.
            </h2>
            <p style={{ fontSize: "14px", marginTop: "12px", color: "var(--ink)", opacity: 0.65 }}>
              Tuned to your voice. One provocation guaranteed in every batch.
            </p>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label className="mono" style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px", display: "block", color: "var(--ink)", opacity: 0.6 }}>
              Topic focus (optional)
            </label>
            <input
              value={ideaTopic}
              onChange={(e) => setIdeaTopic(e.target.value)}
              placeholder="e.g. SDAIA's new framework, healthcare AI..."
              style={{ width: "100%", padding: "12px", fontSize: "14px", background: "var(--paper)", border: "1px solid var(--line)", color: "var(--ink)" }}
            />
          </div>

          <button
            onClick={generateIdeas}
            disabled={loadingIdeas}
            className="btn-hover"
            style={{ width: "100%", padding: "16px", marginBottom: "24px", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--rust)", color: "var(--cream)", opacity: loadingIdeas ? 0.6 : 1, border: "none", cursor: "pointer" }}
          >
            <span style={{ fontWeight: 500, fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              {loadingIdeas ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Lightbulb size={14} />}
              {loadingIdeas ? "Generating angles..." : "Generate 3 ideas"}
            </span>
            <span className="mono" style={{ fontSize: "12px", opacity: 0.7 }}>→</span>
          </button>

          {ideas.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {ideas.map((idea, i) => (
                <div key={i} className="slide-up" style={{ padding: "20px", background: "var(--paper)", border: "1px solid var(--line)", animationDelay: `${i * 80}ms` }}>
                  <div className="mono" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 500, marginBottom: "12px", color: formatColors[idea.format] || "var(--ink)" }}>
                    {idea.format}
                  </div>
                  <p className="display" style={{ fontSize: "20px", fontWeight: 400, lineHeight: 1.3, marginBottom: "12px", color: "var(--ink)", margin: "0 0 12px" }}>
                    "{idea.hook}"
                  </p>
                  <p style={{ fontSize: "14px", fontStyle: "italic", color: "var(--ink)", opacity: 0.65, margin: 0 }}>
                    {idea.angle}
                  </p>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {showLogger && <PostLogger onSave={addPost} onClose={() => setShowLogger(false)} />}

      <footer style={{ padding: "48px 0", textAlign: "center", fontSize: "11px", color: "var(--ink)", opacity: 0.4 }} className="mono">
        Built for Syed · Data lives in your browser
      </footer>
    </div>
  );
}

function PostLogger({ onSave, onClose }) {
  const [form, setForm] = useState({
    title: "",
    format: "Provocation",
    date: new Date().toISOString().slice(0, 10),
    impressions: "",
    comments: "",
    reactions: "",
  });

  const submit = () => {
    if (!form.title.trim()) return;
    onSave(form);
  };

  return (
    <div className="fade" style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", background: "rgba(11, 42, 91, 0.4)" }}>
      <div className="slide-up" style={{ width: "100%", maxWidth: "512px", background: "var(--cream)", border: "1px solid var(--line)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px", borderBottom: "1px solid var(--line)" }}>
          <h3 className="display" style={{ fontSize: "24px", fontWeight: 400, color: "var(--ink)", margin: 0 }}>Log a post</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink)" }}><X size={18} /></button>
        </div>
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <Field label="Working title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="e.g. Frameworks don't govern systems" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label className="mono" style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px", display: "block", color: "var(--ink)", opacity: 0.6 }}>Format</label>
              <select
                value={form.format}
                onChange={(e) => setForm({ ...form, format: e.target.value })}
                style={{ width: "100%", padding: "12px", fontSize: "14px", background: "var(--paper)", border: "1px solid var(--line)", color: "var(--ink)" }}
              >
                <option>Provocation</option>
                <option>Framework</option>
                <option>Field note</option>
                <option>Newsletter</option>
              </select>
            </div>
            <Field label="Date" type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <Field label="Impressions" type="number" value={form.impressions} onChange={(v) => setForm({ ...form, impressions: v })} placeholder="0" />
            <Field label="Comments" type="number" value={form.comments} onChange={(v) => setForm({ ...form, comments: v })} placeholder="0" />
            <Field label="Reactions" type="number" value={form.reactions} onChange={(v) => setForm({ ...form, reactions: v })} placeholder="0" />
          </div>
        </div>
        <div style={{ padding: "20px", display: "flex", gap: "12px", borderTop: "1px solid var(--line)" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px", fontSize: "14px", border: "1px solid var(--line)", background: "transparent", color: "var(--ink)", cursor: "pointer" }}>Cancel</button>
          <button onClick={submit} style={{ flex: 1, padding: "12px", fontSize: "14px", fontWeight: 500, background: "var(--ink)", color: "var(--cream)", border: "none", cursor: "pointer" }}>Save post</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div>
      <label className="mono" style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "8px", display: "block", color: "var(--ink)", opacity: 0.6 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: "100%", padding: "12px", fontSize: "14px", background: "var(--paper)", border: "1px solid var(--line)", color: "var(--ink)" }}
      />
    </div>
  );
}
