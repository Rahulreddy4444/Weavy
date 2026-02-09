#  Weavy Clone - Visual Workflow Builder

A full-stack visual workflow builder for creating and executing AI-powered workflows, inspired by Weavy.ai. Built with Next.js 16, React Flow, and Google Gemini AI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-19.0-61dafb)

##  Features

- **Visual Workflow Editor** - Drag-and-drop interface powered by React Flow
- **AI Integration** - Execute Google Gemini AI models directly in workflows
- **Multiple Node Types**:
  - Text Node - Simple text input/output
  - Upload Image - Image upload via Transloadit
  - Upload Video - Video upload via Transloadit
  - Run LLM - Execute AI models (Gemini Pro, Gemini 1.5 Pro/Flash)
  - Crop Image - Image cropping with custom parameters
  - Extract Frame - Extract frames from videos
- **Real-time Execution** - Watch your workflows execute in real-time
- **Workflow History** - Track all workflow runs with detailed results
- **Auto-save** - Automatic saving every 30 seconds
- **Export/Import** - Save and share workflows as JSON
- **Authentication** - Secure user authentication with Clerk
- **Persistent Storage** - SQLite database for local development

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **React Flow** - Visual node-based editor
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful UI components
- **Zustand** - State management

### Backend
- **Prisma ORM** - Database management
- **SQLite** - Local database (easily switchable to PostgreSQL/MySQL)
- **Clerk** - Authentication & user management
- **Google Gemini AI** - LLM execution
- **Trigger.dev v4** - Background job processing

### APIs & Services
- **Transloadit** - Media processing (images, videos)
- **FFmpeg** - Video frame extraction
- **Google Generative AI** - AI model integration

## Screenshots

### Workflow Editor
![Workflow Editor](./screenshots/editor.png)

### Node Library
![Node Library](./screenshots/nodes.png)

### Workflow History
![Workflow History](./screenshots/history.png)

##  Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/weavy-clone.git
   cd weavy-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
   CLERK_SECRET_KEY=sk_test_xxxxx
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/workflows
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/workflows

   # Database (SQLite - no setup needed)
   # For PostgreSQL/MySQL, update DATABASE_URL here

   # Google Gemini API
   GOOGLE_GEMINI_API_KEY=AIzaSyxxxxx
   OPENAI_API_KEY=your_openai_key_here
   ANTHROPIC_API_KEY=your_anthropic_key_here

   # Trigger.dev (Optional)
   TRIGGER_PROJECT_ID=proj_xxxxx
   TRIGGER_SECRET_KEY=tr_dev_xxxxx

   # Transloadit (Optional - for production)
   TRANSLOADIT_KEY=xxxxx
   TRANSLOADIT_SECRET=xxxxx
   ```

4. **Set up the database**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Getting API Keys

### Clerk (Required)
1. Go to [https://clerk.com](https://clerk.com)
2. Create a new application
3. Copy your publishable and secret keys
4. Add to `.env.local`

### Google Gemini API (Required for LLM)
1. Go to [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Create an API key
3. Add to `.env.local`

### OpenAI GPT
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key → Add to .env.local as OPENAI_API_KEY=

### Anthropic Claude
1. Go to https://console.anthropic.com/settings/keys
2. Click "Create Key"
3. Copy the key → Add to .env.local as ANTHROPIC_API_KEY=

### Transloadit (Optional)
1. Go to [https://transloadit.com](https://transloadit.com)
2. Sign up and get your auth key and secret
3. Add to `.env.local`

### Trigger.dev (Optional)
1. Go to [https://trigger.dev](https://trigger.dev)
2. Create a new project
3. Get your project ID and secret key
4. Add to `.env.local`


##  Usage

### Creating a Workflow

1. **Sign in** to your account
2. **Click "New Workflow"** on the workflows page
3. **Add nodes** from the left sidebar:
   - Click on any node type to add it to the canvas
   - Drag nodes to reposition them
4. **Connect nodes**:
   - Click and drag from an output handle (right side)
   - Connect to an input handle (left side) on another node
5. **Configure nodes**:
   - Click on a node to see its properties
   - Fill in required fields
6. **Save** your workflow (auto-saves every 30 seconds)
7. **Run** the workflow by clicking the Run button

### Example Workflow: Text Summarization

1. Add a **Text Node** with your text
2. Add a **Run LLM** node
3. Connect the Text Node output to the LLM's "User Message" input
4. In the LLM node, set the System Prompt to: "Summarize this text in one sentence"
5. Click **Run**
6. View results in the **Workflow History** sidebar

### Exporting & Importing Workflows

- **Export**: Click the Export button to download your workflow as JSON
- **Import**: Click Import and select a workflow JSON file

##  Project Structure

```
weavy-clone/
├── app/                          # Next.js app directory
│   ├── (auth)/                   # Auth routes (sign-in, sign-up)
│   ├── (dashboard)/              # Protected routes
│   │   └── workflows/            # Workflow pages
│   ├── api/                      # API routes
│   │   ├── workflows/            # Workflow CRUD
│   │   ├── runs/                 # Workflow execution
│   │   └── upload/               # File uploads
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   └── workflow/                 # Workflow-specific components
│       ├── nodes/                # Node components
│       ├── Canvas.tsx            # React Flow canvas
│       ├── Sidebar.tsx           # Left sidebar
│       ├── RightSidebar.tsx      # History sidebar
│       └── Toolbar.tsx           # Top toolbar
├── lib/                          # Utility functions
│   ├── prisma.ts                 # Prisma client
│   ├── utils.ts                  # Helper functions
│   └── workflow-engine.ts        # Workflow execution logic
├── prisma/                       # Database schema
│   └── schema.prisma             # Prisma schema
├── stores/                       # Zustand stores
│   └── workflow-store.ts         # Workflow state
├── trigger/                      # Trigger.dev tasks
│   ├── llm-task.ts              # LLM execution
│   ├── crop-image-task.ts       # Image cropping
│   └── extract-frame-task.ts    # Frame extraction
├── types/                        # TypeScript types
│   └── workflow.ts               # Workflow types
└── public/                       # Static assets
```

## Node Types

### Text Node
Simple text input with output handle. Use for providing text to other nodes.

**Inputs:** None  
**Outputs:** Text

### Upload Image
Upload images to be used in workflows.

**Inputs:** None  
**Outputs:** Image URL

**Supported formats:** JPG, PNG, WebP, GIF

### Upload Video
Upload videos for processing.

**Inputs:** None  
**Outputs:** Video URL

**Supported formats:** MP4, MOV, WebM, M4V

### Run LLM
Execute Google Gemini AI models.

**Inputs:**
- System Prompt (optional)
- User Message (optional if connected)
- Images (optional, for vision models)

**Outputs:** AI Response

**Available models:**
- Gemini Pro
- Gemini 2.5
- Gemini 1.5 Flash

### Crop Image
Crop images with custom parameters.

**Inputs:**
- Image (from Upload Image node)
- X Position (%)
- Y Position (%)
- Width (%)
- Height (%)

**Outputs:** Cropped Image URL

### Extract Frame
Extract a specific frame from a video.

**Inputs:**
- Video (from Upload Video node)
- Timestamp (% or seconds)

**Outputs:** Extracted Frame URL

## Database Schema

```prisma
model User {
  id           String        @id @default(cuid())
  clerkId      String        @unique
  email        String        @unique
  workflows    Workflow[]
  workflowRuns WorkflowRun[]
}

