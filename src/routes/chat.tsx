import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ImagePlus,
  Leaf,
  Mic,
  Plus,
  Send,
  Sparkles,
  Trash2,
  X,
  Droplets,
  Thermometer,
  FlaskConical,
  Activity,
  ShieldAlert,
  Menu,
} from "lucide-react";
import { chatWithElkar, type ElkarChatMessage } from "@/utils/elkar-chat.functions";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
  head: () => ({
    meta: [
      { title: "ELKAR · Mentor Botánico IA · PlantIQ" },
      { name: "description", content: "Habla con ELKAR, tu mentor botánico IA experto en cultivo de cannabis. Diagnóstico por foto, plan nutricional y acompañamiento 24/7." },
    ],
  }),
});

type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
  ts: number;
};

type Thread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: Msg[];
};

const STORAGE_KEY = "plantiq.elkar.threads.v1";

const WELCOME: Msg = {
  id: "welcome",
  role: "assistant",
  ts: Date.now(),
  content:
    "Hola. Soy **ELKAR**. Tu mentor botánico inteligente.\n\nCuéntame qué le ocurre a tu planta o sube una fotografía y empezaré el diagnóstico.",
};

const ANALYSIS_STEPS = [
  "Analizando estructura foliar…",
  "Detectando posibles carencias…",
  "Comprobando estrés lumínico…",
  "Evaluando turgencia y color…",
  "Cruzando con base de datos botánica…",
];

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function loadThreads(): Thread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Thread[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveThreads(threads: Thread[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  } catch {
    /* ignore quota */
  }
}

function deriveTitle(text: string) {
  const t = text.trim().replace(/\s+/g, " ");
  return t.length > 42 ? t.slice(0, 42) + "…" : t || "Nueva consulta";
}

async function fileToDataUrl(file: File, max = 1400): Promise<string> {
  const reader = new FileReader();
  const dataUrl: string = await new Promise((resolve, reject) => {
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  // Downscale via canvas
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = dataUrl;
  });
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  return c.toDataURL("image/jpeg", 0.85);
}

function ChatPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [analysisIdx, setAnalysisIdx] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false);
  const [recording, setRecording] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Bootstrap (idempotent)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const existing = loadThreads();
    if (existing.length > 0) {
      setThreads(existing);
      setActiveId(existing[0].id);
    } else {
      const t: Thread = {
        id: uid(),
        title: "Nueva consulta",
        updatedAt: Date.now(),
        messages: [WELCOME],
      };
      setThreads([t]);
      setActiveId(t.id);
      saveThreads([t]);
    }
  }, []);

  const active = useMemo(
    () => threads.find((t) => t.id === activeId) ?? null,
    [threads, activeId],
  );

  // Scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length, sending, analysisIdx]);

  // Rotate analysis messages while sending an image
  useEffect(() => {
    if (!sending || !pendingImageRef.current) return;
    const i = setInterval(
      () => setAnalysisIdx((x) => (x + 1) % ANALYSIS_STEPS.length),
      1100,
    );
    return () => clearInterval(i);
  }, [sending]);

  // Track image presence at send time
  const pendingImageRef = useRef<string | null>(null);
  useEffect(() => {
    pendingImageRef.current = pendingImage;
  }, [pendingImage]);

  // Focus textarea
  useEffect(() => {
    taRef.current?.focus();
  }, [activeId]);

  function persist(next: Thread[]) {
    setThreads(next);
    saveThreads(next);
  }

  function newThread() {
    const t: Thread = {
      id: uid(),
      title: "Nueva consulta",
      updatedAt: Date.now(),
      messages: [{ ...WELCOME, id: uid(), ts: Date.now() }],
    };
    persist([t, ...threads]);
    setActiveId(t.id);
    setShowSidebar(false);
    setInput("");
    setPendingImage(null);
  }

  function deleteThread(id: string) {
    const next = threads.filter((t) => t.id !== id);
    if (next.length === 0) {
      newThread();
      return;
    }
    persist(next);
    if (id === activeId) setActiveId(next[0].id);
  }

  async function pickImage(file: File | null) {
    if (!file) return;
    try {
      const url = await fileToDataUrl(file);
      setPendingImage(url);
    } catch {
      /* ignore */
    }
  }

  async function send() {
    if (sending) return;
    const text = input.trim();
    if (!text && !pendingImage) return;
    if (!active) return;

    const userMsg: Msg = {
      id: uid(),
      role: "user",
      content: text || (pendingImage ? "📸 Foto del cultivo" : ""),
      image: pendingImage ?? undefined,
      ts: Date.now(),
    };

    const updatedActive: Thread = {
      ...active,
      title:
        active.messages.length <= 1
          ? deriveTitle(text || "Foto del cultivo")
          : active.title,
      updatedAt: Date.now(),
      messages: [...active.messages, userMsg],
    };
    const nextThreads = threads.map((t) => (t.id === active.id ? updatedActive : t));
    persist(nextThreads);
    setInput("");
    const sentImage = pendingImage;
    setPendingImage(null);
    setSending(true);
    setAnalysisIdx(0);

    const payload: ElkarChatMessage[] = updatedActive.messages.map((m) => ({
      role: m.role,
      content: m.content,
      ...(m.image ? { imageBase64: m.image } : {}),
    }));

    try {
      const res = await chatWithElkar({ data: { messages: payload } });
      const reply =
        res.ok
          ? res.reply
          : `⚠️ ${res.error}`;
      const botMsg: Msg = {
        id: uid(),
        role: "assistant",
        content: reply,
        ts: Date.now(),
      };
      const finalThread: Thread = {
        ...updatedActive,
        updatedAt: Date.now(),
        messages: [...updatedActive.messages, botMsg],
      };
      persist(threads.map((t) => (t.id === active.id ? finalThread : t)));
    } catch (e) {
      const botMsg: Msg = {
        id: uid(),
        role: "assistant",
        content: "⚠️ No he podido conectar. Intenta de nuevo en un momento.",
        ts: Date.now(),
      };
      const finalThread: Thread = {
        ...updatedActive,
        messages: [...updatedActive.messages, botMsg],
      };
      persist(threads.map((t) => (t.id === active.id ? finalThread : t)));
    } finally {
      setSending(false);
      void sentImage;
      setTimeout(() => taRef.current?.focus(), 50);
    }
  }

  return (
    <main className="relative min-h-[100dvh] bg-background text-foreground overflow-hidden flex">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-gold/[0.06] blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-background/85 backdrop-blur-xl border-r border-gold/15 transform transition-transform duration-300 md:translate-x-0 ${showSidebar ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-4 border-b border-gold/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-leaf-card border border-gold/30 flex items-center justify-center">
              <Leaf className="h-3.5 w-3.5 text-gold" />
            </span>
            <span className="font-serif text-lg">
              Plant<span className="text-gold">IQ</span>
            </span>
          </div>
          <button
            onClick={() => setShowSidebar(false)}
            className="md:hidden p-1.5 rounded-md hover:bg-secondary/60"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3">
          <button
            onClick={newThread}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gold text-gold-foreground text-sm font-medium shadow-gold-glow hover:opacity-95 transition"
          >
            <Plus className="h-4 w-4" /> Nueva conversación
          </button>
        </div>

        <div className="px-3 pb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Historial
        </div>
        <div className="px-2 pb-4 space-y-1 overflow-y-auto max-h-[calc(100dvh-180px)]">
          {threads.map((t) => (
            <div
              key={t.id}
              className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition border ${
                t.id === activeId
                  ? "bg-gold/[0.08] border-gold/30"
                  : "border-transparent hover:bg-secondary/40"
              }`}
              onClick={() => {
                setActiveId(t.id);
                setShowSidebar(false);
              }}
            >
              <Sparkles className="h-3.5 w-3.5 text-gold flex-shrink-0" />
              <span className="flex-1 truncate text-sm">{t.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteThread(t.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition"
                aria-label="Borrar"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {showSidebar && (
        <button
          aria-label="Cerrar menú"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main column */}
      <section className="relative z-10 flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b border-gold/15 backdrop-blur-xl bg-background/60">
          <div className="px-4 sm:px-6 h-16 flex items-center gap-3">
            <Link
              to="/"
              className="p-2 rounded-lg hover:bg-secondary/60 transition"
              aria-label="Volver"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <button
              onClick={() => setShowSidebar(true)}
              className="md:hidden p-2 rounded-lg hover:bg-secondary/60"
              aria-label="Historial"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3 min-w-0">
              <span className="relative h-9 w-9 rounded-full bg-leaf-card border border-gold/30 flex items-center justify-center flex-shrink-0">
                <Leaf className="h-4 w-4 text-gold" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-background animate-pulse" />
              </span>
              <div className="min-w-0">
                <div className="font-serif text-base leading-tight truncate">
                  ELKAR <span className="text-gold italic">AI</span>
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-400/90 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Mentor Botánico · Conectado
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Vital cards */}
        <div className="px-4 sm:px-6 pt-3 pb-1 grid grid-cols-5 gap-2 max-w-3xl w-full mx-auto">
          {[
            { label: "Humedad", value: "55%", icon: Droplets },
            { label: "pH", value: "6.2", icon: FlaskConical },
            { label: "EC", value: "1.4", icon: Activity },
            { label: "Temp.", value: "24°", icon: Thermometer },
            { label: "Riesgo", value: "Bajo", icon: ShieldAlert },
          ].map((c) => (
            <div
              key={c.label}
              className="rounded-xl border border-gold/15 bg-background/40 backdrop-blur-md px-2 py-2 text-center"
            >
              <c.icon className="h-3 w-3 text-gold mx-auto mb-1" />
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {c.label}
              </div>
              <div className="text-xs font-medium mt-0.5">{c.value}</div>
            </div>
          ))}
        </div>

        {/* Conversation */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          <div className="max-w-3xl mx-auto space-y-5">
            {active?.messages.map((m) => (
              <MessageBubble key={m.id} msg={m} />
            ))}
            {sending && (
              <div className="flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-2">
                <BotAvatar />
                <div className="rounded-2xl rounded-tl-sm border border-gold/20 bg-background/50 backdrop-blur-md px-4 py-3 shadow-card-soft">
                  {pendingImageRef.current ? (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="relative inline-flex h-2 w-2">
                        <span className="absolute inset-0 rounded-full bg-gold animate-ping" />
                        <span className="relative h-2 w-2 rounded-full bg-gold" />
                      </span>
                      <span className="text-foreground/80">
                        {ANALYSIS_STEPS[analysisIdx]}
                      </span>
                    </div>
                  ) : (
                    <TypingDots />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-gold/15 backdrop-blur-xl bg-background/70 px-3 sm:px-6 py-3">
          <div className="max-w-3xl mx-auto">
            {pendingImage && (
              <div className="mb-2 flex items-center gap-2">
                <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-gold/30">
                  <img src={pendingImage} alt="" className="object-cover w-full h-full" />
                  <button
                    onClick={() => setPendingImage(null)}
                    className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-black/70 flex items-center justify-center"
                    aria-label="Quitar imagen"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
                <div className="text-xs text-muted-foreground">Foto lista para enviar</div>
              </div>
            )}
            <div className="flex items-end gap-2 rounded-2xl border border-gold/25 bg-background/60 backdrop-blur-md px-2 py-2 shadow-card-soft focus-within:border-gold/50 transition">
              <button
                onClick={() => fileRef.current?.click()}
                className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-gold/10 text-muted-foreground hover:text-gold transition"
                aria-label="Subir imagen"
                disabled={sending}
              >
                <ImagePlus className="h-5 w-5" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  pickImage(e.target.files?.[0] ?? null);
                  e.target.value = "";
                }}
              />
              <textarea
                ref={taRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                rows={1}
                placeholder="Describe el problema de tu cultivo…"
                className="flex-1 resize-none bg-transparent outline-none text-sm py-2.5 max-h-32 placeholder:text-muted-foreground/70"
                disabled={sending}
              />
              <button
                onMouseDown={() => setRecording(true)}
                onMouseUp={() => setRecording(false)}
                onMouseLeave={() => setRecording(false)}
                className={`h-10 w-10 flex items-center justify-center rounded-xl transition ${
                  recording
                    ? "bg-destructive/20 text-destructive"
                    : "hover:bg-gold/10 text-muted-foreground hover:text-gold"
                }`}
                aria-label="Hablar"
                title="Mantén pulsado para hablar (próximamente)"
                disabled={sending}
              >
                <Mic className="h-5 w-5" />
              </button>
              <button
                onClick={() => void send()}
                disabled={sending || (!input.trim() && !pendingImage)}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-gold text-gold-foreground shadow-gold-glow hover:opacity-95 disabled:opacity-40 transition"
                aria-label="Enviar"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-1.5 text-[10px] text-center text-muted-foreground/70">
              ELKAR es un mentor IA. Verifica siempre dosis y tratamientos antes de aplicar.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function BotAvatar() {
  return (
    <span className="h-8 w-8 rounded-full bg-leaf-card border border-gold/30 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Leaf className="h-3.5 w-3.5 text-gold" />
    </span>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      <span className="h-1.5 w-1.5 rounded-full bg-gold/80 animate-bounce [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-gold/80 animate-bounce [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-gold/80 animate-bounce" />
    </div>
  );
}

function renderMarkdownLite(text: string) {
  // Minimal markdown: **bold**, *italic*, lists, line breaks. Safe (no HTML).
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lines = text.split("\n");
  const out: string[] = [];
  let inList = false;
  for (const raw of lines) {
    const line = escape(raw);
    const isBullet = /^\s*[-*•]\s+/.test(line);
    const isNum = /^\s*\d+[.)]\s+/.test(line);
    if (isBullet || isNum) {
      if (!inList) {
        out.push(isNum ? "<ol class='list-decimal pl-5 space-y-1 my-1'>" : "<ul class='list-disc pl-5 space-y-1 my-1'>");
        inList = true;
      }
      const stripped = line.replace(/^\s*([-*•]|\d+[.)])\s+/, "");
      out.push(`<li>${inline(stripped)}</li>`);
    } else {
      if (inList) {
        out.push(inList ? (out[out.length - 1]?.startsWith("<li") ? "" : "") : "");
        out.push("</ul></ol>".includes("ol") ? "</ol>" : "</ul>");
        inList = false;
      }
      if (line.trim() === "") out.push("<br/>");
      else out.push(`<p class='my-1'>${inline(line)}</p>`);
    }
  }
  if (inList) out.push("</ul>");
  return out.join("");

  function inline(s: string) {
    return s
      .replace(/\*\*([^*]+)\*\*/g, "<strong class='text-gold'>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code class='px-1 rounded bg-secondary/60 text-xs'>$1</code>");
  }
}

function MessageBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  if (isUser) {
    return (
      <div className="flex justify-end animate-in fade-in slide-in-from-bottom-1">
        <div className="max-w-[82%] rounded-2xl rounded-tr-sm bg-gold text-gold-foreground px-4 py-2.5 shadow-card-soft">
          {msg.image && (
            <img
              src={msg.image}
              alt=""
              className="rounded-lg mb-2 max-h-60 w-auto border border-black/10"
            />
          )}
          {msg.content && <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-1">
      <BotAvatar />
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-gold/20 bg-background/50 backdrop-blur-md px-4 py-3 shadow-card-soft">
        <div className="text-[10px] uppercase tracking-[0.2em] text-gold mb-1">ELKAR</div>
        <div
          className="text-sm text-foreground/90 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderMarkdownLite(msg.content) }}
        />
      </div>
    </div>
  );
}