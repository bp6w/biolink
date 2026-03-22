# Terminal Bio Link

A minimal, terminal-themed personal bio link. It features a retro command-line interface, `socials` and `projects` commands, a clickable splash screen, and optional background music. No complicated build steps required—just pure HTML, CSS, and JavaScript.

## 🚀 How to Set Up Your Own

You can host this for free in just a few minutes. Here is the easiest way to do it using GitHub Pages:

### Step 1: Get the Code
1. Sign in to [GitHub](https://github.com/).
2. On this repository's page, click the green **"Use this template"** button (or click **"Fork"**) to create your own copy of the project.
3. Give your new repository a name (e.g., `my-bio-link`).

### Step 2: Customize Your Link
You don't need to know how to code to customize this!
1. Open the `settings.html` file in your browser (you can double click it from your computer).
2. Fill out the form with your name, social links, projects, and other details.
3. Click **"Save Configuration"**. This will download a new `config.js` file for you.
4. Go to your new GitHub repository, find the `config.js` file, and upload/replace it with the one you just downloaded.

*(Advanced: Alternatively, you can just manually edit the `config.js` file directly inside GitHub!)*

### Step 3: Publish It for Free
1. Go to your GitHub repository homepage.
2. Click on the ⚙️ **Settings** tab at the top.
3. On the left sidebar, click on **Pages**.
4. Under "Build and deployment", look for the **Branch** dropdown.
5. Change it from `None` to `main`, and keep the folder as `/ (root)`.
6. Click **Save**.
7. Wait a few minutes! GitHub will eventually display a link at the top of the page (e.g., `https://yourusername.github.io/my-bio-link/`). That's your new live bio link!

## 🎵 Adding Pictures and Music
To add your own profile picture or background music:
1. Place your `.jpg`/`.png` image or `.mp3` background music file into the `assets/` folder.
2. Update the filenames in your `config.js` file using the `settings.html` page. 
3. Emptying the music or avatar fields will hide them completely.

---

## 📂 Project Files

- `index.html` - The main website file
- `settings.html` - A visual editor to change your website's content easily
- `config.js` - Stores your personal data (name, links, text)
- `main.js` & `styles.css` - The code that makes the terminal work
- `assets/` - Folder for your images and music
- `netlify.toml` - Configuration for Netlify hosting (optional alternative to GitHub)

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.
Fonts used: [Fira Code](https://fonts.google.com/specimen/Fira+Code) and [Inter](https://fonts.google.com/specimen/Inter).
