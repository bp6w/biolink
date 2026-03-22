document.addEventListener("DOMContentLoaded", () => {
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  const cfg = window.PORTFOLIO_CONFIG || {};
  const user = cfg.user || "guest";
  const host = cfg.host || "bio";
  const siteName = cfg.siteName || "bio.link";

  document.title = siteName;

  const brandEl = document.getElementById("site-brand");
  if (brandEl) {
    const dot = siteName.indexOf(".");
    if (dot > 0) {
      brandEl.innerHTML =
        `${escapeHtml(siteName.slice(0, dot))}<span class="logo-dot">.</span>${escapeHtml(siteName.slice(dot + 1))}`;
    } else {
      brandEl.textContent = siteName;
    }
  }

  const winTitle = document.querySelector(".window-title");
  if (winTitle) winTitle.textContent = `${user}@${host}:~`;

  const entry = cfg.entry || {};
  const entryTitle = document.getElementById("entry-title");
  const entrySub = document.getElementById("entry-subtitle");
  const avatarImg = document.getElementById("avatar-img");
  if (entryTitle) entryTitle.textContent = entry.title ?? "";
  if (entrySub) entrySub.textContent = entry.subtitle ?? "";

  const av = cfg.avatar || {};
  if (avatarImg) {
    if (av.src) {
      avatarImg.src = av.src;
      avatarImg.alt = av.alt || "";
    } else {
      avatarImg.removeAttribute("src");
      avatarImg.alt = "";
    }
  }

  const exitCode = String(Math.floor(1000 + Math.random() * 9000));

  const historyEl = document.getElementById("history");
  const form = document.getElementById("command-form");
  const input = document.getElementById("cmd-input");
  const promptEl = document.getElementById("prompt");
  const terminalBody = document.getElementById("terminal-body");

  const cmdHistory = [];
  let histPos = 0;
  let draft = "";

  function getPromptText() {
    return `${user}@${host}:~$`;
  }

  function setPrompt() {
    promptEl.textContent = getPromptText();
  }

  function scrollEnd() {
    terminalBody.scrollTo({ top: terminalBody.scrollHeight, behavior: "smooth" });
  }

  function typeOut(el, html) {
    el.innerHTML = html;
    el.style.opacity = 0;
    setTimeout(() => {
      el.style.transition = "opacity 0.2s";
      el.style.opacity = 1;
      scrollEnd();
    }, 10);
  }

  function appendBlock(className, html) {
    const div = document.createElement("div");
    div.className = `block ${className}`;
    historyEl.appendChild(div);
    typeOut(div, html);
    scrollEnd();
  }

  function appendCmd(line) {
    appendBlock(
      "block-cmd",
      `<span class="prompt-text">${escapeHtml(getPromptText())}</span><span class="typed">${escapeHtml(line)}</span>`
    );
  }

  function appendOut(text, isHtml = false) {
    appendBlock("block-out", isHtml ? text : escapeHtml(text));
  }

  function appendWarn(text) {
    appendBlock("block-warn", escapeHtml(text));
  }

  function appendErr(msg) {
    appendBlock("block-err", escapeHtml(msg));
  }

  function runHelp() {
    const rows = [
      ["socials", "Links you listed in config"],
      ["projects", "Same deal, projects list"],
      ["clear", "Wipe the scrollback"],
      ["help", "This list"],
      ["exit", "Fake disconnect / close tab tricks"],
    ];
    const pad = Math.max(...rows.map((r) => r[0].length)) + 4;
    const body = rows
      .map(([cmd, desc]) => `${cmd.padEnd(pad)} <span style="color:var(--text-muted)">// ${desc}</span>`)
      .join("\n");
    appendOut(body, true);
  }

  function runSocials() {
    const list = cfg.socials || [];
    if (!list.length) return appendOut("Nothing in socials yet.", false);

    promptLoading("resolving…");
    setTimeout(() => {
      removeLoading();
      const lines = list.map(
        (s) => `  [+] <a href="${escapeHtml(s.url)}" rel="noopener noreferrer" target="_blank">${escapeHtml(s.label)}</a>`
      );
      appendOut(lines.join("\n"), true);
    }, 400);
  }

  function runProjects() {
    const items = cfg.projects || [];
    if (!items.length) return appendOut("No projects in config.", false);

    promptLoading("loading…");
    setTimeout(() => {
      removeLoading();
      const blocks = items.map((p) => {
        const link =
          p.url && String(p.url).trim()
            ? `<a href="${escapeHtml(p.url)}" rel="noopener noreferrer" target="_blank">${escapeHtml(p.name)}</a>`
            : `<span style="color:var(--text-accent); font-weight:600;">${escapeHtml(p.name)}</span>`;
        return `${link}\n      <span style="color:var(--text-muted)">${escapeHtml(p.desc || "—")}</span>`;
      });
      appendOut(blocks.join("\n\n"), true);
    }, 400);
  }

  function runClear() {
    historyEl.innerHTML = "";
    if (cfg.welcome) appendOut(cfg.welcome, false);
    scrollEnd();
  }

  function runExit() {
    appendWarn(
      `Really kill this session?\nType "exit confirm" or paste [${exitCode}] to try closing the tab.\n"exit soft" just prints a line.`
    );
  }

  let loadingEl = null;
  function promptLoading(msg) {
    loadingEl = document.createElement("div");
    loadingEl.className = "block block-out";
    loadingEl.innerHTML = `<span style="color:var(--text-accent)">[~]</span> ${msg}`;
    historyEl.appendChild(loadingEl);
    scrollEnd();
  }

  function removeLoading() {
    if (loadingEl) {
      loadingEl.remove();
      loadingEl = null;
    }
  }

  function executeCommand(raw) {
    const line = raw.trim();
    if (!line) return;

    cmdHistory.push(line);
    if (cmdHistory.length > 50) cmdHistory.shift();
    histPos = cmdHistory.length;
    draft = "";

    appendCmd(line);

    if (line === exitCode || line === "exit confirm") {
      appendOut("ok, bye.", false);
      setTimeout(() => {
        try {
          window.close();
        } catch (e) {}
      }, 800);
      return;
    }

    const parts = line.split(/\s+/);
    const key = parts[0].toLowerCase();

    switch (key) {
      case "help":
        runHelp();
        break;
      case "social":
      case "socials":
        runSocials();
        break;
      case "project":
      case "projects":
        runProjects();
        break;
      case "clear":
      case "cls":
        runClear();
        break;
      case "exit":
      case "quit":
        if (parts[1] === "soft") {
          appendOut("soft exit (nothing actually closed)", false);
        } else {
          runExit();
        }
        break;
      default:
        appendErr(`unknown: ${escapeHtml(key)}\n(tab completion not implemented, try help)`);
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = input.value;
    input.value = "";
    updateCursor();
    executeCommand(v);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (histPos === cmdHistory.length) draft = input.value;
      if (histPos > 0) {
        histPos--;
        input.value = cmdHistory[histPos];
        updateCursor();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histPos < cmdHistory.length - 1) {
        histPos++;
        input.value = cmdHistory[histPos];
        updateCursor();
      } else {
        histPos = cmdHistory.length;
        input.value = draft;
        updateCursor();
      }
    }
  });

  function updateCursor() {
    const cursorObj = document.querySelector(".cursor");
    cursorObj.textContent = input.value;
  }
  input.addEventListener("input", updateCursor);

  document.addEventListener("click", () => {
    if (input.isConnected && !window.getSelection().toString()) input.focus();
  });

  const entryOverlay = document.getElementById("entry-overlay");
  const btnEnter = document.getElementById("btn-enter");
  const terminalWrapper = document.querySelector(".terminal-wrapper");

  terminalWrapper.style.opacity = "0";
  terminalWrapper.style.transform = "translateY(20px)";
  terminalWrapper.style.transition = "opacity 0.8s ease-out, transform 0.8s ease-out";

  btnEnter.addEventListener("click", () => {
    entryOverlay.classList.add("hidden");

    setTimeout(() => {
      terminalWrapper.style.opacity = "1";
      terminalWrapper.style.transform = "translateY(0)";

      setPrompt();
      if (cfg.welcome) {
        setTimeout(() => appendOut(cfg.welcome, false), 300);
      }

      initMusic();
      input.focus();
    }, 400);
  });

  document.querySelector(".control.close").addEventListener("click", () => executeCommand("exit"));
  document.querySelector(".control.minimize").addEventListener("click", () => {
    terminalBody.style.opacity = terminalBody.style.opacity === "0" ? "1" : "0";
  });

  function initMusic() {
    const m = cfg.music;
    if (!m || !m.src) return;

    const audio = document.getElementById("bg-audio");
    const player = document.getElementById("music-player");
    const labelTitle = document.getElementById("music-label");
    const labelStatus = document.getElementById("music-status");
    const btnPlay = document.getElementById("btn-play");
    const btnMute = document.getElementById("btn-mute");
    const volSlider = document.getElementById("vol-slider");

    const iconPlay = document.getElementById("icon-play");
    const iconPause = document.getElementById("icon-pause");
    const iconSound = document.getElementById("icon-sound");
    const iconMute = document.getElementById("icon-mute");

    audio.src = m.src;
    audio.volume = Math.min(1, Math.max(0, m.volume !== undefined ? m.volume : 0.4));

    labelTitle.textContent = m.label || "track";
    volSlider.value = Math.round(audio.volume * 100);

    player.removeAttribute("hidden");

    function setPlayState(on) {
      if (on) {
        iconPlay.style.display = "none";
        iconPause.style.display = "";
        labelStatus.textContent = "Playing";
        labelStatus.style.color = "var(--text-success)";
        player.classList.add("is-playing");
      } else {
        iconPlay.style.display = "";
        iconPause.style.display = "none";
        labelStatus.textContent = "Paused";
        labelStatus.style.color = "var(--text-muted)";
        player.classList.remove("is-playing");
      }
    }

    function setMuteState(muted) {
      audio.muted = muted;
      iconSound.style.display = muted ? "none" : "";
      iconMute.style.display = muted ? "" : "none";
    }

    if (m.autoplay !== false) {
      const p = audio.play();
      if (p !== undefined) {
        p.then(() => setPlayState(true)).catch(() => {
          setPlayState(false);
          const unlock = () => {
            audio.play().then(() => setPlayState(true)).catch(() => {});
            document.removeEventListener("click", unlock);
            document.removeEventListener("keydown", unlock);
          };
          document.addEventListener("click", unlock);
          document.addEventListener("keydown", unlock);
        });
      }
    } else {
      setPlayState(false);
    }

    btnPlay.addEventListener("click", (e) => {
      e.stopPropagation();
      if (audio.paused) {
        audio.play();
        setPlayState(true);
      } else {
        audio.pause();
        setPlayState(false);
      }
    });

    btnMute.addEventListener("click", (e) => {
      e.stopPropagation();
      setMuteState(!audio.muted);
    });

    volSlider.addEventListener("input", (e) => {
      e.stopPropagation();
      audio.volume = volSlider.value / 100;
      if (audio.muted && audio.volume > 0) setMuteState(false);
    });
  }
});
