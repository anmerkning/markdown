# Markdown Editor with an in browser LLM assistant

A lightweight, in-browser **Markdown editor** featuring an integrated **AI assistant** powered by **wllama**.

## [Demo](https://anmerkning.github.io/markdown)

https://github.com/user-attachments/assets/3925ca13-6d8e-4ff7-aa08-d55f8e07ac93

## Features

- **Live Markdown Editing** – Write and format markdown in real time.
-  **Preview Mode** – Instantly preview rendered markdown alongside your editor.
-  **AI Assistant (wllama)** – Prompt the built-in AI assistant for writing help, content ideas, or markdown tips.
-  **Session Persistence** – Automatically save your content and selected model to **local storage**, so your work stays safe between sessions.
-  **Model Lookup** – Search and download models directly from **Hugging Face** within the tool.
-  **Model Switching** – Easily switch between available models for different tasks or performance levels.


## Tech Stack

* **Frontend:** React / Vite / TypeScript
* **In browser LLM:** wllama 
* **Styling:** Shadcdn components and Tailwind 


## How to run locally

```bash
# Clone the repository
git clone https://github.com/anmerkning/markdown

# Navigate into the project
cd markdown

# Install dependencies
npm install

# Run locally
npm run dev
```
Then open your browser and navigate to **[http://localhost:5173/markdown](http://localhost:3000)** (or the port shown in your terminal).


## How to build
```
# Clone the repository
git clone https://github.com/anmerkning/markdown

# Navigate into the project
cd markdown

# Install dependencies
npm install

# Build
npm run build
```
Built output will be in `/dist`

## TODO
* [ ] Persist editors selection highlight when user open a prompt and send selection as part of the prompt message.
* [ ] Add `Clear Cache` option.
* [ ] Add ability to upload local models.
* [ ] Limit huggingface model search results to models that are less than 2 GB. (requires pre fetching file metadata)
* [ ] Polish huggingface search result view. Add size, popularity, downloads and other information to the huggingface search results.
* [ ] Export markdown as `.md` 
* [ ] Add model adjustment options (temperature, max tokens, etc.)

---

Made in Norway 🇳🇴
