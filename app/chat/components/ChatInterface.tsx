"use client";
import { Send, Calendar, TrendingUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { UserButton, useUser } from "@clerk/nextjs";

// List of mental health suggestion cards for quick actions.
const suggestions = [
	{
		icon: Calendar,
		title: "Daily mood check-in",
		description: "Reflect on your feelings and track your emotional wellbeing.",
		color: "from-purple-200 to-purple-400",
	},
	{
		icon: TrendingUp,
		title: "Mindfulness meditation",
		description: "Start a guided meditation to help you relax and focus.",
		color: "from-pink-200 to-purple-400",
	},
	{
		icon: Search,
		title: "Coping strategies",
		description: "Get tips and advice for managing stress and anxiety.",
		color: "from-indigo-200 to-purple-400",
	},
];

/**
 * Main chat interface component.
 * Shows greeting, user info, suggestion cards, and input area.
 */
const ChatInterface = () => {
	const { user } = useUser();

	return (
		<main className="flex-1 flex flex-col justify-center items-center px-4 py-8 md:px-12 relative">
			{/* Top right user info */}
			<div className="absolute top-8 right-8 flex items-center gap-3 z-10">
				<UserButton />
				{user && (
					<span className="text-black text-lg">
						{user.firstName} {user.lastName}
					</span>
				)}
			</div>
			<div className="w-full max-w-5xl flex flex-col items-center justify-center flex-1">
				{/* Greeting section with user's name */}
				<div className="text-center mb-12">
					<h1 className="text-4xl md:text-5xl font-light mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
						{user?.firstName ? `Hello ${user.firstName},` : "Hello"}
					</h1>
					<p className="text-xl md:text-2xl text-black font-light">
						How can I help you today?
					</p>
				</div>
				{/* Suggestion Cards for mental health actions */}
				<div className="w-full flex flex-col md:flex-row justify-center items-center gap-6 mb-12">
					{suggestions.map((suggestion, index) => (
						<Card
							key={index}
							className={`w-full md:w-80 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border border-[var(--border)] rounded-xl hover:scale-105 bg-gradient-to-r ${suggestion.color} flex flex-col items-start`}
						>
							<div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-4 shadow">
								<suggestion.icon className="w-6 h-6 text-purple-400" />
							</div>
							<h3 className="font-semibold mb-2 text-black">
								{suggestion.title}
							</h3>
							<p className="text-sm text-black leading-relaxed">
								{suggestion.description}
							</p>
						</Card>
					))}
				</div>
				{/* Input Area for user to type messages */}
				<div className="w-full max-w-2xl mx-auto">
					<div className="relative">
						<Input
							placeholder="Ask something..."
							className="pr-12 h-14 text-lg bg-gray-50 border border-[var(--border)] rounded-2xl shadow w-full text-black placeholder:text-black"
						/>
						<Button
							size="icon"
							className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-xl bg-gray-200 hover:bg-gray-300 text-black"
						>
							<Send className="w-5 h-5" />
						</Button>
					</div>
					<div className="text-center mt-4">
						<p className="text-sm text-black">
							Luma is only a mental health companion, if you are facing serious
							complications please consult an expert{" "}
						</p>
					</div>
				</div>
			</div>
		</main>
	);
};

export default ChatInterface;