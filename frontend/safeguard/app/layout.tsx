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
                colorPrimary: '#4f8df7',
                colorInfo: '#4f8df7',
                colorSuccess: '#0f766e',
                colorWarning: '#d97706',
                colorError: '#dc2626',
                colorBgBase: '#e8eef5',
                colorBgLayout: '#dbe4ee',
                colorBgContainer: 'rgba(255, 255, 255, 0.72)',
                colorText: '#0f172a',
                colorTextSecondary: '#334155',
                colorTextTertiary: '#64748b',
                colorBorder: 'rgba(100, 116, 139, 0.2)',
                colorBorderSecondary: 'rgba(148, 163, 184, 0.22)',
                colorFillSecondary: 'rgba(226, 232, 240, 0.68)',
                colorFillTertiary: 'rgba(241, 245, 249, 0.74)',
                borderRadius: 12,
                borderRadiusLG: 18,
                boxShadow: '0 18px 40px rgba(15, 23, 42, 0.14)',
                boxShadowSecondary: '0 12px 28px rgba(15, 23, 42, 0.1)',
                fontFamily: 'inherit',
              },
              components: {
                Button: {
                  borderRadius: 12,
                  primaryShadow: '0 12px 24px rgba(79, 141, 247, 0.24)',
                },
                Card: {
                  borderRadiusLG: 18,
                  colorBgContainer: 'rgba(255, 255, 255, 0.66)',
                },
                Drawer: {
                  colorBgElevated: 'rgba(247, 250, 252, 0.82)',
                },
                Input: {
                  activeBorderColor: '#4f8df7',
                  hoverBorderColor: '#7aa7f8',
                  colorBgContainer: 'rgba(255, 255, 255, 0.7)',
                },
                Layout: {
                  bodyBg: '#dbe4ee',
                  siderBg: 'rgba(185, 198, 214, 0.8)',
                  triggerBg: 'rgba(177, 191, 209, 0.92)',
                },
                Menu: {
                  itemBg: 'transparent',
                  itemColor: '#1e293b',
                  itemHoverColor: '#020617',
                  itemHoverBg: 'rgba(226, 232, 240, 0.82)',
                  itemSelectedColor: '#0f172a',
                  itemSelectedBg: 'rgba(207, 219, 234, 0.92)',
                  activeBarBorderWidth: 0,
                  iconSize: 18,
                },
                Segmented: {
                  trackBg: 'rgba(203, 213, 225, 0.72)',
                  itemSelectedBg: 'rgba(255, 255, 255, 0.82)',
                },
                Table: {
                  headerBg: 'rgba(226, 232, 240, 0.7)',
                  headerColor: '#1e293b',
                  borderColor: 'rgba(148, 163, 184, 0.22)',
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
