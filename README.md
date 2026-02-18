.

🚀 CIVICAI
AI-Powered Civic Infrastructure Monitoring System for Urban & Rural Communities
📌 Overview

CIVICAI is an AI-driven civic issue detection and reporting platform designed to serve both urban cities and rural communities.

The system enables citizens to upload images of infrastructure issues such as:

🕳️ Road damages & potholes

🗑️ Garbage overflow

💡 Broken streetlights

🚰 Drainage blockages

🛣️ Rural road deterioration

Using a trained computer vision model, CIVICAI automatically detects and categorizes issues, generating structured reports that local authorities can review and resolve efficiently.

🎯 Mission

To bridge the digital governance gap between urban municipalities and rural local bodies by introducing AI-based automation into civic issue reporting systems.

🧠 AI Model

Model Type: YOLO-based Object Detection

Framework: PyTorch

Inference: Real-time image classification

Application: Infrastructure issue detection across urban and rural regions

⚠️ Model weights are excluded from this repository for optimization and deployment flexibility.

🏗️ Tech Stack
🔹 Backend

Python

Flask

SQLAlchemy

RESTful APIs

🔹 Frontend

React (Vite)

Context API

Axios

Responsive UI Design

🔹 Database

SQLite (Development Environment)

⚙️ Key Features
👤 Citizen Interface

User Registration & Authentication

Image-based issue submission

AI-powered automatic detection

Structured complaint logging

🏛️ Administrative Dashboard

Monitor reported issues

Centralized complaint management

Transparent reporting system

🌍 Urban & Rural Impact
🏙 Urban Benefits

Faster complaint classification

Reduced administrative workload

Improved governance transparency

🌾 Rural Benefits

Digital complaint access for remote areas

Infrastructure monitoring for village roads

Support for local governance bodies

🖼️ Demo & Screenshots

📌 Paste your application screenshots below.
You can upload images inside a folder called /screenshots and reference them like shown.

🔐 Login Page
![Login Page](screenshots/login.png)
📤 Issue Upload Interface
![Upload Page](screenshots/upload.png)
📊 Admin Dashboard
![Dashboard](screenshots/dashboard.png)
🤖 AI Detection Output
![Detection Output](screenshots/detection.png)

🔹 Replace image filenames with your actual screenshot names.

📂 Project Structure
SmartCityProject/
│
├── app.py
├── requirements.txt
├── .gitignore
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── static/
│   └── uploads/
│
└── instance/
🚀 Installation Guide
1️⃣ Clone Repository
git clone https://github.com/Harishragaventhira/CIVICAI.git
cd CIVICAI
2️⃣ Backend Setup
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py

Backend runs on:

http://127.0.0.1:5000
3️⃣ Frontend Setup
cd frontend
npm install
npm run dev

Frontend runs on:

http://localhost:5173
🔐 Security & Optimization

The following are excluded from version control:

Virtual environments

Node modules

Model weights

Uploaded media

Database files

Environment variables

📈 Future Roadmap

Geo-location based issue mapping

Real-time severity scoring

Multi-language support for rural accessibility

Cloud deployment

Mobile application integration

AI model optimization for edge devices
