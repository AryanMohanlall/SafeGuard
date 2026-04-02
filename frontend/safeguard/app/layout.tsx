import type { Metadata } from "next";
import { ConfigProvider } from "antd";
import { IBM_Plex_Sans, IBM_Plex_Mono, Rajdhani } from "next/font/google";
import { AlertProvider } from "@/providers/alert-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { CaseProvider } from "@/providers/cases-provider";
import { DispatchProvider } from "@/providers/dispatch-provider";
import { EvidenceProvider } from "@/providers/evidence-provider";
import { IncidentClusteringProvider } from "@/providers/incident-clustering-provider";
import { IncidentProvider } from "@/providers/incidents-provider";
import { LiveStreamProvider } from "@/providers/live-streams-provider";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const rajdhani = Rajdhani({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SafeGuard",
  description: "Digitising the Justice System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} ${rajdhani.variable}`}>
      <body>
        <AuthProvider>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: "#2563eb",
                borderRadius: 8,
                fontFamily: "inherit",
              },
              components: {
                Menu: {
                  darkItemBg: "#0a0f1e",
                  darkSubMenuItemBg: "#0d1a3a",
                  darkItemSelectedBg: "#2563eb",
                  darkItemHoverBg: "rgba(37, 99, 235, 0.18)",
                },
                Layout: {
                  siderBg: "#0a0f1e",
                  triggerBg: "#0d1a3a",
                },
              },
            }}
          >
            <AlertProvider>
              <IncidentClusteringProvider>
                <IncidentProvider>
                  <EvidenceProvider>
                    <CaseProvider>
                      <DispatchProvider>
                        <LiveStreamProvider>{children}</LiveStreamProvider>
                      </DispatchProvider>
                    </CaseProvider>
                  </EvidenceProvider>
                </IncidentProvider>
              </IncidentClusteringProvider>
            </AlertProvider>
          </ConfigProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
