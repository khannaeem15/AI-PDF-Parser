---
title: AI PDF Parser
emoji: 🚀
colorFrom: indigo
colorTo: pink
sdk: docker
app_port: 7860
pinned: false
---

# Intelligent AI PDF Parser 🚀
Checkout here
https://huggingface.co/spaces/naakhan/AI-PDF-Parser 

**An advanced, dual-engine full-stack PDF parser.** Built on top of the highly-rated OpenDataLoader project, it combines blazing-fast Java deterministic analysis with PyTorch-powered AI Vision Models (Docling) to precisely extract Text, Markdown, structured Tables, and JSON metadata (with coordinate bounding-boxes) from both digital and scanned PDFs. 

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![Python](https://img.shields.io/badge/Python-3.12-yellow?style=for-the-badge&logo=python)
![Java](https://img.shields.io/badge/Java-21-red?style=for-the-badge&logo=openjdk)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge&logo=docker)

---

## 🌟 How It Works

This application utilizes a Next.js Node server that delegates heavy lifting to two highly distinct computational engines seamlessly:

### ⚡ Standard Mode (Java Deterministic Engine)
If dealing with a standard, digital PDF, the app relies on an internal Java engine. Using the `XY-Cut++` reading-algorithm locally, it mathematically parses the PDF tree to extract extremely coherent structures in roughly ~20ms, producing clean JSON and Markdown format.

### 🧠 Hybrid AI Mode (Python Vision Model Engine)
If dealing with images, scanned documents, broken columns, or highly complex borderless tables, the frontend UI allows toggling "Hybrid Mode". 
When enabled, the backend pipes the PDF through a persistent AI Background Server running on **Port 5002**. This triggers the deployment of an AI Vision Model called **Docling** (Using PyTorch) alongside **EasyOCR**. It effectively "reads" the page like a human, filling in gaps where traditional parsers completely fail.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Next.js 15 (React), Custom Modern CSS (No generic component libraries to maintain pristine loading speeds).
- **Backend API**: Next.js Serverless Edge Routes (`route.ts`).
- **Standard Parser Library**: `@opendataloader/pdf` (Requires System Java 11+).
- **Hybrid Parser Library**: `opendataloader-pdf[hybrid]` (Requires System Python 3.10+).
- **Deployment**: Configured out of the box with a monolithic `Dockerfile` for Hugging Face Spaces.

---

## 🚀 Easy Deployment (Hugging Face Spaces)

Because this app utilizes Node, Java, and Python frameworks simultaneously, typical free hosting platforms (Vercel, Netlify) will not work due to 512MB RAM constraints and inability to pull custom OS-level system binaries. 

Instead, this repository is structurally optimized with a **custom Dockerfile** targeting [Hugging Face Spaces](https://huggingface.co/spaces), which grants up to **16GB of Free RAM**.

**How to deploy in 2 clicks:**
1. Create a "Docker Space" on Hugging Face.
2. Link this GitHub Repository.
3. Hugging Face will automatically execute the `Dockerfile`, install the Java and Python dependencies, compile Next.js in `.next/standalone`, and run both the port 5002 background AI server and the port 7860 web application side-by-side!

---

## 💻 Local Development

If you desire to run this application completely locally, you must manually fulfill the dependencies that the Dockerfile usually handles.

1. Install **Node.js (v20+)**
2. Install **Java (JDK 21)** and ensure `java` is in your environment PATH.
3. Install **Python (v3.12+)** and ensure `python`/`pip` are in your PATH.

### 1. Boot the AI Background Server (Optional)
If you wish to use Hybrid mode locally, open a terminal and run:
```bash
pip install "opendataloader-pdf[hybrid]"
opendataloader-pdf-hybrid --port 5002 --force-ocr
```

### 2. Boot the Web App
Open a second terminal in the repository root:
```bash
npm install
npm run dev
```
Navigate to `http://localhost:3000` to start parsing!

---
*Built autonomously via advanced Gen-AI Agent Architecture. The core library wrapping is powered by the OpenDataLoader team.*
