# Casjoe Local AI - Offline Business Engine

Casjoe Local AI is an enterprise-grade, 100% offline business intelligence platform tailored specifically for entrepreneurs, healthcare workers, and students across Africa. 

By operating entirely offline on consumer hardware (such as 8GB RAM laptops), Casjoe eliminates the need for expensive cloud APIs, prevents data privacy concerns, and works seamlessly regardless of internet reliability.

## ⬇️ Download the Desktop App (For Judges)

The easiest way to experience Casjoe Local AI is to download the compiled Desktop App. No terminal or coding required!

* 🪟 **[Windows Installer (.exe)](https://github.com/okparacasperjoe/casjoelocalai/releases/latest)** — `Casjoe-Local-AI-Setup-1.0.0-Windows.exe`
* 🐧 **[Linux Package (.tar.gz)](https://github.com/okparacasperjoe/casjoelocalai/releases/latest)** — `Casjoe-Local-AI-1.0.0-Linux.tar.gz`
* 📦 **[Linux Archive (.zip)](https://github.com/okparacasperjoe/casjoelocalai/releases/latest)** — `Casjoe-Local-AI-1.0.0-Linux.zip`

*(Note: You must have [Ollama](https://ollama.com/) installed on your machine to power the offline AI features).*

## 🏆 Hackathon Project Highlights
- **100% Offline AI:** Powered by Ollama and local LLMs (like Llama 3.2 3B and Phi-3), running locally on the user's machine with zero cloud latency.
- **📚 100+ Enterprise Prompt Library:** Built-in library of 120+ role-engineered, expert prompts across 12 sectors (Business, Marketing, IT & Tech, Healthcare, Finance, Legal, Real Estate, HR, E-Commerce, Education, Sales, Customer Support), enabling anyone to get professional AI outputs without prompt engineering skills.
- **Client-Side Document RAG:** Reads and analyzes PDF and TXT documents securely on the device without sending any data to the cloud.
- **Agentic Automation:** The local AI can automatically generate invoices, add customers to your CRM, and write detailed reports based on natural language commands.
- **Complete Business Suite:** Includes a fully functional CRM, Finance tracker (Invoices), Inventory manager, Point of Sale interface, Document Vault, and Prompt Library.
- **Zero Ongoing Costs:** Say goodbye to ChatGPT Plus subscriptions or API fees.

## 📚 100+ Pre-Built Prompt Library (Across 12 Sectors)
To empower users who are not prompt engineers, Casjoe Local AI comes pre-loaded with over 120 expert-crafted prompts structured for 12 major African economic sectors:
- 💼 **Business & Operations** (Proposals, SWOT Matrix, Pitch Decks, SOPs)
- 📢 **Marketing & Growth** (Content Calendars, Landing Page Copy, Meta/Google Ads)
- 💻 **IT & Tech** (System Architecture, Code Audits, CI/CD Pipelines, API Specs)
- 🏥 **Healthcare & Clinics** (Patient Care SOPs, Triage Guides, Discharge Instructions)
- 💵 **Finance & Accounting** (12-Month Cash Flow Models, Break-Even Analysis, Tax Strategies)
- ⚖️ **Legal & Admin** (Master Services Agreements, NDAs, Data Protection Policies)
- 🏠 **Real Estate** (Investment Underwriting, Cap Rate Calculators, MLS Listing Copy)
- 👥 **Human Resources** (Talent Acquisition Frameworks, 30-60-90 Day Onboarding, PIPs)
- 🛒 **E-Commerce** (PDP Copywriting, Cart Abandonment Recovery Flows, Amazon FBA)
- 🎓 **Education** (12-Week Course Syllabi, Lesson Plans, Exam Generators)
- 📈 **Sales** (Enterprise Cold Outreach, Objection Handling Matrices, ABM Pitches)
- 🎧 **Customer Support** (De-escalation Scripts, Ticket Escalation SOPs, SLA Matrices)

## 🛠️ Technology Stack
- **Frontend UI:** React 19, Vite, TailwindCSS (Dark/Gold African-inspired UI theme)
- **Database:** IndexedDB via `dexie` (persistent local storage on device)
- **Local AI integration:** Ollama API (`localhost:11434`)
- **Document Processing:** `pdfjs-dist` & `jspdf` for completely local offline parsing and PDF generation
- **Data Visualizations:** Chart.js

## 🚀 How to Run Locally

### Prerequisites
1. **Node.js** (v18+)
2. **Ollama** installed on your system (Download at ollama.com)
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
- **AI Chat Workspace:** Chat with your local AI, ask it business questions, or upload a PDF by clicking the paperclip icon. The PDF is analyzed directly on your device.
- **Agentic Actions:** If you type "Create an invoice for John Doe for 50000", the AI will intelligently call the internal tools and add the invoice to your Finance tab automatically!
- **Data Persistence:** Everything you add (customers, documents, invoices) is securely saved inside your browser's IndexedDB.

---
*Built with ❤️ for African Entrepreneurs by Casper Joe Okpara.*
