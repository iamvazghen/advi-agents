import { BotIcon } from "lucide-react"; // Removed unused MessageSquarePlusIcon
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export const metadata = {
  title: "Advi Agents Dashboard",
};

export default async function DashboardOrgPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { userId, orgId: clerkOrgId } = await auth(); // auth() is already async
  const { orgId } = await params; // Await params to access orgId

  if (!userId) {
    redirect("/"); // Redirect to login if not authenticated
  }

  if (!clerkOrgId || clerkOrgId !== orgId) {
    redirect("/dashboard"); // Redirect to fallback if orgId doesn’t match
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="relative max-w-2xl w-full">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-100 to-purple-70/30 rounded-3xl"></div>
        <div className="relative space-y-6 p-8 text-center">
          <div className="bg-white/60 backdrop-blur-sm shadow-sm ring-1 ring-purple-200/50 rounded-2xl p-6 space-y-4">
            <div className="bg-gradient-to-b from-purple-100 to-purple-70/30 rounded-xl p-4 inline-flex">
              <BotIcon className="w-12 h-12 text-purple-600" />
            </div>
            <h2 className="text-2xl font-semibold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Welcome to the Advi Agents
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Start a new conversation or select an existing chat from the
              sidebar. Your AI assistant is ready to help with any task.
            </p>
            <div className="pt-2 flex justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                Fast responses
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                Efficient assistance
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                Powerful tools
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}