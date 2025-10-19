'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LayoutDashboard, Settings, LogOut, Menu, X, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from 'next-themes';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { theme, setTheme } = useTheme();

    const toggleDarkMode = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard' || pathname.startsWith('/clients');
        }
        return pathname === href;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                <div className="flex flex-col flex-grow border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
                    <div className="flex items-center flex-shrink-0 px-4 py-6 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Designer App</h1>
                    </div>

                    <div className="mt-5 flex-1 flex flex-col">
                        <nav className="flex-1 px-2 space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.name}
                                        onClick={() => router.push(item.href)}
                                        className={`w-full group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                                            isActive(item.href)
                                                ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                                        {item.name}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* User Profile & Dark Mode Toggle */}
                    <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-gray-700 dark:text-gray-300">Dark Mode</span>
                            <button
                                onClick={toggleDarkMode}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                {theme === 'dark' ? (
                                    <Sun className="h-5 w-5 text-yellow-500" />
                                ) : (
                                    <Moon className="h-5 w-5 text-gray-600" />
                                )}
                            </button>
                        </div>

                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {session?.user?.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {session?.user?.email}
                                </p>
                            </div>
                            <button
                                onClick={() => signOut({ callbackUrl: '/login' })}
                                className="ml-3 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                >
                    <div className="fixed inset-0 bg-black bg-opacity-50" />
                </div>
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform transition-transform duration-300 ease-in-out lg:hidden ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between px-4 py-6 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Designer App</h1>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>

                    <nav className="flex-1 px-2 mt-5 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => {
                                        router.push(item.href);
                                        setSidebarOpen(false);
                                    }}
                                    className={`w-full group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                                        isActive(item.href)
                                            ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                                    {item.name}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-gray-700 dark:text-gray-300">Dark Mode</span>
                            <button
                                onClick={toggleDarkMode}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                {theme === 'dark' ? (
                                    <Sun className="h-5 w-5 text-yellow-500" />
                                ) : (
                                    <Moon className="h-5 w-5 text-gray-600" />
                                )}
                            </button>
                        </div>

                        <div className="flex items-center">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {session?.user?.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {session?.user?.email}
                                </p>
                            </div>
                            <button
                                onClick={() => signOut({ callbackUrl: '/login' })}
                                className="ml-3 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-64 flex flex-col fixed inset-0 lg:static">
                {/* Mobile Header */}
                <div className="flex-shrink-0 z-30 lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {navItems.find((item) => isActive(item.href))?.name || 'Dashboard'}
                    </h1>
                    <div className="w-10" /> {/* Spacer for centering */}
                </div>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto overscroll-none lg:pb-0" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {children}
                </main>

                {/* Mobile Bottom Navigation */}
                <nav className="flex-shrink-0 z-50 lg:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 h-16">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => router.push(item.href)}
                                    className={`flex flex-col items-center justify-center transition-colors ${
                                        isActive(item.href)
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-gray-600 dark:text-gray-400'
                                    }`}
                                >
                                    <Icon className="h-6 w-6 mb-1" />
                                    <span className="text-xs font-medium">{item.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </nav>
            </div>
        </div>
    );
}