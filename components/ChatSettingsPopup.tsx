"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAgent } from "@/lib/context/agent";
import { agents, AgentType } from "@/constants/agents";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/lib/theme";
import { useSettings } from "@/lib/context/settings";
import { cn } from "@/lib/utils";

export function ChatSettingsButton() {
  const { agentType } = useAgent();
  const [popupMounted, setPopupMounted] = useState(false);

  useEffect(() => {
    setPopupMounted(true);
    return () => setPopupMounted(false);
  }, []);

  const { theme } = useTheme();
  const { openSettings } = useSettings();
  const isDark = theme === 'dark';
  const [isOnChatPage, setIsOnChatPage] = useState(false);
  
  useEffect(() => {
    const checkIfOnChatPage = () => {
      const isChat = /\/dashboard\/org\/[^/]+\/chat\/[^/]+/.test(window.location.pathname);
      setIsOnChatPage(isChat);
    };
    
    checkIfOnChatPage();
    const intervalId = setInterval(checkIfOnChatPage, 500);
    window.addEventListener('popstate', checkIfOnChatPage);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('popstate', checkIfOnChatPage);
    };
  }, []);
  
  if (!isOnChatPage) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={openSettings}
      className={cn(
        "p-2 rounded-md transition-colors",
        isDark ? (
          "text-purple-400 hover:text-purple-300 hover:bg-purple-900/50"
        ) : (
          "text-purple-600 hover:text-purple-800 hover:bg-purple-100/50"
        )
      )}
      aria-label="Chat settings"
    >
      <Settings className={cn(
        "h-5 w-5",
        isDark ? "text-purple-400" : "text-purple-600"
      )} />
    </Button>
  );
}

// Render both the button and the popup
export function ChatSettings() {
  return (
    <>
      <ChatSettingsButton />
      {typeof window !== 'undefined' && <ChatSettingsPopup />}
    </>
  );
}

// Core tools mapping for each agent
const agentCoreTools = {
  code: [
    { name: "Read Files", icon: "file", description: "Read and analyze code files" },
    { name: "Write Code", icon: "code", description: "Generate and modify code" },
    { name: "Debug Code", icon: "bug", description: "Find and fix code issues" },
    { name: "Git Operations", icon: "git-branch", description: "Manage git repositories" },
    { name: "API Testing", icon: "api", description: "Test API endpoints" }
  ],
  data: [
    { name: "Data Analysis", icon: "bar-chart", description: "Analyze data sets" },
    { name: "Data Visualization", icon: "pie-chart", description: "Create data visualizations" },
    { name: "Database Queries", icon: "database", description: "Write and execute queries" },
    { name: "Data Cleaning", icon: "filter", description: "Clean and preprocess data" },
    { name: "Statistical Analysis", icon: "trending-up", description: "Perform statistical calculations" }
  ],
  math: [
    { name: "Calculate Metrics", icon: "calculator", description: "Perform mathematical calculations" },
    { name: "Generate Reports", icon: "file-text", description: "Create detailed reports" },
    { name: "Forecast Trends", icon: "trending-up", description: "Predict future trends" },
    { name: "ROI Analysis", icon: "dollar-sign", description: "Calculate return on investment" },
    { name: "Budget Planning", icon: "credit-card", description: "Plan and manage budgets" }
  ],
  research: [
    { name: "Literature Review", icon: "book", description: "Review academic papers" },
    { name: "Data Collection", icon: "database", description: "Gather research data" },
    { name: "Citation Management", icon: "list", description: "Manage citations and references" },
    { name: "Research Analysis", icon: "search", description: "Analyze research findings" },
    { name: "Report Writing", icon: "file-text", description: "Write research reports" }
  ],
  stream: [
    { name: "System Monitoring", icon: "activity", description: "Monitor system performance" },
    { name: "Log Analysis", icon: "file-text", description: "Analyze system logs" },
    { name: "Resource Management", icon: "server", description: "Manage system resources" },
    { name: "Security Checks", icon: "shield", description: "Perform security audits" },
    { name: "Backup Management", icon: "save", description: "Manage system backups" }
  ],
  writing: [
    { name: "Content Writing", icon: "edit", description: "Write and edit content" },
    { name: "Grammar Check", icon: "check", description: "Check grammar and spelling" },
    { name: "Style Analysis", icon: "eye", description: "Analyze writing style" },
    { name: "Citation Format", icon: "list", description: "Format citations" },
    { name: "Plagiarism Check", icon: "search", description: "Check for plagiarism" }
  ],
  sales: [
    { name: "Lead Generation", icon: "users", description: "Generate new leads" },
    { name: "Sales Analysis", icon: "bar-chart", description: "Analyze sales data" },
    { name: "Pipeline Management", icon: "git-branch", description: "Manage sales pipeline" },
    { name: "Proposal Writing", icon: "file-text", description: "Write sales proposals" },
    { name: "Customer Analysis", icon: "user-check", description: "Analyze customer data" }
  ],
  accountant: [
    { name: "Bookkeeping", icon: "book", description: "Manage financial records" },
    { name: "Tax Calculation", icon: "percent", description: "Calculate taxes" },
    { name: "Financial Reports", icon: "file-text", description: "Generate financial reports" },
    { name: "Expense Tracking", icon: "dollar-sign", description: "Track expenses" },
    { name: "Audit Support", icon: "check-square", description: "Support audit processes" }
  ],
  investor: [
    { name: "Market Analysis", icon: "trending-up", description: "Analyze market trends" },
    { name: "Portfolio Management", icon: "briefcase", description: "Manage investment portfolio" },
    { name: "Risk Assessment", icon: "alert-triangle", description: "Assess investment risks" },
    { name: "Financial Modeling", icon: "bar-chart", description: "Create financial models" },
    { name: "Investment Research", icon: "search", description: "Research investment opportunities" }
  ],
  business: [
    { name: "Business Planning", icon: "clipboard", description: "Create business plans" },
    { name: "Market Research", icon: "search", description: "Research market conditions" },
    { name: "Strategy Development", icon: "target", description: "Develop business strategies" },
    { name: "Competitor Analysis", icon: "users", description: "Analyze competitors" },
    { name: "Performance Metrics", icon: "bar-chart", description: "Track business metrics" }
  ],
  productivity: [
    { name: "Task Management", icon: "check-square", description: "Manage tasks and to-dos" },
    { name: "Time Tracking", icon: "clock", description: "Track time and productivity" },
    { name: "Project Planning", icon: "calendar", description: "Plan and schedule projects" },
    { name: "Goal Setting", icon: "target", description: "Set and track goals" },
    { name: "Progress Reports", icon: "file-text", description: "Generate progress reports" }
  ]
};

