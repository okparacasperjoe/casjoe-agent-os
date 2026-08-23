# Casjoe Agent OS

Casjoe Agent OS is an offline, enterprise‑grade business intelligence platform designed for entrepreneurs, healthcare workers, and students across Africa. It runs entirely on local hardware (e.g., an 8 GB RAM laptop) without any cloud dependencies, ensuring data privacy and reliable operation even with limited internet connectivity.

## 📥 Download the Desktop App

| Platform | Installer |
|----------|-----------|
| **Windows** | [Casjoe‑Agent‑OS‑Setup‑1.0.0‑Windows.exe](https://github.com/okparacasperjoe/casjoe-agent-os/releases/latest) |
| **macOS** | [Casjoe‑Agent‑OS‑Setup‑1.0.0‑mac.dmg](https://github.com/okparacasperjoe/casjoe-agent-os/releases/latest) |
| **Linux (tar.gz)** | [Casjoe‑Agent‑OS‑1.0.0‑Linux.tar.gz](https://github.com/okparacasperjoe/casjoe-agent-os/releases/latest) |
| **Linux (zip)** | [Casjoe‑Agent‑OS‑1.0.0‑Linux.zip](https://github.com/okparacasperjoe/casjoe-agent-os/releases/latest) |

*(Note: You must have [Ollama](https://ollama.com/) installed on your machine to power the offline AI features.)*

## 🏆 Project Highlights
- **100 % Offline AI** – Powered by Ollama and local LLMs (e.g., Llama 3.2 3B, Phi‑3) running entirely on the user’s device.
- **📚 120+ Enterprise Prompt Library** – Ready‑to‑use prompts across 12 sectors (Business, Marketing, IT & Tech, Healthcare, Finance, Legal, Real Estate, HR, E‑Commerce, Education, Sales, Customer Support).
- **Client‑Side Document RAG** – Securely analyze PDF and TXT files locally, with no data leaving the device.
- **Agentic Automation** – Generate invoices, add customers to a CRM, and produce detailed reports via natural‑language commands.
- **Complete Business Suite** – Integrated CRM, Finance tracker (invoices), Inventory manager, Point‑of‑Sale, Document Vault, and Prompt Library.
- **Zero Ongoing Costs** – No subscription fees or API charges.

## 🛠️ Technology Stack
- **Frontend UI:** React 19, Vite, TailwindCSS (dark/gold African‑inspired theme)
- **Database:** IndexedDB via `dexie` for persistent local storage
- **Local AI integration:** Ollama API (`localhost:11434`)
- **Document Processing:** `pdfjs-dist` & `jspdf` for offline parsing and PDF generation
- **Data Visualizations:** Chart.js

## 🚀 How to Run Locally
### Prerequisites
1. **Node.js** (v18+)
2. **Ollama** installed on your system (download at ollama.com)
3. Pull a lightweight model to your machine:
   ```bash
   ollama run llama3.2
   ```

### Installation
1. Clone the repository (or extract the folder).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

## 💡 How It Works
- **AI Chat Workspace:** Interact with the local AI, ask business questions, or upload PDFs directly for analysis.
- **Agentic Actions:** Typing commands like "Create an invoice for John Doe for 50 000" will automatically call internal tools to add the invoice to the Finance tab.
- **Data Persistence:** All data (customers, documents, invoices) is securely stored in the browser's IndexedDB.

## 💰 Pricing & Pro License

Casjoe Agent OS is **free to download and use**. A **Pro license** unlocks advanced features:

| Plan | Price | Features |
|------|-------|----------|
| **Free** | \$0 | Core AI chat, CRM, Finance, Inventory, 120+ Prompts |
| **Pro** | \$19.99 one-time | Unlimited prompt slots, advanced AI agents, priority auto-updates, premium support |

🛒 **Purchase a Pro license key** at [casperjoe.gumroad.com/l/casjoeagent](https://casperjoe.gumroad.com/l/casjoeagent)

After purchase you will receive a `XXXX-XXXX-XXXX-XXXX` key. Enter it in **Settings → License Activation** inside the app to unlock Pro features.

---
*Built with ❤️ for African Entrepreneurs by Casper Joe Okpara.*
