export type AgentType = "code" | "data" | "math" | "research" | "stream" | "writing" | "sales" | "accountant" | "investor" | "business" | "productivity";

interface AgentInfo {
  name: string;
  title: string;
  icon: string;
}

export const agentIcons: Record<AgentType, string> = {
  code: "https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?w=150&h=150&fit=crop",
  data: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&h=150&fit=crop",
  math: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=150&h=150&fit=crop",
  research: "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=150&h=150&fit=crop",
  stream: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=150&h=150&fit=crop",
  writing: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=150&h=150&fit=crop",
  sales: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=150&h=150&fit=crop",
  accountant: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=150&h=150&fit=crop",
  investor: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=150&h=150&fit=crop",
  business: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=150&h=150&fit=crop",
  productivity: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=150&h=150&fit=crop"
};

export const agents: Record<AgentType, AgentInfo> = {
  code: {
    name: "Felini",
    title: "Email Manager",
    icon: agentIcons.code
  },
  data: {
    name: "Lika",
    title: "SMM",
    icon: agentIcons.data
  },
  math: {
    name: "Tato",
    title: "Advertiser",
    icon: agentIcons.math
  },
  research: {
    name: "Ars",
    title: "HR & Educator",
    icon: agentIcons.research
  },
  stream: {
    name: "Musho",
    title: "IT Operations",
    icon: agentIcons.stream
  },
  writing: {
    name: "Kuku",
    title: "Lawyer",
    icon: agentIcons.writing
  },
  sales: {
    name: "Sergo",
    title: "Sales Assistant",
    icon: agentIcons.sales
  },
  accountant: {
    name: "Kamo",
    title: "Accountant",
    icon: agentIcons.accountant
  },
  investor: {
    name: "Rubo",
    title: "Investor",
    icon: agentIcons.investor
  },
  business: {
    name: "Hracho",
    title: "Business Developer",
    icon: agentIcons.business
  },
  productivity: {
    name: "Zara",
    title: "Productivity Assistant", 
    icon: agentIcons.productivity
  }
};
