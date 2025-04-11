import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function WelcomeMessage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={cn(
      "flex flex-col items-center justify-center h-full mt-10",
      isDark ? "bg-gray-900" : "bg-gray-50"
    )}>
      <div className={cn(
        "rounded-2xl shadow-sm ring-1 ring-inset px-6 py-5 max-w-lg w-full",
        isDark ? "bg-gray-800 ring-gray-700" : "bg-white ring-gray-200"
      )}>
        <h2 className={cn(
          "text-xl font-semibold mb-2",
          isDark ? "text-white" : "text-gray-900"
        )}>
          Welcome to Advi Agents! 👋
        </h2>
        <p className={cn(
          "mb-4 leading-relaxed",
          isDark ? "text-gray-300" : "text-gray-600"
        )}>
          We can help you with:
        </p>
        <ul className={cn(
          "space-y-2",
          isDark ? "text-gray-300" : "text-gray-600"
        )}>
          <li className="flex items-start gap-2">
            <span className={cn(
              "mt-1",
              isDark ? "text-purple-400" : "text-purple-500"
            )}>•</span>
            <span>Managing large amounts of emails and providing responses to them</span>
          </li>
          <li className="flex items-start gap-2">
            <span className={cn(
              "mt-1",
              isDark ? "text-purple-400" : "text-purple-500"
            )}>•</span>
            <span>Organizing the documentation for your business and being the 24/7 accessible personal & corporate lawyer for you</span>
          </li>
          <li className="flex items-start gap-2">
            <span className={cn(
              "mt-1",
              isDark ? "text-purple-400" : "text-purple-500"
            )}>•</span>
            <span>Creating multiple types of content for your social media and managing accounts on the platform</span>
          </li>
          <li className="flex items-start gap-2">
            <span className={cn(
              "mt-1",
              isDark ? "text-purple-400" : "text-purple-500"
            )}>•</span>
            <span>Fully taking charge on recrtuiting proccess & constantly educating employees</span>
          </li>
          <li className="flex items-start gap-2">
            <span className={cn(
              "mt-1",
              isDark ? "text-purple-400" : "text-purple-500"
            )}>•</span>
            <span>Manage marketing campaigns</span>
          </li>
          <li className="flex items-start gap-2">
            <span className={cn(
              "mt-1",
              isDark ? "text-purple-400" : "text-purple-500"
            )}>•</span>
            <span>Fully take care of all IT operations</span>
          </li>
        </ul>
        <p className={cn(
          "mt-4 leading-relaxed",
          isDark ? "text-purple-400" : "text-purple-600"
        )}>
          Feel free to ask me anything! I&apos;m here to help.
        </p>
      </div>
    </div>
  );
}
