<h1 align="center">Smart Meter AI</h1>

<p align="center"> This is an API for a application that allows the user to manage their bills of water or gas with the help of AI. </p>
    <br> 
</p>

## 📝 Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Usage](#usage)
- [Structure](#structure)
- [Features](#features)
- [Built Using](#built_using)

## 🧐 About <a name = "about"></a>
- This is an API for a application that allows the user to manage their bills of water or gas with the help of Google's AI, Gemini.
- The user can submit a photo of the bill, as base 64 string, and the AI will extract the data from the bill and save it in the database.
- The user can also see the bills that were saved in the database, and to confirm if the value is correct, by informing the value that is in the bill.

## 🏁 Getting Started <a name = "getting_started"></a>

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
You will need to have the following installed on your machine:
- [Docker](https://www.docker.com/)

### Installing
With the prerequisites installed, and with docker running, you can run the following commands to get the project up and running:

1. Clone the repository or download the zip file and extract it:
```bash
git clone https://github.com/LeonardoSPereira/SmartMeterAI.git
```

2. Create a `.env` file in the root of the project with the following content:
```env
PORT=3333

DATABASE_URL="postgres://docker:docker@smartmeterai-postgres-1:5432/postgres-1?schema=public"

GEMINI_API_KEY=

GEMINI_AI_MODEL="gemini-1.5-flash" | "gemini-1.5-pro"
```

4. Start the database:
```bash
docker-compose up --build -d
```
**This command will build and run the application and configure the database. Check in the Docker logs if the app is running and if the database was correctly set.**

## 🏗️ Structure <a name = "structure"></a>
The project is structured as follows:
```

├── prisma: folder where the Prisma configuration files are located, with the schema and migrations.

├── src: folder where application files are located.

│   ├── lib: folder where the files that contain the configuration of the dependencies used in the application are located.

│   ├── routes: folder where are located the app routes, with the personalized error handlers

│   ├── env: file where environment variables are located.

│   ├── error-handler.ts: file where the error handler is located.

│   └── server.ts: file that contains the application and server configuration.

├── uploads: folder where uploaded files are stored while the ai processes them.

```

## 🎈 Features <a name = "features"></a>

- [x] Users can upload a photo of a bill and get the data extracted by the AI;
- [x] Users can confirm the data extracted by the AI;
- [x] Users can see the bills that were saved in the database, and filter them by type of measure;

## 🤓 Usage <a name="usage"></a>
With the application running, you can access the routes through the "http://localhost:3333/docs" address, to see the documentation of the routes and test them.

## ⛏️ Built Using <a name = "built_using"></a>
- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/en/)
- [Fastify](https://www.fastify.io/)
- [Gemini](https://ai.google.dev/gemini-api/docs/vision?lang=node)
- [Prisma](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Docker](https://www.docker.com/)
- [Zod](https://zod.dev/)


