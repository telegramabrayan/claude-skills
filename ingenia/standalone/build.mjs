// Genera dist-standalone/ingenia.html: toda la app en un solo archivo (JS y CSS en línea).
import { build } from "esbuild";
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out = path.join(root, "dist-standalone");
mkdirSync(out, { recursive: true });

execSync(`npx @tailwindcss/cli -i src/app/globals.css -o dist-standalone/app.css --minify`, { cwd: root, stdio: "inherit" });

const result = await build({
  entryPoints: [path.join(root, "standalone/main.tsx")],
  bundle: true,
  minify: true,
  write: false,
  format: "iife",
  target: "es2020",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  alias: {
    "next/link": path.join(root, "standalone/Link.tsx"),
    "next/navigation": path.join(root, "standalone/router.ts"),
    "@": path.join(root, "src"),
  },
  logLevel: "warning",
});

const js = result.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
const css = readFileSync(path.join(out, "app.css"), "utf8") + "body{font-size:16px}";
const theme = `try{var s=JSON.parse(localStorage.getItem("ingenia:progress:v1")||"{}");var t=(s.settings&&s.settings.theme)||"system";if(t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;

// Fragmento sin <html>/<head>/<body>: sirve tanto para publicar como página como para abrirlo directo.
const html = `<title>Ingenia</title>
<meta name="description" content="Tu camino a Ingeniería: matemática, física y programación desde cero hasta el CBC.">
<style>${css}</style>
<script>${theme}</script>
<div id="root"></div>
<script>${js}</script>
`;
writeFileSync(path.join(out, "ingenia.html"), html);
console.log(`dist-standalone/ingenia.html · ${(html.length / 1024).toFixed(0)} KB`);
