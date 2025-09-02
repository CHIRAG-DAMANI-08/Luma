"use client";
import { useEffect, useState } from "react";
import { Search, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";

/**
 * Fetches recent chat session titles for the current user from the database.
 * @param userId - The Clerk user ID.
 * @returns Promise<string[]> - Array of chat titles.
 */
async function fetchRecentChats(userId: string): Promise<string[]> {
    // Example: fetch from /api/recent-chats?userId=...
    const res = await fetch(`/api/recent-chats?userId=${userId}`);
    if (!res.ok) return [];
    return await res.json();
}

/**
 * Sidebar component for the chat page.
 * Displays app branding, search bar, and recent chats for the logged-in user.
 */
const ChatSidebar = () => {
    const { user } = useUser();
    const [recentChats, setRecentChats] = useState<string[]>([]);

    /**
     * Loads recent chats from the database when the user is available.
     */
    useEffect(() => {
        if (user?.id) {
            fetchRecentChats(user.id).then((chats) => setRecentChats(chats));
        }
    }, [user?.id]);

    return (
        <aside className="w-72 min-w-[260px] h-screen bg-white border-r border-[var(--border)] flex flex-col px-6 py-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 bg-purple-400 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-center gap-2">
                    <h1 className="font-semibold text-lg text-black">Luma</h1>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-black font-bold">
                        Gemini 2.5 Pro
                    </span>
                </div>
            </div>
            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black" />
                <Input
                    placeholder="Search chat"
                    className="pl-10 bg-gray-50 border border-[var(--border)] rounded-lg w-full text-black placeholder:text-black"
                />
            </div>
            {/* Recent Chats */}
            <div className="flex-1">
                <h3 className="text-sm font-medium text-black mb-3 uppercase tracking-wider">
                    Recent Chats
                </h3>
                <div className="space-y-1">
                    {recentChats.length === 0 ? (
                        <span className="text-sm text-black">No recent chats found.</span>
                    ) : (
                        recentChats.map((chat: string, index: number) => (
                            <Button
                                key={index}
                                variant="ghost"
                                className="w-full justify-start h-auto p-3 text-left text-black"
                            >
                                <div className="flex items-center gap-3">
                                    <MessageSquare className="w-4 h-4 text-black" />
                                    <span className="text-sm truncate text-black">{chat}</span>
                                </div>
                            </Button>
                        ))
                    )}
                </div>
            </div>
        </aside>
    );
};

export default ChatSidebar;