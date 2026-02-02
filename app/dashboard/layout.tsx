import Sidebar from "../components/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-primary-500/30">

            {/* Sidebar Component */}
            <div className="w-72 flex-shrink-0 fixed inset-y-0 z-50">
                <Sidebar />
            </div>

            {/* Main Content Wrapper */}
            <div className="flex-1 ml-72 flex flex-col min-h-screen relative transition-all duration-300">

                {/* Soft Ambient Glow (Top Right) */}
                <div className="absolute top-0 right-[-10%] w-[800px] h-[600px] bg-[#1500FF]/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-[20%] left-[25%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

                {/* Content */}
                <div className="relative z-10 w-full">
                    {children}
                </div>

            </div>
        </div>
    );
}