model Workflow {
  id           String        @id @default(cuid())
  name         String
  description  String?
  nodes        String        @default("[]")
  edges        String        @default("[]")
  viewport     String?
  userId       String
  user         User          @relation(fields: [userId], references: [id])
  workflowRuns WorkflowRun[]
}

model WorkflowRun {
  id          String    @id @default(cuid())
  workflowId  String
  workflow    Workflow  @relation(fields: [workflowId], references: [id])
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  status      String    @default("RUNNING")
  scope       String    @default("FULL")
  nodeResults String    @default("[]")
  startedAt   DateTime  @default(now())
  completedAt DateTime?
  duration    Int?
  error       String?
}
```

## Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables from `.env.local`
   - Click "Deploy"

3. **Update Clerk URLs**
   - In Clerk dashboard, add your Vercel URL to allowed origins
   - Update redirect URLs

### Deploy to Other Platforms

The app can be deployed to any platform that supports Next.js:
- **Netlify**
- **Railway**
- **Render**
- **AWS Amplify**

##  Switching from SQLite to PostgreSQL

To use PostgreSQL (recommended for production):

1. **Update `prisma/schema.prisma`:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Add PostgreSQL URL to `.env.local`:**
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/database"
   ```

3. **Push schema:**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- [Weavy.ai](https://weavy.ai) - Original inspiration
- [React Flow](https://reactflow.dev) - Node-based editor
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [Clerk](https://clerk.com) - Authentication
- [Google AI](https://ai.google.dev) - Gemini API
- [Trigger.dev](https://trigger.dev) - Background jobs

##  Demo Video

[Watch Demo Video](https://drive.google.com/file/d/1s4AGMLcCiUD-9L0Z0Uy4xqEH2_JBd91H/view?usp=drive_link)

[Live Demo URL](https://drive.google.com/file/d/1s4AGMLcCiUD-9L0Z0Uy4xqEH2_JBd91H/view?usp=drive_link)



##  Known Issues

- Transloadit integration is mocked in development (requires paid account)
- Video frame extraction requires FFmpeg setup
- Image cropping uses placeholder in development

## 🔮 Future Enhancements

- [ ] Add more node types (API calls, data transformation, etc.)
- [ ] Implement collaborative editing
- [ ] Add workflow templates
- [ ] Version control for workflows
- [ ] Workflow analytics and monitoring
- [ ] Custom node creation
- [ ] Workflow scheduling
- [ ] Integration with more AI models (Claude, GPT-4, etc.)

##  Documentation

For detailed documentation on:
- Node types and usage
- API endpoints
- Workflow execution engine
- Database schema
- Deployment guide

Visit the [Wiki](https://github.com/yourusername/weavy-clone/wiki)

---

⭐ **Star this repo if you found it helpful!**