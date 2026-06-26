export const PROMPT_SUGGESTIONS = [
  { label: "Write code", prompt: "Write a Python function that...", icon: "Code", color: "#6366F1" },
  { label: "Generate image", prompt: "Generate an image of...", icon: "Image", color: "#8B5CF6" },
  { label: "Create presentation", prompt: "Create a presentation about...", icon: "Presentation", color: "#06B6D4" },
  { label: "Research topic", prompt: "Research and summarize...", icon: "Search", color: "#10B981" },
  { label: "Summarize PDF", prompt: "Summarize this document...", icon: "FileText", color: "#F59E0B" },
  { label: "Build website", prompt: "Build a landing page for...", icon: "Globe", color: "#EC4899" },
];

export const AI_MODELS = [
  { id: "gpt", label: "GPT", description: "OpenAI GPT" },
  { id: "claude", label: "Claude", description: "Anthropic Claude" },
  { id: "gemini", label: "Gemini", description: "Google Gemini" },
  { id: "grok", label: "Grok", description: "xAI Grok" },
  { id: "meta-ai", label: "Meta AI", description: "Meta Llama" },
] as const;

export const AI_TOOLS = [
  { id: "image", name: "Image Generator", description: "Create stunning AI images", icon: "Image", color: "#8B5CF6" },
  { id: "pdf", name: "PDF Analyzer", description: "Extract insights from documents", icon: "FileText", color: "#6366F1" },
  { id: "presentation", name: "Presentation Generator", description: "Build slide decks instantly", icon: "Presentation", color: "#06B6D4" },
  { id: "website", name: "Website Builder", description: "Design and code websites", icon: "Globe", color: "#10B981" },
  { id: "code", name: "Code Assistant", description: "Write and debug code", icon: "Code", color: "#F59E0B" },
  { id: "data", name: "Data Analyst", description: "Analyze data and create charts", icon: "BarChart", color: "#EC4899" },
  { id: "research", name: "Research Agent", description: "Deep web research", icon: "Search", color: "#3B82F6" },
  { id: "translate", name: "Translator", description: "Translate any language", icon: "Languages", color: "#14B8A6" },
];

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "BarChart" },
  { label: "New Chat", href: "/", icon: "Plus" },
  { label: "Chat History", href: "/chats", icon: "MessageSquare" },
  { label: "Projects", href: "/projects", icon: "Folder" },
  { label: "Library", href: "/library", icon: "Library" },
  { label: "AI Agents", href: "/agents", icon: "Bot" },
  { label: "Workspaces", href: "/workspaces", icon: "LayoutGrid" },
  { label: "Saved Prompts", href: "/prompts", icon: "Bookmark" },
  { label: "Settings", href: "/settings", icon: "Settings" },
];

export const MOBILE_NAV = [
  { label: "Home", href: "/", icon: "Home" },
  { label: "Chats", href: "/chats", icon: "MessageSquare" },
  { label: "Projects", href: "/projects", icon: "Folder" },
  { label: "Agents", href: "/agents", icon: "Bot" },
  { label: "Profile", href: "/settings", icon: "User" },
];

export const TRENDING_PROMPTS = [
  "Explain quantum computing simply",
  "Build a React dashboard component",
  "Write a marketing email campaign",
  "Analyze this dataset for trends",
];
