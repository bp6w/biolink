(function () {
  const FILE_COMMENT = `// edit this or use settings.html and paste the downloaded file back here
`;

  const PREFIX_KEY = "terminal-biolink-settings-asset-prefix";

  function normPrefix(raw) {
    let s = String(raw ?? "")
      .trim()
      .replace(/\\/g, "/");
    if (!s) return "";
    if (!s.endsWith("/")) s += "/";
    return s;
  }

  function pathForFile(file) {
    return normPrefix(document.getElementById("asset-prefix").value) + file.name;
  }

  function basenameNoExt(name) {
    const n = String(name);
    const i = n.lastIndexOf(".");
    return i > 0 ? n.slice(0, i) : n;
  }

  function loadPrefix() {
    const el = document.getElementById("asset-prefix");
    if (!el) return;
    const saved = localStorage.getItem(PREFIX_KEY);
    el.value = saved != null ? saved : "assets/";
  }

  function savePrefix() {
    const el = document.getElementById("asset-prefix");
    if (el) localStorage.setItem(PREFIX_KEY, el.value);
  }

  // wire <input type=file> + button -> text field (browser won't give real paths)
  function hookPicker(opts) {
    const file = document.getElementById(opts.fileInputId);
    const btn = document.getElementById(opts.buttonId);
    const path = document.getElementById(opts.pathInputId);
    const note = opts.pickedId ? document.getElementById(opts.pickedId) : null;
    if (!file || !btn || !path) return;

    btn.addEventListener("click", () => file.click());

    file.addEventListener("change", () => {
      const f = file.files && file.files[0];
      file.value = "";
      if (!f) return;
      path.value = pathForFile(f);
      if (note) note.textContent = "picked: " + f.name;
      if (opts.onPicked) opts.onPicked(f);
      savePrefix();
      setStatus("path set — make sure that file actually lives in the repo folder");
    });
  }

  function emptyCfg() {
    return {
      entry: { title: "", subtitle: "" },
      avatar: { src: "", alt: "" },
      music: { src: "", label: "", volume: 0.8, autoplay: true },
      user: "guest",
      host: "bio",
      siteName: "my.bio",
      welcome: "",
      socials: [],
      projects: [],
    };
  }

  function readCfg() {
    const c = window.PORTFOLIO_CONFIG;
    if (c && typeof c === "object") return JSON.parse(JSON.stringify(c));
    return emptyCfg();
  }

  const socialWrap = document.getElementById("social-rows");
  const projectWrap = document.getElementById("project-rows");
  const statusEl = document.getElementById("settings-status");

  function setStatus(msg, bad) {
    statusEl.textContent = msg || "";
    statusEl.style.color = bad ? "var(--text-error)" : "var(--text-success)";
  }

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function addSocialRow(data) {
    const row = document.createElement("div");
    row.className = "settings-row social-row";
    row.innerHTML = `
      <div class="settings-field">
        <label>Label</label>
        <input type="text" class="social-label" value="${esc(data?.label)}" spellcheck="false" />
      </div>
      <div class="settings-field">
        <label>URL</label>
        <input type="text" class="social-url" value="${esc(data?.url)}" spellcheck="false" />
      </div>
      <button type="button" class="settings-btn danger social-remove">remove</button>
    `;
    row.querySelector(".social-remove").addEventListener("click", () => row.remove());
    socialWrap.appendChild(row);
  }

  function addProjectRow(data) {
    const row = document.createElement("div");
    row.className = "settings-row project-row";
    row.innerHTML = `
      <div class="settings-field">
        <label>Name</label>
        <input type="text" class="proj-name" value="${esc(data?.name)}" spellcheck="false" />
      </div>
      <div class="settings-field">
        <label>Description</label>
        <input type="text" class="proj-desc" value="${esc(data?.desc)}" spellcheck="false" />
      </div>
      <div class="settings-field">
        <label>URL (optional)</label>
        <input type="text" class="proj-url" value="${esc(data?.url)}" spellcheck="false" />
      </div>
      <button type="button" class="settings-btn danger proj-remove">remove</button>
    `;
    row.querySelector(".proj-remove").addEventListener("click", () => row.remove());
    projectWrap.appendChild(row);
  }

  function formToConfig() {
    const cfg = emptyCfg();
    cfg.entry = {
      title: document.getElementById("entry-title").value.trim(),
      subtitle: document.getElementById("entry-subtitle").value.trim(),
    };
    cfg.avatar = {
      src: document.getElementById("avatar-src").value.trim(),
      alt: document.getElementById("avatar-alt").value.trim(),
    };
    const vol = parseFloat(document.getElementById("music-volume").value);
    cfg.music = {
      src: document.getElementById("music-src").value.trim(),
      label: document.getElementById("music-label").value.trim(),
      volume: Number.isFinite(vol) ? Math.min(1, Math.max(0, vol)) : 0.8,
      autoplay: document.getElementById("music-autoplay").checked,
    };
    cfg.user = document.getElementById("user").value.trim() || "guest";
    cfg.host = document.getElementById("host").value.trim() || "bio";
    cfg.siteName = document.getElementById("site-name").value.trim() || "my.bio";
    cfg.welcome = document.getElementById("welcome").value;

    cfg.socials = [];
    socialWrap.querySelectorAll(".social-row").forEach((row) => {
      const label = row.querySelector(".social-label").value.trim();
      const url = row.querySelector(".social-url").value.trim();
      if (label || url) cfg.socials.push({ label, url });
    });

    cfg.projects = [];
    projectWrap.querySelectorAll(".project-row").forEach((row) => {
      const name = row.querySelector(".proj-name").value.trim();
      const desc = row.querySelector(".proj-desc").value.trim();
      const url = row.querySelector(".proj-url").value.trim();
      if (name || desc || url) cfg.projects.push({ name, desc, url });
    });

    return cfg;
  }

  function toFile(cfg) {
    const json = JSON.stringify(cfg, null, 2);
    return `${FILE_COMMENT}window.PORTFOLIO_CONFIG = ${json};\n`;
  }

  function fillForm(cfg) {
    document.getElementById("entry-title").value = cfg.entry?.title ?? "";
    document.getElementById("entry-subtitle").value = cfg.entry?.subtitle ?? "";
    document.getElementById("avatar-src").value = cfg.avatar?.src ?? "";
    document.getElementById("avatar-alt").value = cfg.avatar?.alt ?? "";
    const ap = document.getElementById("avatar-picked");
    const mp = document.getElementById("music-picked");
    if (ap) ap.textContent = "";
    if (mp) mp.textContent = "";
    document.getElementById("music-src").value = cfg.music?.src ?? "";
    document.getElementById("music-label").value = cfg.music?.label ?? "";
    document.getElementById("music-volume").value =
      cfg.music?.volume !== undefined ? String(cfg.music.volume) : "0.8";
    document.getElementById("music-autoplay").checked = cfg.music?.autoplay !== false;
    document.getElementById("user").value = cfg.user ?? "";
    document.getElementById("host").value = cfg.host ?? "";
    document.getElementById("site-name").value = cfg.siteName ?? "";
    document.getElementById("welcome").value = cfg.welcome ?? "";

    socialWrap.innerHTML = "";
    const socials = Array.isArray(cfg.socials) ? cfg.socials : [];
    if (socials.length === 0) addSocialRow({ label: "", url: "" });
    else socials.forEach((s) => addSocialRow(s));

    projectWrap.innerHTML = "";
    const projects = Array.isArray(cfg.projects) ? cfg.projects : [];
    if (projects.length === 0) addProjectRow({ name: "", desc: "", url: "" });
    else projects.forEach((p) => addProjectRow(p));
  }

  document.getElementById("btn-add-social").addEventListener("click", () => addSocialRow({ label: "", url: "" }));
  document.getElementById("btn-add-project").addEventListener("click", () =>
    addProjectRow({ name: "", desc: "", url: "" })
  );

  const prefixEl = document.getElementById("asset-prefix");
  if (prefixEl) {
    prefixEl.addEventListener("change", savePrefix);
    prefixEl.addEventListener("blur", savePrefix);
  }

  hookPicker({
    fileInputId: "avatar-file",
    buttonId: "btn-pick-avatar",
    pathInputId: "avatar-src",
    pickedId: "avatar-picked",
    onPicked(file) {
      const alt = document.getElementById("avatar-alt");
      if (alt && !alt.value.trim()) alt.value = basenameNoExt(file.name);
    },
  });

  hookPicker({
    fileInputId: "music-file",
    buttonId: "btn-pick-music",
    pathInputId: "music-src",
    pickedId: "music-picked",
    onPicked(file) {
      const label = document.getElementById("music-label");
      if (label && !label.value.trim()) label.value = basenameNoExt(file.name);
    },
  });

  document.getElementById("btn-download").addEventListener("click", () => {
    const cfg = formToConfig();
    const text = toFile(cfg);
    const blob = new Blob([text], { type: "application/javascript;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "config.js";
    a.click();
    URL.revokeObjectURL(a.href);
    setStatus("downloaded — overwrite config.js in the repo");
  });

  document.getElementById("btn-copy").addEventListener("click", async () => {
    const cfg = formToConfig();
    const text = toFile(cfg);
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("clipboard blocked, use download", true);
    }
  });

  function boot() {
    loadPrefix();
    try {
      fillForm(readCfg());
    } catch (err) {
      setStatus("config.js broken, showing blanks", true);
      fillForm(emptyCfg());
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
