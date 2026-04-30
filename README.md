## ⚡ SpeedMinds
"Process Documents Faster. Understand More Deeply."

### 🌟 Project Overview
SpeedMinds is a powerful, full-stack web application designed to help users quickly and efficiently process large documents. Leveraging the Google Gemini Generative AI model, it offers a seamless workflow for document upload, intelligent summarization, topic extraction, and interactive Q&A.

This repository hosts the complete codebase for SpeedMinds, featuring a modern React frontend and a robust Node.js/Express backend.

### ✨ Key Features
#### 📄 Secure Document Upload: Easily upload PDF or text documents for processing.

#### 🧠 Intelligent Summarization: Generate a concise, high-quality summary of the entire document using the Mistral API.

#### 📌 Topic Extraction: Automatically identify and summarize key topics from the document.

#### ❓ Interactive Q&A: Ask specific questions about the document and receive precise, context-aware answers.

#### 📥 PDF Download: Generate and download a comprehensive PDF containing the main summary and the entire Q&A history.

### 🌐 Live Demo
Experience the power of SpeedMinds immediately!
https://speedminds-frontend.onrender.com

### 🚀 Getting Started 
Follow these steps to setup speed minds in your local repository:

#### 1. Clone the repository
git clone https://github.com/Meghana-Poojary/SpeedMinds.git

cd SpeedMinds

#### 2. Setup frontend
Configuration: 

Create .env file 

VITE_API_BASE_URL=your_backend_url

```bash
cd frontend
npm i
npm run dev
```

#### 3. Setup backend
Configuration: 

Create .env file 

MISTRAL_API_KEY=your_api_key

PORT=port_number 

```bash
cd backend
npm i
node server.js
```

You are now ready to use SpeedMinds locally!
