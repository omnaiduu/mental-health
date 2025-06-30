# 💬 Gemini AI-Powered Mental Health Support Chatbot (Prototype)

## ✨ Overview

This project is a prototype of a mental health chatbot designed to provide conversational support and insights into a user's mental well-being using the **Gemini Large Language Model (LLM)** via the Vercel AI SDK. It aims to act as a supportive friend or assistant, leveraging AI to understand user concerns, offer empathetic responses, and even perform basic assessments through function calling. Key features include contextual note-taking and a secure OTP-based authentication system.

## 🚀 Key Features

*   **Conversational AI:** Powered by Google's **Gemini LLM** for natural, empathetic, and context-aware conversations.
*   **Mental Health Assessment:** Utilizes **Gemini's function calling capabilities** to ask relevant questions and provide a summary of the user's mental health state after a conversation.
*   **Contextual Note-Taking:** Users can jot down thoughts and issues, then provide these notes as context to the chatbot for more personalized and relevant discussions.
*   **OTP-Based Email Authentication:** Secure user access implemented with a custom OTP (One-Time Password) server for email verification.
*   **Email Notifications:** Integrated with the **Resend API** for reliable email delivery (e.g., for OTPs).
*   **User-Friendly Interface:** Built with React for a responsive and intuitive chat experience.
*   **Prompt Engineering:** Sophisticated prompt design to guide the Gemini model in understanding user needs and providing appropriate support.

## 🛠️ Technologies Used

*   **Frontend:** React
*   **AI/LLM:** Google Gemini LLM
*   **AI SDK:** Vercel AI SDK
*   **Backend Framework:** Hono
*   **Database:** SQLite
*   **Email Sending:** Resend API
*   **Authentication:** Custom OTP-based system
*   **Package Manager:** Bun.js (or npm/yarn)

## ⚡ Getting Started

### Prerequisites

Before you begin, ensure you have the following installed and configured:

*   Node.js (LTS version)
*   npm or Yarn or Bun (Bun is preferred for this project)
*   A Google Cloud Project with the Gemini API enabled and an API Key.
*   A Resend API Key for sending emails (for OTPs and summaries).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/omnaiduu/mental-health.git
    cd mental-health
    ```
2.  **Install dependencies:**
    ```bash
    bun install # or npm install or yarn install
    ```
3.  **Create a `.env` file:**
    Copy the `.env.example` file and fill in your credentials:
    ```
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    RESEND_API_KEY=YOUR_RESEND_API_KEY
    SENDER_EMAIL=your@example.com # Email address registered with Resend
    ```

### Running the Application

1.  **Start the development server:**
    ```bash
    bun run dev # This command will typically start both the React frontend and Hono backend
    ```
2.  The application should now be running. You can access it in your web browser, usually at `http://localhost:3000` (or similar, check console output).

## 🚧 Project Status & Future Enhancements

This project is a functional prototype. While it demonstrates core AI conversational capabilities and an assessment feature, it's not a substitute for professional medical advice. Future enhancements could include:

*   Integration with professional mental health resources and hotlines.
*   More sophisticated and varied assessment methods.
*   Mood tracking and journaling features with trend analysis.
*   User progress tracking over time.
*   Deployment to production environments (e.g., Vercel for frontend, a cloud platform for backend).

## 🤝 Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---
```
docker run -d \
  --restart unless-stopped \
  -p 3001:3001 \
  -v mentalhealth-db:/app/db \
  -e VITE_BACKEND=https://mysoulwise.com \
  -e VITE_WS=wss://mysoulwise.com \
  -e FRONTEND="mysoulwise.com" \
  -e DB_PATH="../../db/primary.db" \
  -e RESEND="re_S7ngVhdg_BeXYFkmYCoQaSA4Kq4hArooM" \
  -e COOKIE="mysoulwise.com" \
  -e AI_TOKEN="AIzaSyCJ7pi_ORD8n_l6uMEy8fcCctD4byNG_7M" \
  registry.digitalocean.com/freelance/mentalhealth:latest
````
```
docker build \
  --no-cache \
  --build-arg VITE_BACKEND=https://mysoulwise.com \
  --build-arg VITE_WS=wss://mysoulwise.com \
  -t mentalhealth:latest .

  ```
  ```docker tag mentalhealth:latest registry.digitalocean.com/freelance/mentalhealth:latest```
 ```docker push registry.digitalocean.com/freelance/mentalhealth:latest```



# First, force pull the latest image
docker pull registry.digitalocean.com/freelance/mentalhealth:latest

# Then run with specific version tag
docker run -d \
  --restart unless-stopped \
  -p 3001:3001 \
  -v mentalhealth-db:/app/db \
  -e VITE_BACKEND=https://mysoulwise.com \
  -e VITE_WS=wss://mysoulwise.com \
  -e FRONTEND="mysoulwise.com" \
  -e DB_PATH="../../db/primary.db" \
  -e RESEND="re_S7ngVhdg_BeXYFkmYCoQaSA4Kq4hArooM" \
  -e COOKIE="mysoulwise.com" \
  -e AI_TOKEN="AIzaSyCJ7pi_ORD8n_l6uMEy8fcCctD4byNG_7M" \
  --pull always \
  registry.digitalocean.com/freelance/mentalhealth:latest


  ##use for docker login to regirt after dockelt setup
  doctl registry login