// Agent-specific settings configurations
const agentSettingsConfig: Record<AgentType, {
  title: string;
  description: string;
  defaultTemperature: number;
  defaultModel: string;
  models: string[];
}> = {
  code: {
    title: "Email Manager Settings",
    description: "Configure how Felini handles your emails",
    defaultTemperature: 0.7,
    defaultModel: "Claude Sonnet 3.7",
    models: ["Claude Sonnet 3.7", "Claude Sonnet 3.5", "OpenAI ChatGPT o1", "DeepSeek V3", "Grok 3", "Qwen Coder", "Llama 3.3", "Google Gemini 2.5"]
  },
  data: {
    title: "Social Media Manager Settings",
    description: "Configure how Lika manages your social media",
    defaultTemperature: 0.8,
    defaultModel: "Claude Sonnet 3.7",
    models: ["Claude Sonnet 3.7", "Claude Sonnet 3.5", "OpenAI ChatGPT o1", "DeepSeek V3", "Grok 3", "Qwen Coder", "Llama 3.3", "Google Gemini 2.5"]
  },
  math: {
    title: "Advertiser Settings",
    description: "Configure how Tato creates your ads",
    defaultTemperature: 0.6,
    defaultModel: "Claude Sonnet 3.7",
    models: ["Claude Sonnet 3.7", "Claude Sonnet 3.5", "OpenAI ChatGPT o1", "DeepSeek V3", "Grok 3", "Qwen Coder", "Llama 3.3", "Google Gemini 2.5"]
  },
  research: {
    title: "HR & Educator Settings",
    description: "Configure how Ars handles HR and education tasks",
    defaultTemperature: 0.7,
    defaultModel: "Claude Sonnet 3.7",
    models: ["Claude Sonnet 3.7", "Claude Sonnet 3.5", "OpenAI ChatGPT o1", "DeepSeek V3", "Grok 3", "Qwen Coder", "Llama 3.3", "Google Gemini 2.5"]
  },
  stream: {
    title: "IT Operations Settings",
    description: "Configure how Musho manages IT operations",
    defaultTemperature: 0.5,
    defaultModel: "Claude Sonnet 3.7",
    models: ["Claude Sonnet 3.7", "Claude Sonnet 3.5", "OpenAI ChatGPT o1", "DeepSeek V3", "Grok 3", "Qwen Coder", "Llama 3.3", "Google Gemini 2.5"]
  },
  writing: {
    title: "Legal Assistant Settings",
    description: "Configure how Kuku assists with legal matters",
    defaultTemperature: 0.7,
    defaultModel: "Claude Sonnet 3.7",
    models: ["Claude Sonnet 3.7", "Claude Sonnet 3.5", "OpenAI ChatGPT o1", "DeepSeek V3", "Grok 3", "Qwen Coder", "Llama 3.3", "Google Gemini 2.5"]
  },
  sales: {
    title: "Sales Assistant Settings",
    description: "Configure how Sergo helps with sales",
    defaultTemperature: 0.8,
    defaultModel: "Claude Sonnet 3.7",
    models: ["Claude Sonnet 3.7", "Claude Sonnet 3.5", "OpenAI ChatGPT o1", "DeepSeek V3", "Grok 3", "Qwen Coder", "Llama 3.3", "Google Gemini 2.5"]
  },
  accountant: {
    title: "Accountant Settings",
    description: "Configure how Kamo handles accounting tasks",
    defaultTemperature: 0.5,
    defaultModel: "Claude Sonnet 3.7",
    models: ["Claude Sonnet 3.7", "Claude Sonnet 3.5", "OpenAI ChatGPT o1", "DeepSeek V3", "Grok 3", "Qwen Coder", "Llama 3.3", "Google Gemini 2.5"]
  },
  investor: {
    title: "Investor Settings",
    description: "Configure how Rubo assists with investments",
    defaultTemperature: 0.6,
    defaultModel: "Claude Sonnet 3.7",
    models: ["Claude Sonnet 3.7", "Claude Sonnet 3.5", "OpenAI ChatGPT o1", "DeepSeek V3", "Grok 3", "Qwen Coder", "Llama 3.3", "Google Gemini 2.5"]
  },
  business: {
    title: "Business Developer Settings",
    description: "Configure how Hracho helps develop your business",
    defaultTemperature: 0.7,
    defaultModel: "Claude Sonnet 3.7",
    models: ["Claude Sonnet 3.7", "Claude Sonnet 3.5", "OpenAI ChatGPT o1", "DeepSeek V3", "Grok 3", "Qwen Coder", "Llama 3.3", "Google Gemini 2.5"]
  },
  productivity: {
    title: "Productivity Assistant Settings",
    description: "Configure how Zara boosts your productivity",
    defaultTemperature: 0.7,
    defaultModel: "Claude Sonnet 3.7",
    models: ["Claude Sonnet 3.7", "Claude Sonnet 3.5", "OpenAI ChatGPT o1", "DeepSeek V3", "Grok 3", "Qwen Coder", "Llama 3.3", "Google Gemini 2.5"]
  }
};

