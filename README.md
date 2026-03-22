# terminal bio link

Static biolink thing: fake shell, `socials` / `projects` commands, splash + optional music. No bundler, just files.

Host it wherever you throw static files — [GitHub Pages](https://pages.github.com/), [Netlify](https://www.netlify.com/), whatever.

## rough setup

**GitHub:** hit “Use this template” (or fork), clone, mess with `config.js`, push. Then repo **Settings → Pages**, branch `main`, folder `/`. URL ends up like `https://you.github.io/repo-name/`.

**Netlify:** drag the folder or connect the repo, publish directory is `.`, no build.

Everything important is in **`config.js`**. Paths are relative to the site root, so `assets/pic.jpg` means a file at `assets/pic.jpg` in the repo.

`settings.html` is a dumb form that spits out a new `config.js` — download or copy, replace the file, commit. It can’t save to disk by itself because there’s no server.

## what’s in config

Roughly: `entry` (splash text), `avatar`, `music`, `user` / `host` for the prompt, `siteName` (also the `<title>`), `welcome`, `socials[]`, `projects[]`. Empty `music.src` turns off the player; empty `avatar.src` hides the picture.

See `assets/README.md` for where to put mp3s/images.

## files

```
index.html
settings.html
config.js
main.js
settings.js
styles.css
assets/
netlify.toml
LICENSE
```

## license

MIT — `LICENSE` file.

Fonts are [Fira Code](https://fonts.google.com/specimen/Fira+Code) and [Inter](https://fonts.google.com/specimen/Inter) from Google.
