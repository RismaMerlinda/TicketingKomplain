import Sidebar from "../components/Sidebar";
import { SidebarProvider } from "../context/SidebarContext";
import MobileSidebarWrapper from "../components/MobileSidebarWrapper"; // We will create this helper

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-primary-500/30">

                {/* Sidebar Component - Desktop Fixed, Mobile managed by wrapper */}
                <MobileSidebarWrapper />

                {/* Main Content Wrapper */}
                {/* We need a wrapper that adjusts margin based on sidebar state? 
                    Actually, on mobile, sidebar is overlay, so margin is 0. 
                    On desktop, sidebar is fixed, margin is 72.
                    We can handle this via CSS media queries.
                */}
                <div className="flex-1 md:ml-72 flex flex-col min-h-screen relative transition-all duration-300">

                    {/* Soft Ambient Glow (Top Right) */}
                    <div className="absolute top-0 right-[-10%] w-[800px] h-[600px] bg-[#1500FF]/5 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute top-[20%] left-[25%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

                    {/* Content */}
                    <div className="relative z-10 w-full">
                        {children}
                    </div>

                </div>
            </div>
        </SidebarProvider>
    );
}