export default function ChatSettingsPopup() {
  const { isSettingsOpen, closeSettings } = useSettings();
  const { agentType } = useAgent();
  const popupRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  // Default to code agent if none is selected
  const currentAgentType = agentType || "code";
  const currentAgent = agents[currentAgentType];
  const settings = agentSettingsConfig[currentAgentType];
  
  const [temperature, setTemperature] = useState(settings.defaultTemperature);
  const [model, setModel] = useState(settings.defaultModel);
  const [activeSection, setActiveSection] = useState<string>("agent-settings");
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  
  // Integration tools mapping
  const integrationTools = {
    notion: [
      { name: "Create a page", description: "Create a new page in Notion" },
      { name: "Update a page", description: "Update content of an existing page" },
      { name: "Create a database", description: "Create a new database in Notion" },
      { name: "Query a database", description: "Retrieve data from a Notion database" },
      { name: "Add a comment", description: "Add a comment to a Notion page" }
    ],
    stripe: [
      { name: "Create a customer", description: "Create a new customer in Stripe" },
      { name: "Create a payment", description: "Process a payment through Stripe" },
      { name: "Create a subscription", description: "Set up a recurring subscription" },
      { name: "View payment history", description: "Retrieve payment history for a customer" }
    ],
    hubspot: [
      { name: "Create a contact", description: "Add a new contact to HubSpot" },
      { name: "Update a contact", description: "Update an existing contact's information" },
      { name: "Create a deal", description: "Create a new deal in the pipeline" },
      { name: "Update a deal", description: "Update status or details of a deal" },
      { name: "Log an activity", description: "Record an activity for a contact" }
    ],
    salesforce: [
      { name: "Create a lead", description: "Add a new lead to Salesforce" },
      { name: "Update a lead", description: "Update an existing lead's information" },
      { name: "Convert a lead", description: "Convert a lead to an opportunity" },
      { name: "Create an opportunity", description: "Create a new sales opportunity" },
      { name: "Update an opportunity", description: "Update status or details of an opportunity" }
    ],
    slack: [
      { name: "Send a message", description: "Send a message to a Slack channel" },
      { name: "Create a channel", description: "Create a new Slack channel" },
      { name: "Add users to channel", description: "Add users to an existing channel" },
      { name: "Upload a file", description: "Upload a file to a Slack channel" }
    ],
    whatsapp: [
      { name: "Send a message", description: "Send a WhatsApp message to a contact" },
      { name: "Send a template", description: "Send a template message to a contact" },
      { name: "Send a media message", description: "Send an image, video, or document" },
      { name: "Create a group", description: "Create a new WhatsApp group" }
    ],
    dropbox: [
      { name: "Upload a file", description: "Upload a file to Dropbox" },
      { name: "Download a file", description: "Download a file from Dropbox" },
      { name: "Create a folder", description: "Create a new folder in Dropbox" },
      { name: "Share a file", description: "Generate a sharing link for a file" }
    ],
    "microsoft-teams": [
      { name: "Send a message", description: "Send a message to a Teams channel" },
      { name: "Create a meeting", description: "Schedule a new Teams meeting" },
      { name: "Add members", description: "Add members to a Teams channel" },
      { name: "Share a file", description: "Share a file in a Teams channel" }
    ],
    zoom: [
      { name: "Create a meeting", description: "Schedule a new Zoom meeting" },
      { name: "Join a meeting", description: "Join an existing Zoom meeting" },
      { name: "Manage participants", description: "Manage participants in a meeting" },
      { name: "Record a meeting", description: "Start or stop recording a meeting" }
    ],
    "google-calendar": [
      { name: "Create an event", description: "Schedule a new calendar event" },
      { name: "Update an event", description: "Modify an existing calendar event" },
      { name: "Delete an event", description: "Remove an event from the calendar" },
      { name: "View schedule", description: "View upcoming calendar events" }
    ],
    calendly: [
      { name: "Create event type", description: "Create a new event type in Calendly" },
      { name: "Schedule a meeting", description: "Schedule a meeting with someone" },
      { name: "View availability", description: "Check available time slots" },
      { name: "Manage bookings", description: "View and manage existing bookings" }
    ],
    "google-drive": [
      { name: "Upload a file", description: "Upload a file to Google Drive" },
      { name: "Create a folder", description: "Create a new folder in Google Drive" },
      { name: "Share a file", description: "Share a file with specific permissions" },
      { name: "Search files", description: "Find files in Google Drive" }
    ],
    "google-sheets": [
      { name: "Create a spreadsheet", description: "Create a new Google Sheet" },
      { name: "Update cells", description: "Update values in a spreadsheet" },
      { name: "Create a chart", description: "Generate a chart from data" },
      { name: "Export data", description: "Export spreadsheet data to another format" }
    ],
    miro: [
      { name: "Create a board", description: "Create a new Miro board" },
      { name: "Add sticky notes", description: "Add sticky notes to a board" },
      { name: "Create a diagram", description: "Create a diagram on a board" },
      { name: "Collaborate", description: "Invite others to collaborate on a board" }
    ],
    onenote: [
      { name: "Create a notebook", description: "Create a new OneNote notebook" },
      { name: "Add a page", description: "Add a new page to a notebook" },
      { name: "Insert content", description: "Insert content into a page" },
      { name: "Share a notebook", description: "Share a notebook with others" }
    ],
    sharepoint: [
      { name: "Upload a document", description: "Upload a document to SharePoint" },
      { name: "Create a site", description: "Create a new SharePoint site" },
      { name: "Manage permissions", description: "Manage access permissions" },
      { name: "Create a list", description: "Create a new list in SharePoint" }
    ],
    coda: [
      { name: "Create a doc", description: "Create a new Coda document" },
      { name: "Add a table", description: "Add a table to a document" },
      { name: "Create a formula", description: "Create a formula in a document" },
      { name: "Share a doc", description: "Share a document with others" }
    ],
    "google-docs": [
      { name: "Create a document", description: "Create a new Google Doc" },
      { name: "Edit content", description: "Edit content in a document" },
      { name: "Add comments", description: "Add comments to a document" },
      { name: "Share a document", description: "Share a document with others" }
    ],
    microsoftExcel: [
      { name: "Create a workbook", description: "Create a new Excel workbook" },
      { name: "Update cells", description: "Update values in a workbook" },
      { name: "Create a pivot table", description: "Create a pivot table from data" },
      { name: "Create a chart", description: "Generate a chart from data" }
    ],
    onedrive: [
      { name: "Upload a file", description: "Upload a file to OneDrive" },
      { name: "Download a file", description: "Download a file from OneDrive" },
      { name: "Share a file", description: "Share a file with specific permissions" },
      { name: "Create a folder", description: "Create a new folder in OneDrive" }
    ],
    imanage: [
      { name: "Upload a document", description: "Upload a document to iManage" },
      { name: "Search documents", description: "Search for documents in iManage" },
      { name: "Manage workspaces", description: "Manage iManage workspaces" },
      { name: "Set security", description: "Set security settings for documents" }
    ],
    box: [
      { name: "Upload a file", description: "Upload a file to Box" },
      { name: "Download a file", description: "Download a file from Box" },
      { name: "Share a file", description: "Share a file with others" },
      { name: "Create a folder", description: "Create a new folder in Box" }
    ],
    typeform: [
      { name: "Create a form", description: "Create a new Typeform" },
      { name: "Add questions", description: "Add questions to a form" },
      { name: "View responses", description: "View form responses" },
      { name: "Share a form", description: "Share a form with others" }
    ],
    airtable: [
      { name: "Create a base", description: "Create a new Airtable base" },
      { name: "Add records", description: "Add records to a table" },
      { name: "Create a view", description: "Create a new view of data" },
      { name: "Link records", description: "Link records between tables" }
    ]
  };

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        closeSettings();
      }
    }

    if (isSettingsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSettingsOpen, closeSettings]);
  
  // Update settings when agent changes
  useEffect(() => {
    if (agentType) {
      const newSettings = agentSettingsConfig[agentType];
      setTemperature(newSettings.defaultTemperature);
      setModel(newSettings.defaultModel);
    }
  }, [agentType]);

  if (!isSettingsOpen || !mounted) return null;

  // Create portal content and mount it to document.body
  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-[9999] overflow-hidden" style={{ position: 'fixed', isolation: 'isolate' }}>
      <div className="w-[95vw] h-[95vh] flex items-center justify-center">
        <div
          ref={popupRef}
          className={cn(
            "w-full max-w-5xl rounded-xl shadow-2xl border flex flex-col md:flex-row max-h-[85vh] overflow-hidden",
            isDark ? (
              "bg-gray-900/95 border-gray-700/50 shadow-purple-900/20"
            ) : (
              "bg-white border-gray-200"
            )
          )}
        >
          {/* Sidebar */}
          <div className={cn(
            "w-full md:w-72 md:border-r p-4 md:p-6 md:rounded-l-xl overflow-y-auto",
            isDark ? (
              "bg-gray-800/50 border-gray-700"
            ) : (
              "bg-gray-50 border-gray-200"
            )
          )}>
            <div className="flex items-center gap-3 mb-8">
              {currentAgent.icon && (
                <img
                  src={currentAgent.icon}
                  alt={currentAgent.name}
                  className="w-8 h-8 rounded-md object-cover shadow-sm"
                />
              )}
              <h3 className={cn(
                "text-base font-semibold",
                isDark ? "text-gray-100" : "text-gray-900"
              )}>{settings.title}</h3>
            </div>
            
            <div className="mb-6">
              <h4 className={cn(
                "text-xs uppercase tracking-wider font-medium mb-3",
                isDark ? "text-gray-400" : "text-gray-500"
              )}>Navigation</h4>
              
              <div className="flex flex-col space-y-2">
                <div
                  className={cn(
                    "justify-start px-4 py-3 text-sm font-medium rounded-lg w-full text-left transition-all cursor-pointer",
                    activeSection === "agent-settings" ? (
                      isDark ? (
                        "bg-gray-800 text-purple-400 shadow-sm"
                      ) : (
                        "bg-white text-purple-700 shadow-sm"
                      )
                    ) : (
                      isDark ? (
                        "hover:bg-gray-800 hover:text-purple-400 hover:shadow-sm"
                      ) : (
                        "hover:bg-white hover:text-purple-700 hover:shadow-sm"
                      )
                    )
                  )}
                  onClick={() => {
                    setActiveSection("agent-settings");
                  }}
                >
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                    <span>Agent Settings</span>
                  </div>
                </div>
                
                <div
                  className={cn(
                    "justify-start px-4 py-3 text-sm font-medium rounded-lg w-full text-left transition-all cursor-pointer",
                    activeSection === "core-tools" ? (
                      isDark ? (
                        "bg-gray-800 text-purple-400 shadow-sm"
                      ) : (
                        "bg-white text-purple-700 shadow-sm"
                      )
                    ) : (
                      isDark ? (
                        "hover:bg-gray-800 hover:text-purple-400 hover:shadow-sm"
                      ) : (
                        "hover:bg-white hover:text-purple-700 hover:shadow-sm"
                      )
                    )
                  )}
                  onClick={() => setActiveSection("core-tools")}
                >
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                    </svg>
                    <span>Core Tools</span>
                  </div>
                </div>
                
                <div
                  className={cn(
                    "justify-start px-4 py-3 text-sm font-medium rounded-lg w-full text-left transition-all cursor-pointer",
                    activeSection === "organization-suite" ? (
                      isDark ? (
                        "bg-gray-800 text-purple-400 shadow-sm"
                      ) : (
                        "bg-white text-purple-700 shadow-sm"
                      )
                    ) : (
                      isDark ? (
                        "hover:bg-gray-800 hover:text-purple-400 hover:shadow-sm"
                      ) : (
                        "hover:bg-white hover:text-purple-700 hover:shadow-sm"
                      )
                    )
                  )}
                  onClick={() => setActiveSection("organization-suite")}
                >
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                    <span>Organization Suite</span>
                  </div>
                </div>
                
                <div
                  className={cn(
                    "justify-start px-4 py-3 text-sm font-medium rounded-lg w-full text-left transition-all cursor-pointer",
                    activeSection === "integration-tools" ? (
                      isDark ? (
                        "bg-gray-800 text-purple-400 shadow-sm"
                      ) : (
                        "bg-white text-purple-700 shadow-sm"
                      )
                    ) : (
                      isDark ? (
                        "hover:bg-gray-800 hover:text-purple-400 hover:shadow-sm"
                      ) : (
                        "hover:bg-white hover:text-purple-700 hover:shadow-sm"
                      )
                    )
                  )}
                  onClick={() => setActiveSection("integration-tools")}
                >
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg>
                    <span>Integration Tools</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Button
                  className={cn(
                    "w-full text-white shadow-sm transition-all duration-200",
                    isDark ? (
                      "bg-purple-600/90 hover:bg-purple-500/90 shadow-purple-900/20 hover:shadow-purple-800/30"
                    ) : (
                      "bg-purple-600 hover:bg-purple-700"
                    )
                  )}
                  onClick={closeSettings}
                >
                  Apply Settings
                </Button>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className={cn(
            "flex-1 p-4 md:p-8 overflow-y-auto hide-scrollbar",
            isDark ? "text-gray-200" : "text-gray-900",
            "max-h-[calc(85vh-4rem)]"
          )} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {/* Agent Settings Content */}
            <div className={`${activeSection === "agent-settings" ? "block" : "hidden"} animate-in fade-in-50`}>
              <p className={cn(
                "text-sm mb-6",
                isDark ? "text-gray-300" : "text-gray-600"
              )}>{settings.description}</p>

              {/* Development notice */}
            <div className={cn(
              "rounded-md px-4 py-2 mb-4 text-sm font-medium shadow-sm",
              isDark ? (
                "bg-red-900/30 text-red-300 border border-red-800/50"
              ) : (
                "bg-red-500 text-white border border-red-700"
              )
            )}>
              Still in development
            </div>
              
              <div className="space-y-6">
                {/* Temperature Slider */}
                <div className="flex flex-col gap-2">
                  <label className={cn(
                    "text-xs font-medium",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}>
                    Temperature: {temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-purple-600"
                    style={{
                      background: isDark
                        ? `linear-gradient(to right, rgba(147, 51, 234, 0.7) 0%, rgba(147, 51, 234, 0.7) ${temperature * 100}%, rgba(75, 85, 99, 0.3) ${temperature * 100}%, rgba(75, 85, 99, 0.3) 100%)`
                        : `linear-gradient(to right, #9333ea 0%, #9333ea ${temperature * 100}%, #e5e7eb ${temperature * 100}%, #e5e7eb 100%)`,
                      height: '8px',
                      borderRadius: '4px',
                      appearance: 'none',
                      cursor: 'pointer',
                      outline: 'none',
                      border: 'none'
                    }}
                  />
                  <div className={cn(
                    "flex justify-between text-xs",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}>
                    <span>Precise</span>
                    <span>Creative</span>
                  </div>
                </div>
                
                {/* Model Selection Dropdown */}
                <div className="flex flex-col gap-2">
                  <label className={cn(
                    "text-xs font-medium",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}>
                    Model
                  </label>
                  <div className="relative">
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className={cn(
                        "w-full px-4 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 appearance-none cursor-pointer transition-colors duration-200",
                        isDark ? (
                          "bg-gray-800/90 border-gray-700/50 text-gray-200 hover:bg-gray-800"
                        ) : (
                          "bg-white border-gray-200 text-gray-900"
                        )
                      )}
                    >
                      {settings.models.map((modelOption) => (
                        <option key={modelOption} value={modelOption}>
                          {modelOption}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-purple-600"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                  </div>
                  <p className={cn(
                    "text-xs mt-1",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}>
                    Select the AI model that powers this agent
                  </p>
                </div>
              </div>
            </div>
            
            {/* Core Tools Content */}
            <div className={`${activeSection === "core-tools" ? "block" : "hidden"} animate-in fade-in-50`}>
              <div className="mb-6">
                <h4 className={cn(
                  "text-sm font-medium mb-2",
                  isDark ? "text-gray-200" : "text-gray-900"
                )}>Available Tools</h4>
                <p className={cn(
                  "text-sm mb-4",
                  isDark ? "text-gray-300" : "text-gray-600"
                )}>
                  These tools are specifically designed for {currentAgent.name} as your {currentAgent.title.toLowerCase()}.
                </p>
                
                <div className="grid grid-cols-1 gap-4">
                  {agentCoreTools[currentAgentType]?.map((tool, index) => (
                    <div key={index} className={cn(
                      "p-3 rounded-md border transition-colors",
                      isDark ? (
                        "border-gray-700 bg-gray-800 hover:border-gray-600 hover:bg-gray-700"
                      ) : (
                        "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                      )
                    )}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 flex items-center justify-center rounded-md bg-purple-100">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                              {tool.icon === "file" && <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>}
                              {tool.icon === "code" && <polyline points="16 18 22 12 16 6"></polyline>}
                              {tool.icon === "bug" && <circle cx="12" cy="12" r="10"></circle>}
                              {tool.icon === "git-branch" && <line x1="6" y1="3" x2="6" y2="15"></line>}
                              {tool.icon === "api" && <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>}
                              {tool.icon === "bar-chart" && <line x1="12" y1="20" x2="12" y2="10"></line>}
                              {tool.icon === "pie-chart" && <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>}
                              {tool.icon === "database" && <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>}
                              {tool.icon === "filter" && <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>}
                              {tool.icon === "trending-up" && <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>}
                              {tool.icon === "calculator" && <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>}
                              {tool.icon === "file-text" && <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>}
                              {tool.icon === "dollar-sign" && <line x1="12" y1="1" x2="12" y2="23"></line>}
                              {tool.icon === "credit-card" && <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>}
                              {tool.icon === "book" && <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>}
                              {tool.icon === "list" && <line x1="8" y1="6" x2="21" y2="6"></line>}
                              {tool.icon === "search" && <circle cx="11" cy="11" r="8"></circle>}
                              {tool.icon === "activity" && <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>}
                              {tool.icon === "server" && <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>}
                              {tool.icon === "shield" && <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>}
                              {tool.icon === "save" && <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>}
                              {tool.icon === "edit" && <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>}
                              {tool.icon === "check" && <polyline points="20 6 9 17 4 12"></polyline>}
                              {tool.icon === "eye" && <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>}
                              {tool.icon === "users" && <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>}
                              {tool.icon === "user-check" && <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>}
                              {tool.icon === "percent" && <line x1="19" y1="5" x2="5" y2="19"></line>}
                              {tool.icon === "check-square" && <polyline points="9 11 12 14 22 4"></polyline>}
                              {tool.icon === "briefcase" && <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>}
                              {tool.icon === "alert-triangle" && <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>}
                              {tool.icon === "clipboard" && <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>}
                              {tool.icon === "target" && <circle cx="12" cy="12" r="10"></circle>}
                              {tool.icon === "clock" && <circle cx="12" cy="12" r="10"></circle>}
                              {tool.icon === "calendar" && <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>}
                            </svg>
                          </div>
                          <span className="font-medium">{tool.name}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </div>
                        </div>
                      </div>
                      <p className={cn(
                        "text-xs mt-1",
                        isDark ? "text-gray-400" : "text-gray-500"
                      )}>{tool.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Organization Suite Tab Content */}
            <div className={`${activeSection === "organization-suite" ? "block" : "hidden"} animate-in fade-in-50`}>
              <h4 className={cn(
                "text-sm font-medium mb-4",
                isDark ? "text-gray-200" : "text-gray-900"
              )}>Organization-wide Integrations</h4>
              <p className={cn(
                "text-sm mb-4",
                isDark ? "text-gray-300" : "text-gray-600"
              )}>
                These integrations are shared across your entire organization and available to all agents.
                Click on an integration to see available tools.
              </p>
              
              <div className="flex flex-col lg:flex-row">
                {/* Left column: Integrations list */}
                <div className="w-full lg:w-1/3 lg:pr-4 h-full overflow-y-auto hide-scrollbar mb-4 lg:mb-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <div className="space-y-2">
                    <div
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all duration-200",
                        selectedIntegration === 'notion' ? (
                          isDark ? (
                            "border-purple-500/50 bg-purple-900/30 shadow-lg shadow-purple-900/20"
                          ) : (
                            "border-purple-300 bg-purple-50 shadow-sm"
                          )
                        ) : (
                          isDark ? (
                            "border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50"
                          ) : (
                            "border-gray-100 hover:bg-gray-50"
                          )
                        )
                      )}
                      onClick={() => setSelectedIntegration('notion')}
                    >
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" alt="Notion" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">Notion</span>
                    </div>
                    
                    <div
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all duration-200",
                        selectedIntegration === 'stripe' ? (
                          isDark ? (
                            "border-purple-500/50 bg-purple-900/30 shadow-lg shadow-purple-900/20"
                          ) : (
                            "border-purple-300 bg-purple-50 shadow-sm"
                          )
                        ) : (
                          isDark ? (
                            "border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50"
                          ) : (
                            "border-gray-100 hover:bg-gray-50"
                          )
                        )
                      )}
                      onClick={() => setSelectedIntegration('stripe')}
                    >
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://freelogopng.com/images/all_img/1685814539stripe-icon-png.png" alt="Stripe" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">Stripe</span>
                    </div>
                    
                    <div
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all duration-200",
                        selectedIntegration === 'hubspot' ? (
                          isDark ? (
                            "border-purple-500/50 bg-purple-900/30 shadow-lg shadow-purple-900/20"
                          ) : (
                            "border-purple-300 bg-purple-50 shadow-sm"
                          )
                        ) : (
                          isDark ? (
                            "border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50"
                          ) : (
                            "border-gray-100 hover:bg-gray-50"
                          )
                        )
                      )}
                      onClick={() => setSelectedIntegration('hubspot')}
                    >
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://companieslogo.com/img/orig/HUBS-3bd277ce.png?t=1597493082" alt="HubSpot" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">HubSpot</span>
                    </div>
                    
                    <div
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all duration-200",
                        selectedIntegration === 'salesforce' ? (
                          isDark ? (
                            "border-purple-500/50 bg-purple-900/30 shadow-lg shadow-purple-900/20"
                          ) : (
                            "border-purple-300 bg-purple-50 shadow-sm"
                          )
                        ) : (
                          isDark ? (
                            "border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50"
                          ) : (
                            "border-gray-100 hover:bg-gray-50"
                          )
                        )
                      )}
                      onClick={() => setSelectedIntegration('salesforce')}
                    >
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://logos-world.net/wp-content/uploads/2023/09/Salesforce-Logo.png" alt="Salesforce" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">Salesforce</span>
                    </div>
                    
                    <div
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all duration-200",
                        selectedIntegration === 'slack' ? (
                          isDark ? (
                            "border-purple-500/50 bg-purple-900/30 shadow-lg shadow-purple-900/20"
                          ) : (
                            "border-purple-300 bg-purple-50 shadow-sm"
                          )
                        ) : (
                          isDark ? (
                            "border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50"
                          ) : (
                            "border-gray-100 hover:bg-gray-50"
                          )
                        )
                      )}
                      onClick={() => setSelectedIntegration('slack')}
                    >
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://www.pngmart.com/files/23/Slack-Logo-PNG-HD.png" alt="Slack" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">Slack</span>
                    </div>
                    
                    <div
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all duration-200",
                        selectedIntegration === 'whatsapp' ? (
                          isDark ? (
                            "border-purple-500/50 bg-purple-900/30 shadow-lg shadow-purple-900/20"
                          ) : (
                            "border-purple-300 bg-purple-50 shadow-sm"
                          )
                        ) : (
                          isDark ? (
                            "border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50"
                          ) : (
                            "border-gray-100 hover:bg-gray-50"
                          )
                        )
                      )}
                      onClick={() => setSelectedIntegration('whatsapp')}
                    >
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://static.vecteezy.com/system/resources/previews/018/930/564/original/whatsapp-logo-whatsapp-icon-whatsapp-transparent-free-png.png" alt="WhatsApp" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">WhatsApp</span>
                    </div>
                    <div
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all duration-200",
                    selectedIntegration === 'dropbox' ? (
                      isDark ? (
                        "border-purple-500/50 bg-purple-900/30 shadow-lg shadow-purple-900/20"
                      ) : (
                        "border-purple-300 bg-purple-50 shadow-sm"
                      )
                    ) : (
                      isDark ? (
                        "border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )
                  )}
                  onClick={() => setSelectedIntegration('dropbox')}
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                    <img src="https://logospng.org/download/dropbox/logo-dropbox-icone-1024.png" alt="Dropbox" className="w-6 h-6 object-contain" />
                  </div>
                  <span className="text-sm">Dropbox</span>
                </div>

                <div
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all duration-200",
                    selectedIntegration === 'microsoft-teams' ? (
                      isDark ? (
                        "border-purple-500/50 bg-purple-900/30 shadow-lg shadow-purple-900/20"
                      ) : (
                        "border-purple-300 bg-purple-50 shadow-sm"
                      )
                    ) : (
                      isDark ? (
                        "border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )
                  )}
                  onClick={() => setSelectedIntegration('microsoft-teams')}
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                    <img src="https://logos-world.net/wp-content/uploads/2021/04/Microsoft-Teams-Logo.png" alt="Microsoft Teams" className="w-6 h-6 object-contain" />
                  </div>
                  <span className="text-sm">Microsoft Teams</span>
                </div>

                <div
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all duration-200",
                    selectedIntegration === 'zoom' ? (
                      isDark ? (
                        "border-purple-500/50 bg-purple-900/30 shadow-lg shadow-purple-900/20"
                      ) : (
                        "border-purple-300 bg-purple-50 shadow-sm"
                      )
                    ) : (
                      isDark ? (
                        "border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )
                  )}
                  onClick={() => setSelectedIntegration('zoom')}
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                    <img src="https://www.pngarts.com/files/7/Zoom-Logo-PNG-Image.png" alt="Zoom" className="w-6 h-6 object-contain" />
                  </div>
                  <span className="text-sm">Zoom</span>
                </div>

                <div
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all duration-200",
                    selectedIntegration === 'google-calendar' ? (
                      isDark ? (
                        "border-purple-500/50 bg-purple-900/30 shadow-lg shadow-purple-900/20"
                      ) : (
                        "border-purple-300 bg-purple-50 shadow-sm"
                      )
                    ) : (
                      isDark ? (
                        "border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )
                  )}
                  onClick={() => setSelectedIntegration('google-calendar')}
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" alt="Google Calendar" className="w-6 h-6 object-contain" />
                  </div>
                  <span className="text-sm">Google Calendar</span>
                </div>

                <div
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all duration-200",
                    selectedIntegration === 'calendly' ? (
                      isDark ? (
                        "border-purple-500/50 bg-purple-900/30 shadow-lg shadow-purple-900/20"
                      ) : (
                        "border-purple-300 bg-purple-50 shadow-sm"
                      )
                    ) : (
                      isDark ? (
                        "border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )
                  )}
                  onClick={() => setSelectedIntegration('calendly')}
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                    <img src="https://cdn.freelogovectors.net/svg15/calendly_logo-freelogovectors.net.svg" alt="Calendly" className="w-6 h-6 object-contain" />
                  </div>
                  <span className="text-sm">Calendly</span>
                </div>

                <div
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all duration-200",
                        selectedIntegration === 'google-drive' ? (
                          isDark ? (
                            "border-purple-500/50 bg-purple-900/30 shadow-lg shadow-purple-900/20"
                          ) : (
                            "border-purple-300 bg-purple-50 shadow-sm"
                          )
                        ) : (
                          isDark ? (
                            "border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50"
                          ) : (
                            "border-gray-100 hover:bg-gray-50"
                          )
                        )
                      )}
                      onClick={() => setSelectedIntegration('google-drive')}
                    >
                  <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" alt="Google Drive" className="w-6 h-6 object-contain" />
                  </div>
                  <span className="text-sm">Google Drive</span>
                </div>

                <div
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all duration-200",
                        selectedIntegration === 'google-sheets' ? (
                          isDark ? (
                            "border-purple-500/50 bg-purple-900/30 shadow-lg shadow-purple-900/20"
                          ) : (
                            "border-purple-300 bg-purple-50 shadow-sm"
                          )
                        ) : (
                          isDark ? (
                            "border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50"
                          ) : (
                            "border-gray-100 hover:bg-gray-50"
                          )
                        )
                      )}
                      onClick={() => setSelectedIntegration('google-sheets')}
                    >
                  <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg" alt="Google Sheets" className="w-6 h-6 object-contain" />
                  </div>
                  <span className="text-sm">Google Sheets</span>
                </div>

                <div
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all duration-200",
                        selectedIntegration === 'miro' ? (
                          isDark ? (
                            "border-purple-500/50 bg-purple-900/30 shadow-lg shadow-purple-900/20"
                          ) : (
                            "border-purple-300 bg-purple-50 shadow-sm"
                          )
                        ) : (
                          isDark ? (
                            "border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50"
                          ) : (
                            "border-gray-100 hover:bg-gray-50"
                          )
                        )
                      )}
                      onClick={() => setSelectedIntegration('miro')}
                    >
                  <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                    <img src="https://w7.pngwing.com/pngs/885/629/png-transparent-miro-hd-logo.png" alt="Miro" className="w-6 h-6 object-contain" />
                  </div>
                  <span className="text-sm">Miro</span>
                </div>

                <div
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all duration-200",
                        selectedIntegration === 'onenote' ? (
                          isDark ? (
                            "border-purple-500/50 bg-purple-900/30 shadow-lg shadow-purple-900/20"
                          ) : (
                            "border-purple-300 bg-purple-50 shadow-sm"
                          )
                        ) : (
                          isDark ? (
                            "border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50"
                          ) : (
                            "border-gray-100 hover:bg-gray-50"
                          )
                        )
                      )}
                      onClick={() => setSelectedIntegration('onenote')}
                    >
                  <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                    <img src="https://logowik.com/content/uploads/images/microsoft-onenote.jpg" alt="OneNote" className="w-6 h-6 object-contain" />
                  </div>
                  <span className="text-sm">OneNote</span>
                </div>

                <div
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all duration-200",
                        selectedIntegration === 'sharepoint' ? (
                          isDark ? (
                            "border-purple-500/50 bg-purple-900/30 shadow-lg shadow-purple-900/20"
                          ) : (
                            "border-purple-300 bg-purple-50 shadow-sm"
                          )
                        ) : (
                          isDark ? (
                            "border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50"
                          ) : (
                            "border-gray-100 hover:bg-gray-50"
                          )
                        )
                      )}
                      onClick={() => setSelectedIntegration('sharepoint')}
                    >
                  <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                    <img src="https://static-00.iconduck.com/assets.00/ms-sharepoint-icon-1024x897-nd71wzcx.png" alt="SharePoint" className="w-6 h-6 object-contain" />
                  </div>
                  <span className="text-sm">SharePoint</span>
                </div>

                <div
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all duration-200",
                        selectedIntegration === 'coda' ? (
                          isDark ? (
                            "border-purple-500/50 bg-purple-900/30 shadow-lg shadow-purple-900/20"
                          ) : (
                            "border-purple-300 bg-purple-50 shadow-sm"
                          )
                        ) : (
                          isDark ? (
                            "border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50"
                          ) : (
                            "border-gray-100 hover:bg-gray-50"
                          )
                        )
                      )}
                      onClick={() => setSelectedIntegration('coda')}
                    >
                  <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                    <img src="https://www.freelogovectors.net/wp-content/uploads/2021/12/codalogo-freelogovectors.net_.png" alt="Coda" className="w-6 h-6 object-contain" />
                  </div>
                  <span className="text-sm">Coda</span>
                </div>

                <div
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all duration-200",
                        selectedIntegration === 'google-docs' ? (
                          isDark ? (
                            "border-purple-500/50 bg-purple-900/30 shadow-lg shadow-purple-900/20"
                          ) : (
                            "border-purple-300 bg-purple-50 shadow-sm"
                          )
                        ) : (
                          isDark ? (
                            "border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50"
                          ) : (
                            "border-gray-100 hover:bg-gray-50"
                          )
                        )
                      )}
                      onClick={() => setSelectedIntegration('google-docs')}
                    >
                  <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/0/01/Google_Docs_logo_%282014-2020%29.svg" alt="Google Docs" className="w-6 h-6 object-contain" />
                  </div>
                  <span className="text-sm">Google Docs</span>
                </div>

                <div
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all duration-200",
                        selectedIntegration === 'microsoftExcel' ? (
                          isDark ? (
                            "border-purple-500/50 bg-purple-900/30 shadow-lg shadow-purple-900/20"
                          ) : (
                            "border-purple-300 bg-purple-50 shadow-sm"
                          )
                        ) : (
                          isDark ? (
                            "border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50"
                          ) : (
                            "border-gray-100 hover:bg-gray-50"
                          )
                        )
                      )}
                      onClick={() => setSelectedIntegration('microsoftExcel')}
                    >
                  <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/34/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg" alt="Excel" className="w-6 h-6 object-contain" />
                  </div>
                  <span className="text-sm">Excel</span>
                </div>

                <div
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all duration-200",
                        selectedIntegration === 'onedrive' ? (
                          isDark ? (
                            "border-purple-500/50 bg-purple-900/30 shadow-lg shadow-purple-900/20"
                          ) : (
                            "border-purple-300 bg-purple-50 shadow-sm"
                          )
                        ) : (
                          isDark ? (
                            "border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50"
                          ) : (
                            "border-gray-100 hover:bg-gray-50"
                          )
                        )
                      )}
                      onClick={() => setSelectedIntegration('onedrive')}
                    >
                  <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                    <img src="https://logos-world.net/wp-content/uploads/2022/04/OneDrive-Logo-700x394.png" alt="OneDrive" className="w-6 h-6 object-contain" />
                  </div>
                  <span className="text-sm">OneDrive</span>
                </div>

                <div
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all duration-200",
                        selectedIntegration === 'imanage' ? (
                          isDark ? (
                            "border-purple-500/50 bg-purple-900/30 shadow-lg shadow-purple-900/20"
                          ) : (
                            "border-purple-300 bg-purple-50 shadow-sm"
                          )
                        ) : (
                          isDark ? (
                            "border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50"
                          ) : (
                            "border-gray-100 hover:bg-gray-50"
                          )
                        )
                      )}
                      onClick={() => setSelectedIntegration('imanage')}
                    >
                  <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                    <img src="https://d2q79iu7y748jz.cloudfront.net/s/_squarelogo/d3df7d21f0ecfcbe37b3836f73c41145" alt="iManage" className="w-6 h-6 object-contain" />
                  </div>
                  <span className="text-sm">iManage</span>
                </div>

                <div
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all duration-200",
                        selectedIntegration === 'box' ? (
                          isDark ? (
                            "border-purple-500/50 bg-purple-900/30 shadow-lg shadow-purple-900/20"
                          ) : (
                            "border-purple-300 bg-purple-50 shadow-sm"
                          )
                        ) : (
                          isDark ? (
                            "border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50"
                          ) : (
                            "border-gray-100 hover:bg-gray-50"
                          )
                        )
                      )}
                      onClick={() => setSelectedIntegration('box')}
                    >
                  <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                    <img src="https://1.bp.blogspot.com/-mw1XIKJ6Snw/VoRgrDST-bI/AAAAAAAAI0U/HLTM8_3rnqg/s1600/Logo+Box.png" alt="Box" className="w-6 h-6 object-contain" />
                  </div>
                  <span className="text-sm">Box</span>
                </div>

                <div
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all duration-200",
                        selectedIntegration === 'typeform' ? (
                          isDark ? (
                            "border-purple-500/50 bg-purple-900/30 shadow-lg shadow-purple-900/20"
                          ) : (
                            "border-purple-300 bg-purple-50 shadow-sm"
                          )
                        ) : (
                          isDark ? (
                            "border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50"
                          ) : (
                            "border-gray-100 hover:bg-gray-50"
                          )
                        )
                      )}
                      onClick={() => setSelectedIntegration('typeform')}
                    >
                  <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                    <img src="https://www.freelogovectors.net/wp-content/uploads/2023/11/typeform_logo-freelogovectors.net_.png" alt="Typeform" className="w-6 h-6 object-contain" />
                  </div>
                  <span className="text-sm">Typeform</span>
                </div>

                <div
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all duration-200",
                        selectedIntegration === 'airtable' ? (
                          isDark ? (
                            "border-purple-500/50 bg-purple-900/30 shadow-lg shadow-purple-900/20"
                          ) : (
                            "border-purple-300 bg-purple-50 shadow-sm"
                          )
                        ) : (
                          isDark ? (
                            "border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50"
                          ) : (
                            "border-gray-100 hover:bg-gray-50"
                          )
                        )
                      )}
                      onClick={() => setSelectedIntegration('airtable')}
                    >
                  <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                    <img src="https://iconape.com/wp-content/png_logo_vector/airtable-logo.png" alt="Airtable" className="w-6 h-6 object-contain" />
                  </div>
                  <span className="text-sm">Airtable</span>
                </div>
                  </div>
                </div>
                
                {/* Right column: Integration tools */}
                <div className="w-full lg:w-2/3 lg:pl-4 lg:border-l lg:border-gray-200">
                  {selectedIntegration ? (
                    <div className="animate-in fade-in-50">
                      <div className="flex items-center gap-2 mb-4">
                        <h4 className="text-sm font-medium">Available Tools</h4>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                          {selectedIntegration.charAt(0).toUpperCase() + selectedIntegration.slice(1)}
                        </span>
                      </div>
                      
                      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {integrationTools[selectedIntegration as keyof typeof integrationTools]?.map((tool, index) => (
                          <div key={index} className={cn(
                            "p-3 rounded-md border transition-all duration-200",
                            isDark ? (
                              "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                            ) : (
                              "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                            )
                          )}>
                            <div className="flex items-center justify-between">
                              <span className={cn(
                                "font-medium text-sm",
                                isDark ? "text-gray-200" : "text-gray-800"
                              )}>{tool.name}</span>
                              <div className="flex items-center">
                                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                </div>
                              </div>
                            </div>
                            <p className={cn(
                              "text-xs mt-1",
                              isDark ? "text-gray-400" : "text-gray-500"
                            )}>{tool.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                      <div className="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-gray-400">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                        <p>Select an integration to see available tools</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Integration Tools Tab Content */}
            <div className={`${activeSection === "integration-tools" ? "block" : "hidden"} animate-in fade-in-50`}>
              <h4 className="text-sm font-medium mb-4">{currentAgent.name} Specific Integrations</h4>
              <p className="text-sm text-gray-600 mb-4">
                These integrations are specific to the {currentAgent.name} agent and provide specialized functionality.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentAgentType === "code" && (
                  <>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://www.pngall.com/wp-content/uploads/13/Adobe-Logo-PNG-File.png" alt="Adobe" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">Adobe</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://logolook.net/wp-content/uploads/2021/06/Gmail-Logo.png" alt="Gmail" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">Gmail</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://logos-world.net/wp-content/uploads/2021/02/Mailchimp-Logo.png" alt="Mailchimp" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">Mailchimp</span>
                    </div>
                  </>
                )}
                {currentAgentType === "data" && (
                  <>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://logospng.org/download/linkedin/logo-linkedin-icon-1536.png" alt="LinkedIn" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">LinkedIn</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://seeklogo.com/images/V/vimeo-logo-23835B7063-seeklogo.com.png" alt="Vimeo" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">Vimeo</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://static.vecteezy.com/system/resources/previews/016/716/481/non_2x/facebook-icon-free-png.png" alt="Facebook" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">Facebook</span>
                    </div>
                  </>
                )}
                {currentAgentType === "math" && (
                  <>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_Ads_logo.svg/2560px-Google_Ads_logo.svg.png" alt="Google Ads" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">Google Ads</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Meta_Ads_logo.svg/2560px-Meta_Ads_logo.svg.png" alt="Meta Ads" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">Meta Ads</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://cdn.worldvectorlogo.com/logos/canva-1.svg" alt="Canva" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">Canva</span>
                    </div>
                  </>
                )}
                {currentAgentType === "research" && (
                  <>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Google_Scholar_logo_2015.PNG/768px-Google_Scholar_logo_2015.PNG" alt="Google Scholar" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">Google Scholar</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Microsoft_icon.svg/2048px-Microsoft_icon.svg.png" alt="Microsoft Teams" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">Microsoft Teams</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Notion-logo.svg/2048px-Notion-logo.svg.png" alt="Notion" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">Notion</span>
                    </div>
                  </>
                )}
                {currentAgentType === "stream" && (
                  <>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Git_icon.svg/2048px-Git_icon.svg.png" alt="GitHub" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">GitHub</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://cdn.worldvectorlogo.com/logos/jira-1.svg" alt="Jira" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">Jira</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://cdn.worldvectorlogo.com/logos/aws-2.svg" alt="AWS" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">AWS</span>
                    </div>
                  </>
                )}
                {currentAgentType === "writing" && (
                  <>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Google_Docs_logo_%282014-2020%29.svg/1481px-Google_Docs_logo_%282014-2020%29.svg.png" alt="Google Docs" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">Google Docs</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Microsoft_Office_Word_%282019%E2%80%93present%29.svg/2203px-Microsoft_Office_Word_%282019%E2%80%93present%29.svg.png" alt="Microsoft Word" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">Microsoft Word</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Notion_app_logo.png/800px-Notion_app_logo.png" alt="Notion" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">Notion</span>
                    </div>
                  </>
                )}
                {currentAgentType === "sales" && (
                  <>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/2560px-Salesforce.com_logo.svg.png" alt="Salesforce" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">Salesforce</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://cdn.worldvectorlogo.com/logos/hubspot-2.svg" alt="HubSpot" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">HubSpot</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://cdn.worldvectorlogo.com/logos/linkedin-icon-2.svg" alt="LinkedIn Sales Navigator" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">LinkedIn Sales</span>
                    </div>
                  </>
                )}
                {currentAgentType === "accountant" && (
                  <>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Quickbooks_New_Logo.svg/2560px-Quickbooks_New_Logo.svg.png" alt="QuickBooks" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">QuickBooks</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Xero_software_logo.svg/2560px-Xero_software_logo.svg.png" alt="Xero" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">Xero</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/PayPal_logo.svg/2560px-PayPal_logo.svg.png" alt="PayPal" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">PayPal</span>
                    </div>
                  </>
                )}
                {currentAgentType === "investor" && (
                  <>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Bloomberg_Logo.svg/2560px-Bloomberg_Logo.svg.png" alt="Bloomberg" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">Bloomberg</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Yahoo_Finance_Logo_2019.svg/2560px-Yahoo_Finance_Logo_2019.svg.png" alt="Yahoo Finance" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">Yahoo Finance</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Robinhood_%28company%29_logo.svg/2560px-Robinhood_%28company%29_logo.svg.png" alt="Robinhood" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">Robinhood</span>
                    </div>
                  </>
                )}
                {currentAgentType === "business" && (
                  <>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Trello-logo-blue.svg/2560px-Trello-logo-blue.svg.png" alt="Trello" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">Trello</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Slack_icon_2019.svg/2048px-Slack_icon_2019.svg.png" alt="Slack" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">Slack</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Figma-logo.svg/1667px-Figma-logo.svg.png" alt="Figma" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">Figma</span>
                    </div>
                  </>
                )}
                {currentAgentType === "productivity" && (
                  <>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Asana_logo.svg/2560px-Asana_logo.svg.png" alt="Asana" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">Asana</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Calendar_icon_%282020%29.svg/2048px-Google_Calendar_icon_%282020%29.svg.png" alt="Google Calendar" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">Google Calendar</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded-md border transition-all duration-200",
                      isDark ? (
                        "border-gray-700/50 bg-gray-800/50 hover:border-gray-600/50 hover:bg-gray-700/50"
                      ) : (
                        "border-gray-100 hover:bg-gray-50"
                      )
                    )}>
                      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-purple-100 overflow-hidden">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Todoist_logo.svg/1200px-Todoist_logo.svg.png" alt="Todoist" className="w-6 h-6 object-contain" />
                      </div>
                      <span className="text-sm">Todoist</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
