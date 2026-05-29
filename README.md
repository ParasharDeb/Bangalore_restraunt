# 🍳 AI Chef – Your Personal AI Cooking Assistant

![AI Chef Banner](https://via.placeholder.com/1200x400.png?text=AI+Chef+-+Your+Personal+Cooking+Companion)

> **AI Chef** is your smart kitchen companion where you can:
> - Ask for **different recipes**
> - Save & access **personalized recipes**
> - Get suggestions based on **ingredients you already have at home**
> - *(Work in progress)* Suggest recipes depending on your **mood** 🎭

---

## ✨ Features

- **🧠 AI-Powered Recipe Suggestions** – Just tell the AI what you want, and it’ll provide step-by-step recipes.
- **💾 Personalized Recipe Book** – Save your own favorite recipes for quick access.
- **🏠 Ingredient-Based Recommendations** – Tell AI Chef what's in your fridge and get cooking ideas instantly.
- **🎭 Mood-Based Dishes** – (Coming soon) Suggest meals depending on your mood & preferences.
- **⚡ Modern Tech Stack** – Built to be scalable, fast, and user-friendly.

---

## 🛠 Tech Stack

| Technology        | Usage                              |
|-------------------|------------------------------------|
| **TypeScript**    | Strongly typed JavaScript          |
| **Node.js**       | Backend runtime environment        |
| **Express.js**    | API server                         |
| **Prisma**        | Database ORM                       |
| **Next.js**       | Full-stack React framework         |
| **React**         | Frontend UI library                |
| **Tailwind CSS**  | Styling                            |
| **Turborepo**     | Monorepo management                |

---

## 📂 Folder Structure

ai-chef/
│
├── apps/
│ ├── ai_chef(frontend)/ # Next.js + React + Tailwind frontend
│ ├── http_server/ # Express + Prisma backend
│
├── packages/
│ ├── config/ # Shared configurations
│ ├── ui/ # Shared UI components
│
├── prisma/
│ └── schema.prisma # Database schema
│
├── turbo.json # Turborepo config
├── package.json
└── README.md

---

## 🚀 Installation & Setup

Clone the repository
git clone https://github.com/ParasharDeb/AI_Chef

Navigate into the project
cd ai-chef

Install dependencies
pnpm install

Setup environment variables
.env

Fill in database URL and API keys in .env
Migrate database
npx prisma migrate dev

Run development server (Turborepo will start web & api)
pnpm run dev


---

## 📌 Environment Variables

In your `.env` file:
DATABASE_URL="postgresql://user:password@localhost:5432/ai-chef"
OPENAI_API_KEY="your-openai-api-key"
JWT_SECRET="jwt_secret"

---

## 🧪 Usage

- **Frontend**: Visit `http://localhost:3000` for the web app.
- **Backend**: API runs at `http://localhost:4000` (if separate).
- Ask AI Chef for recipes, upload your custom ones, and let it surprise you!

---

## 🗺 Roadmap

- [x] AI-powered recipe search
- [x] Personalized recipe saving
- [x] Ingredient-based suggestions
- [ ] Mood-based recipe generation 🎭
- [ ] User authentication for recipe book sync
- [ ] Integration with grocery delivery APIs

---

## 📸 Screenshots (optional)

| Homepage | Recipe Suggestion |
|----------|--------------------|
| ![Home](https://via.placeholder.com/400x250.png?text=Home+Screen) | ![Recipe](https://via.placeholder.com/400x250.png?text=Recipe+View) |

---

## 🤝 Contributing

Contributions welcome! Please fork the repo and submit a pull request.
There are multiple Issues. Feel free to resolve them 
---

