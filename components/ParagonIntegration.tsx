"use client";

import { useEffect, useState } from "react";
import { paragon } from "@useparagon/connect";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ParagonIntegrationProps {
  userId: string;
  orgId: string;
}

const ParagonIntegration: React.FC<ParagonIntegrationProps> = ({ userId, orgId }) => {
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const initializeParagon = async () => {
      setError(null);

      try {
        console.log("Fetching token with userId:", `${userId}:${orgId}`);
        const response = await fetch(`/api/paragon-token?userId=${userId}:${orgId}`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch Paragon token: ${response.status} - ${errorText}`);
        }

        const { token } = await response.json();
        console.log("Token received:", token);

        await paragon.authenticate(process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID!, token);
        console.log("Paragon authenticated");
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        console.error("Paragon init error:", err);
      }
    };

    initializeParagon();
  }, [userId, orgId]);

  const handleConnect = (integrationType: string) => {
    paragon.connect(integrationType, {});
  };

  return (
    <div className={cn(
      "p-6",
      isDark ? "bg-gray-900" : "bg-gray-50"
    )}>
      <div className="max-w-6xl mx-auto">
        <h2 className={cn(
          "text-2xl font-semibold mb-6",
          isDark ? "text-white" : "text-gray-900"
        )}>Integrations</h2>
        
        {/* Organization-wide Integrations */}
        <div className="mb-10">
          <h2 className={cn(
            "text-xl font-medium mb-3 border-b",
            isDark ? "text-white border-gray-700" : "text-gray-900 border-gray-200"
          )}>Organization-wide Integrations</h2>
          <p className={cn(
            "mb-4",
            isDark ? "text-gray-300" : "text-gray-600"
          )}>
            These integrations are shared across your entire organization and available to all agents.
            They provide core functionality that enhances team collaboration and workflow automation.
            Organization admins can manage these connections and control access permissions.
          </p>
          
          {error && (
            <div className={cn(
              "mb-6 p-4 rounded-md border",
              isDark ? "bg-red-900/20 border-red-700 text-red-400" : "bg-red-50 border-red-200 text-red-600"
            )}>
              <p>Error: {error}</p>
            </div>
          )}

          {!error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Notion Integration Card */}
              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Notion</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>All-in-one workspace</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("notion")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://freelogopng.com/images/all_img/1685814539stripe-icon-png.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Notion</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Payment proccessing</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("stripe")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>
              

              {/* HubSpot Integration Card */}
              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://companieslogo.com/img/orig/HUBS-3bd277ce.png?t=1597493082" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>HubSpot</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>CRM and sales pipeline</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("hubspot")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              {/* Salesforce Integration Card */}
              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://logos-world.net/wp-content/uploads/2023/09/Salesforce-Logo.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Salesforce</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Customer management</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("salesforce")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              {/* Slack Integration Card */}
              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://www.pngmart.com/files/23/Slack-Logo-PNG-HD.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Slack</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Team messaging</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("slack")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              {/* WhatsApp Integration Card */}
              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://static.vecteezy.com/system/resources/previews/018/930/564/original/whatsapp-logo-whatsapp-icon-whatsapp-transparent-free-png.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>WhatsApp</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Instant messaging</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("whatsapp")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              {/* Dropbox Integration Card */}
              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://logospng.org/download/dropbox/logo-dropbox-icone-1024.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Dropbox</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>File storage</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("dropbox")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://logos-world.net/wp-content/uploads/2021/04/Microsoft-Teams-Logo.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Microsoft Teams</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Team collaboration</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("microsoft-teams")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://www.pngarts.com/files/7/Zoom-Logo-PNG-Image.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Zoom</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Video conferencing</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("zoom")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              {/* Google Calendar */}
              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Google Calendar</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Scheduling</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("google-calendar")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              {/* Calendly */}
              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://cdn.freelogovectors.net/svg15/calendly_logo-freelogovectors.net.svg" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Calendly</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Appointment scheduling</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("calendly")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              {/* Google Drive */}
              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Google Drive</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>File storage</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("google-drive")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              {/* Google Sheets */}
              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Google Sheets</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Spreadsheets</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("google-sheets")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              {/* Miro */}
              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://w7.pngwing.com/pngs/885/629/png-transparent-miro-hd-logo.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Miro</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Whiteboards and mindmaps</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("miro")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              {/* OneNote */}
              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://logowik.com/content/uploads/images/microsoft-onenote.jpg" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>OneNote</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Note taking</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("onenote")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              {/* SharePoint */}
              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://static-00.iconduck.com/assets.00/ms-sharepoint-icon-1024x897-nd71wzcx.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>SharePoint</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Document management</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("sharepoint")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              {/* Coda */}
              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://www.freelogovectors.net/wp-content/uploads/2021/12/codalogo-freelogovectors.net_.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Coda</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Code repositories</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("coda")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              {/* Google Docs */}
              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/0/01/Google_Docs_logo_%282014-2020%29.svg" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Google Docs</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Document editing</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("google-docs")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              {/* Excel */}
              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/34/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Excel</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Spreadsheets</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("microsoftExcel")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              {/* OneDrive */}
              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://logos-world.net/wp-content/uploads/2022/04/OneDrive-Logo-700x394.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>OneDrive</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Cloud storage</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("onedrive")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              {/* iManage */}
              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://d2q79iu7y748jz.cloudfront.net/s/_squarelogo/d3df7d21f0ecfcbe37b3836f73c41145" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>iManage</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Document management</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("imanage")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              {/* Box */}
              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://1.bp.blogspot.com/-mw1XIKJ6Snw/VoRgrDST-bI/AAAAAAAAI0U/HLTM8_3rnqg/s1600/Logo+Box.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Box</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Cloud content management</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("box")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              {/* Typeform */}
              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://www.freelogovectors.net/wp-content/uploads/2023/11/typeform_logo-freelogovectors.net_.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Typeform</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Forms & surveys</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("typeform")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              {/* Airtable */}
              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://iconape.com/wp-content/png_logo_vector/airtable-logo.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Airtable</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Low-code database</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("airtable")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Agent-specific Integrations */}
        <div className="space-y-10">
          {/* Email Manager */}
          <div className="mb-10">
            <h2 className="text-xl font-medium mb-3 border-b">Felini | Email Manager & Copywriter Integrations</h2>
            <p className="text-gray-600 mb-4">
              These integrations help the Email Manager agent automate and optimize email workflows.
              They enable seamless email marketing campaigns, inbox management, and customer communication.
              The agent can leverage these tools to track engagement and personalize outreach at scale.
            </p>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 rounded-md border border-red-200">
                <p className="text-red-600">Error: {error}</p>
              </div>
            )}

            {!error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://www.pngall.com/wp-content/uploads/13/Adobe-Logo-PNG-File.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Adobe Experience Manager</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Email marketing</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("adobe-experience-manager")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://logolook.net/wp-content/uploads/2021/06/Gmail-Logo.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Gmail</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Email service</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("gmail")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://freepngimg.com/thumb/wordpress_logo/3-2-wordpress-logo-png-pic.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>WordPress</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Content management</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("wordpress")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://sprwt.io/wp-content/uploads/2022/08/klaviyo-logo-1.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Klaviyo</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Email marketing</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("klaviyo")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://logos-world.net/wp-content/uploads/2021/02/Mailchimp-Logo.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Mailchimp</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Email marketing</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("mailchimp")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://logospng.org/download/microsoft-outlook/logo-microsoft-outlook-1024.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Outlook</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Email service</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("outlook")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              </div>
            )}
          </div>

          {/* Social Media Manager */}
          <div className="mb-10">
            <h2 className="text-xl font-medium mb-3 border-b">Lika | Social Media Manager Integrations</h2>
            <p className="text-gray-600 mb-4">
              These integrations empower the Social Media Manager agent to schedule, analyze and optimize content.
              They provide tools for cross-platform publishing, audience engagement tracking, and performance analytics.
              The agent can maintain brand consistency while maximizing reach across all social channels.
            </p>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 rounded-md border border-red-200">
                <p className="text-red-600">Error: {error}</p>
              </div>
            )}

            {!error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://logospng.org/download/linkedin/logo-linkedin-icon-1536.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>LinkedIn</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Content management</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("linkedin")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>
              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://seeklogo.com/images/V/vimeo-logo-23835B7063-seeklogo.com.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Vimeo</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Video creation</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("vimeo")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://static.vecteezy.com/system/resources/previews/016/716/481/non_2x/facebook-icon-free-png.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Facebook Pages</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Content management</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("facebookpages")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>
              </div>
            )}
          </div>

          {/* Advertiser */}
          <div>
            <h3 className="text-xl font-medium mb-3 border-b">Tato | Advertiser Integrations</h3>
            <p className="text-gray-600 mb-4">
              These integrations give the Advertiser agent tools to create, manage and optimize ad campaigns. 
              They provide access to audience targeting, budget controls, and performance analytics. 
              The agent can test different creatives and strategies while maximizing ROI.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://static.vecteezy.com/system/resources/previews/016/716/481/non_2x/facebook-icon-free-png.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Facebook Ads</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Advertising</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("facebook-ads")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://www.abcsubmit.com/site/wp-content/uploads/2019/10/activecampaign-logo.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>ActiveCampaign</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Marketing automations</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("activecampaign")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://logos-world.net/wp-content/uploads/2023/09/Salesforce-Logo.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Salesforce Pardot</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>B2B marketing automations</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("salesforce-pardot")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://logos-world.net/wp-content/uploads/2023/09/Adobe-Logo.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Marketo</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Marketing automations</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("marketo")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://assets.website-files.com/5e7280fb3e6af0fdfbba222d/645bf2108011b956c8db6161_630eacf87339696304ac8789_sailthru-logo-vector-p-500.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Sailthru</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Marketing automations</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("sailthru")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://logos-world.net/wp-content/uploads/2020/09/Oracle-Logo.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Oracle Eloqua</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Marketing automations</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("oracle-eloqua")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://www.freelogovectors.net/svg03/emarsys-logo.svg" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Emarsys</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Marketing automations</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("emarsys")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://svglogos.net/wp-content/uploads/google-campaign-manager.svg" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Google Campaigns</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Advertising</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("google-campaigns")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://img.freepik.com/premium-vector/tik-tok-logo_578229-290.jpg" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>TikTok Ads</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Advertising</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("tiktok-ads")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://logospng.org/download/linkedin/logo-linkedin-icon-1536.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>LinkedIn Marketing</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>B2B marketing</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("linkedin-marketing")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://vectorseek.com/wp-content/uploads/2023/08/Google-Ad-Manager-Logo-Vector.svg-.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Google Ads Manager</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Advertising platform</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("google-ads-manager")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* HR & Educator */}
          <div>
            <h3 className="text-xl font-medium mb-3 border-b">Ars | HR & Educator Integrations</h3>
            <p className="text-gray-600 mb-4">
              These integrations help the HR & Educator agent manage talent development and training programs. 
              They provide tools for recruitment, employee engagement, and learning management. 
              The agent can track progress and personalize development paths for individuals.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://talentedlearning.com/wp-content/uploads/2022/09/intellum_small.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                  <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Intellum</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Learning platform</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("intellum")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                    <img src="https://vectorified.com/images/workday-icon-29.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                  <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Workday</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>AAAAAA</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("workday")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://www.lever.co/wp-content/uploads/2019/04/lever_rgb_logo_standard_transparent_no-padding.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                  <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Lever</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Recruiting platform</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("lever")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://assets-global.website-files.com/62fe5b9ef9e612fe4fed7ff1/63bf4122ced9145885a65b12_g-icon-green.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                  <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Greenhouse</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Hiring platform</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("greenhouse")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://jobs.mindtheproduct.com/wp-content/uploads/company_logos/2017/10/workable_logo-01-1-1024x1024.jpg" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                  <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Workable</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Recruiting platform</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("workable")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://336118.selcdn.ru/Gutsy-Culebra/products/BambooHR-Logo.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                  <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>BambooHR</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>HR software</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("bamboohr")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://logodix.com/logo/1816066.jpg" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                  <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Gusto</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Payroll & benefits</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("gusto")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://images.seeklogo.com/logo-png/50/1/zoho-corporation-logo-png_seeklogo-506148.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                  <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Zoho People</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>HR management</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("zoho-people")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://res.cloudinary.com/apideck/image/upload/v1635821547/icons/adp-workforce-now.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                  <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>ADP Workforce</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>HR & payroll</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("adp-workforce")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://kayansoftware.com/wp-content/uploads/2022/11/SAP-Success-Factor-HCM.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                  <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>SAP SuccessFactor</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>HCM software</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("sap-successfactors")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* IT Operations */}
          <div>
            <h3 className="text-xl font-medium mb-3 border-b">Musho | IT Operations Integrations</h3>
            <p className="text-gray-600 mb-4">
              These integrations enable the IT Operations agent to monitor and maintain technical infrastructure. 
              They provide tools for version control, deployment automation, and system monitoring. 
              The agent can ensure system reliability while streamlining development workflows.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                    <img src="https://mms.businesswire.com/media/20210504005122/en/872407/23/vanta-logo-black.jpg" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Vanta</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Cyber compliance</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("clickup")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                    <img src="https://cdn2.iconfinder.com/data/icons/social-icons-color/512/stackoverflow-1024.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Stackoverflow</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Coding issues</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("clickup")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                    <img src="https://download.logo.wine/logo/Snowflake_Inc./Snowflake_Inc.-Logo.wine.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Snowflake</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Data warehouse</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("snowflake")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                    <img src="https://cdn-icons-png.flaticon.com/512/25/25231.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>GitHub</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Code repositories</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("github")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                    <img src="https://cdn.worldvectorlogo.com/logos/jira-1.svg" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Jira</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Issue management</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("jira")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Lawyer */}
          <div>
            <h3 className="text-xl font-medium mb-3 border-b">Lawyer Integrations</h3>
            <p className="text-gray-600 mb-4">
              These integrations assist the Lawyer agent with document management and legal workflows. 
              They provide tools for secure document signing, case management, and compliance tracking. 
              The agent can streamline client interactions while maintaining confidentiality.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://logos-world.net/wp-content/uploads/2024/05/DocuSign-Symbol.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>DocuSign</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>E-signatures</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("docusign")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              {/* Dropbox Sign */}
              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://www.teamim.com/hubfs/dropbox-logo-resize.png#keepProtocol" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Dropbox Sign</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>E-signatures</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("dropbox-sign")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              {/* PandaDoc */}
              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://www.freelogovectors.net/wp-content/uploads/2022/03/pandadoc_logo_freelogovectors.net_.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>PandaDoc</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Document management</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("pandadoc")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sales Assistant */}
          <div>
            <h3 className="text-xl font-medium mb-3 border-b">Sergo | Sales Assistant Integrations</h3>
            <p className="text-gray-600 mb-4">
              These integrations help the Sales Assistant agent track leads and manage customer relationships. 
              They provide tools for pipeline management, sales analytics, and outreach automation. 
              The agent can identify opportunities and personalize engagement at scale.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://asset.brandfetch.io/idY56OZ9sE/id4qjc_3ln.jpeg?updated=1717667021983" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Apollo.io</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Sales intelligence</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("apollo")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://logosandtypes.com/wp-content/uploads/2023/03/Gong.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Gong</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Revenue intelligence</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("gong")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://vectorlogoseek.com/wp-content/uploads/2019/11/outreach-io-vector-logo.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Outreach</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Sales engagement</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("outreach")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                    <img src="https://toolsmetric.com/wp-content/uploads/2021/07/Close-Logo-1.jpg" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Close</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>CRM</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("trello")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                    <img src="https://images.seeklogo.com/logo-png/50/1/zoho-corporation-logo-png_seeklogo-506148.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Zoho CRM</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Customer relationships</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("trello")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                    <img src="https://logos-world.net/wp-content/uploads/2022/11/Pipedrive-Emblem-500x281.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Pipedrive</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>CRM</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("trello")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                    <img src="https://www.softwareabc24.de/logos/freshsales-logo.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Freshsales</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>CRM</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("trello")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                    <img src="https://salesdorado.com/wp-content/uploads/2021/02/insightly.jpg" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Insightly</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>CRM</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("trello")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://logowik.com/content/uploads/images/salesloft-new3582.jpg" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Salesloft</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Sales engagement</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("salesloft")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Accountant & Advisor */}
          <div>
            <h3 className="text-xl font-medium mb-3 border-b">Kamo | Accountant Integrations</h3>
            <p className="text-gray-600 mb-4">
              These integrations enable the Accountant & Advisor agent to manage financial data and reporting. 
              They provide tools for bookkeeping, tax preparation, and financial analysis. 
              The agent can ensure compliance while delivering strategic financial insights.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://logolook.net/wp-content/uploads/2022/10/Dynamics-365-Emblem.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                  <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Dynamics 365 Business Central</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>ERP system</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("dynamics-business-central")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://logolook.net/wp-content/uploads/2022/10/Dynamics-365-Emblem.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                  <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Dynamics 365 Finance</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Financial management</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("dynamics-finance")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://logos-world.net/wp-content/uploads/2021/09/NetSuite-Emblem.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                  <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>NetSuite</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Cloud ERP</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("netsuite")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://logos-world.net/wp-content/uploads/2020/09/Oracle-Logo.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                  <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Oracle Financial Cloud</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Financial management</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("oracle-financials")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://www.manybookkeeping.co.uk/wp-content/uploads/2021/05/logo-quickbooks.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                  <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>QuickBooks</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Accounting</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("quickbooks")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://grandeconsumo.com/wp-content/uploads/2017/11/upload19077_0-758x569.jpg" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                  <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Sage Accounting</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Financial software</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("sage-accounting")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://grandeconsumo.com/wp-content/uploads/2017/11/upload19077_0-758x569.jpg" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                  <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Sage Intact</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Cloud financial management</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("sage-intacct")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://logos-world.net/wp-content/uploads/2022/02/SAP-Symbol.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                  <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>SAP S/4HANA</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Enterprise ERP</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("sap-s4hana")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://cdn.shopify.com/app-store/listing_images/f8738fdb070afeb357c492b9b3bccb4c/icon/CJjCyeXh3PUCEAE=.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                  <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Xero</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Cloud accounting</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("xero")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Business Development */}
          <div>
            <h3 className="text-xl font-medium mb-3 border-b">Hracho | Business Development Integrations</h3>
            <p className="text-gray-600 mb-4">
              These integrations help the Business Development agent research opportunities and partnerships. 
              They provide tools for market analysis, company research, and relationship tracking. 
              The agent can identify growth opportunities and strategic alliances.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://vectorseek.com/wp-content/uploads/2023/10/Productboard-Logo-Vector.svg-.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                  <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Productboard</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Product management</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("productboard")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                    <img src="https://www.pngmart.com/files/23/Tableau-Logo-PNG-HD.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                  <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Tableau</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Data visualization</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("tableau")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                    <img src="https://static.amarello.cloud/img/bigquery.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                  <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>BigQuery</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Data warehouse</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("bigquery")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                  <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Amazon S3</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Cloud storage</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("amazon-s3")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                    <img src="https://amplitude.com/favicon.ico" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                  <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Amplitude</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Product analytics</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("amplitude")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                    <img src="https://segment.com/favicon.ico" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                  <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Segment</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Customer data platform</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("segment")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              {/* Heap */}
              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                    <img src="https://www.heap.io/favicon.ico" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                  <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Heap</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Product analytics</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("heap")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              {/* Google Analytics */}
              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                    <img src="https://logos-world.net/wp-content/uploads/2021/02/Google-Analytics-Logo.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                  <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Google Analytics</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Web analytics</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("google-analytics")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              {/* Mixpanel */}
              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                    <img src="https://gdm-catalog-fmapi-prod.imgix.net/ProductLogo/b450d568-551b-4a8b-a28b-d2318c001b37.png?w=128&h=128&fit=max&dpr=3&auto=format&q=50" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                  <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Mixpanel</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Product analytics</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("mixpanel")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              {/* Google Search */}
              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                    <img src="https://freelogopng.com/images/all_img/1657952440google-logo-png-transparent.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                  <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Google Search</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Search engine data</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("google-search")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                    <img src="https://cdn.freelogovectors.net/wp-content/uploads/2023/11/power-bi-logo-freelogovectors.net_.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                  <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Power BI</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Business analytics</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("power-bi")}
                    className="w-full border-red-500 bg-red-100 text-red-500 hover:border-red-400 hover:bg-red-50 hover:text-red-400"
                  >
                    In Development
                  </Button>
                </div>
              </div>
              
            </div>
          </div>

          {/* Productivity Agent */}
          <div>
            <h3 className="text-xl font-medium mb-3 border-b">Zara | Productivity Assistant Integrations</h3>
            <p className="text-gray-600 mb-4">
              These integrations help the Business Development agent research opportunities and partnerships. 
              They provide tools for market analysis, company research, and relationship tracking. 
              The agent can identify growth opportunities and strategic alliances.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                    <img src="https://cdn.worldvectorlogo.com/logos/todoist.svg" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Todoist</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Task management</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("todoist")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                    <img src="https://cdn.worldvectorlogo.com/logos/clickup.svg" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>ClickUp</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Project management</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("clickup")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                    <img src="https://cdn.worldvectorlogo.com/logos/trello.svg" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Trello</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Project management</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("trello")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                    <img src="https://logos-world.net/wp-content/uploads/2021/02/Asana-Symbol.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Asana</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Task management</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("asana")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                    <img src="https://images.seeklogo.com/logo-png/48/1/shortcut-icon-logo-png_seeklogo-486875.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Shortcuts</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Task automations</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("power-bi")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

              <div className={cn(
                "rounded-lg shadow-sm p-5 flex flex-col border",
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md shrink-0 overflow-hidden">
                  <img src="https://seeklogo.com/images/H/hive-logo-5591528274-seeklogo.com.png" alt="logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>Hive</h4>
                    <p className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Productivity software</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <Button
                    onClick={() => handleConnect("lever")}
                    className="w-full"
                  >
                    Manage Connection
                  </Button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ParagonIntegration;
