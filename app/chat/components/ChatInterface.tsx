"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Calendar, TrendingUp, Search, Mic, MicOff, Play, Pause, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { UserButton, useUser } from "@clerk/nextjs";

/**
 * List of mental health suggestion cards for quick actions.
 */
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

interface VoiceMessage {
	id: string;
	audioUrl: string;
	duration: number;
	timestamp: Date;
	isPlaying: boolean;
	currentTime: number;
	isUser: boolean;
	waveform: number[];
}

/**
 * Renders a simple waveform for a voice message.
 * @param {Object} props
 * @param {number[]} props.waveform - Array of amplitude values.
 * @param {string} props.audioUrl - URL of the audio file.
 */
function VoiceWaveform({
	waveform,
	audioUrl,
}: {
	waveform: number[];
	audioUrl: string;
}) {
	const audioRef = useRef<HTMLAudioElement>(null);

	return (
		<div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-2 mt-2">
			{/* Waveform bars */}
			<div className="flex items-end h-8 gap-[2px]">
				{waveform.map((amp, idx) => (
					<div
						key={idx}
						className="bg-purple-400 rounded"
						style={{
							width: "3px",
							height: `${Math.max(amp, 4)}px`,
							transition: "height 0.2s",
						}}
					/>
				))}
			</div>
			{/* Play button and audio */}
			<audio ref={audioRef} src={audioUrl} controls className="h-8" />
		</div>
	);
}

/**
 * Enhanced voice message bubble with WhatsApp-like functionality
 */
function VoiceMessageBubble({
	message,
	onPlay,
	onPause,
}: {
	message: VoiceMessage;
	onPlay: (id: string) => void;
	onPause: (id: string) => void;
}) {
	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	const progress = message.duration > 0 ? (message.currentTime / message.duration) * 100 : 0;

	return (
		<div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}>
			<div
				className={`max-w-xs rounded-xl px-4 py-3 ${
					message.isUser
						? 'bg-purple-400 text-white'
						: 'bg-gray-100 text-black'
				}`}
			>
				<div className="flex items-center gap-3">
					<Button
						size="sm"
						variant="ghost"
						className={`rounded-full w-8 h-8 p-0 ${
							message.isUser 
								? 'hover:bg-purple-500 text-white' 
								: 'hover:bg-gray-200 text-black'
						}`}
						onClick={() => message.isPlaying ? onPause(message.id) : onPlay(message.id)}
					>
						{message.isPlaying ? (
							<Pause className="w-4 h-4" />
						) : (
							<Play className="w-4 h-4" />
						)}
					</Button>
					
					{/* Waveform visualization */}
					<div className="flex-1 h-8 relative">
						<div className="flex items-end h-full gap-1">
							{message.waveform.slice(0, 20).map((amp, i) => (
								<div
									key={i}
									className={`rounded-full transition-all duration-150 ${
										message.isUser ? 'bg-white' : 'bg-purple-400'
									}`}
									style={{
										width: '2px',
										height: `${Math.max(amp / 4, 4)}px`,
										opacity: (i / 20) * 100 < progress ? 1 : 0.3,
									}}
								/>
							))}
						</div>
						{/* Progress bar overlay */}
						<div
							className={`absolute bottom-0 left-0 h-1 rounded-full transition-all duration-150 ${
								message.isUser ? 'bg-white' : 'bg-purple-400'
							}`}
							style={{ width: `${progress}%` }}
						/>
					</div>
					
					<span className={`text-xs ${message.isUser ? 'text-purple-100' : 'text-gray-600'}`}>
						{formatTime(message.isPlaying ? message.currentTime : message.duration)}
					</span>
				</div>
			</div>
		</div>
	);
}

/**
 * Voice recording component with visual feedback
 */
function VoiceRecorder({
	isRecording,
	recordingTime,
	onStopRecording,
	onCancelRecording,
}: {
	isRecording: boolean;
	recordingTime: number;
	onStopRecording: () => void;
	onCancelRecording: () => void;
}) {
	const formatRecordingTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	if (isRecording) {
		return (
			<div className="flex items-center gap-3 bg-red-50 rounded-2xl px-4 py-3 border border-red-200 mb-4">
				<Button
					size="sm"
					variant="ghost"
					onClick={onCancelRecording}
					className="text-red-500 hover:bg-red-100 rounded-full w-8 h-8 p-0"
				>
					<X className="w-4 h-4" />
				</Button>
				
				<div className="flex items-center gap-2 flex-1">
					<div className="flex items-center gap-1">
						{Array.from({ length: 8 }, (_, i) => (
							<div
								key={i}
								className="w-1 bg-red-500 rounded-full animate-pulse"
								style={{
									height: `${Math.sin(i * 0.5 + recordingTime) * 8 + 12}px`,
									animationDelay: `${i * 150}ms`,
								}}
							/>
						))}
					</div>
					<span className="text-red-500 font-mono text-sm">
						{formatRecordingTime(recordingTime)}
					</span>
				</div>
				
				<Button
					size="sm"
					onClick={onStopRecording}
					className="bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 p-0"
				>
					<Send className="w-4 h-4" />
				</Button>
			</div>
		);
	}

	return null;
}

/**
 * Main chat interface component.
 * Shows greeting, user info, suggestion cards, input area, and voice recording.
 */
const ChatInterface = () => {
	const { user } = useUser();
	const [voiceMessages, setVoiceMessages] = useState<VoiceMessage[]>([]);
	const [isRecording, setIsRecording] = useState(false);
	const [recordingTime, setRecordingTime] = useState(0);
	const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
	const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
	const recordingIntervalRef = useRef<NodeJS.Timeout>();
	const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

	/**
	 * Start voice recording
	 */
	const startRecording = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const recorder = new MediaRecorder(stream);
			
			recorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					setAudioChunks(prev => [...prev, event.data]);
				}
			};
			
			recorder.onstop = () => {
				stream.getTracks().forEach(track => track.stop());
			};
			
			setMediaRecorder(recorder);
			setAudioChunks([]);
			recorder.start();
			setIsRecording(true);
			setRecordingTime(0);
			
			recordingIntervalRef.current = setInterval(() => {
				setRecordingTime(prev => prev + 1);
			}, 1000);
		} catch (error) {
			console.error('Error starting recording:', error);
			alert('Unable to access microphone. Please check permissions.');
		}
	};

	/**
	 * Stop voice recording and create voice message
	 */
	const stopRecording = () => {
		if (mediaRecorder && mediaRecorder.state !== 'inactive') {
			mediaRecorder.stop();
			setIsRecording(false);
			
			if (recordingIntervalRef.current) {
				clearInterval(recordingIntervalRef.current);
			}
			
			// Process the recorded audio
			mediaRecorder.addEventListener('stop', () => {
				const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
				const audioUrl = URL.createObjectURL(audioBlob);
				
				// Generate a fake waveform
				const fakeWaveform = Array.from({ length: 40 }, () =>
					Math.floor(Math.random() * 32 + 4)
				);
				
				const newMessage: VoiceMessage = {
					id: Date.now().toString(),
					audioUrl,
					duration: recordingTime,
					timestamp: new Date(),
					isPlaying: false,
					currentTime: 0,
					isUser: true,
					waveform: fakeWaveform,
				};
				
				setVoiceMessages(prev => [...prev, newMessage]);
				
				// Here you would typically send the audioBlob to your backend
				// sendVoiceMessageToBackend(audioBlob);
			});
		}
	};

	/**
	 * Cancel voice recording
	 */
	const cancelRecording = () => {
		if (mediaRecorder && mediaRecorder.state !== 'inactive') {
			mediaRecorder.stop();
		}
		setIsRecording(false);
		setRecordingTime(0);
		setAudioChunks([]);
		
		if (recordingIntervalRef.current) {
			clearInterval(recordingIntervalRef.current);
		}
	};

	/**
	 * Play voice message
	 */
	const playVoiceMessage = (id: string) => {
		const message = voiceMessages.find(msg => msg.id === id);
		if (!message) return;

		// Stop other playing messages
		voiceMessages.forEach(msg => {
			if (msg.id !== id && msg.isPlaying) {
				const audio = audioRefs.current[msg.id];
				if (audio) {
					audio.pause();
					audio.currentTime = 0;
				}
			}
		});

		setVoiceMessages(prev => prev.map(msg => ({
			...msg,
			isPlaying: msg.id === id ? true : false,
			currentTime: msg.id === id ? msg.currentTime : 0,
		})));

		// Create or get audio element
		if (!audioRefs.current[id]) {
			const audio = new Audio(message.audioUrl);
			audioRefs.current[id] = audio;
			
			audio.addEventListener('timeupdate', () => {
				setVoiceMessages(prev => prev.map(msg =>
					msg.id === id ? { ...msg, currentTime: audio.currentTime } : msg
				));
			});
			
			audio.addEventListener('ended', () => {
				setVoiceMessages(prev => prev.map(msg =>
					msg.id === id ? { ...msg, isPlaying: false, currentTime: 0 } : msg
				));
			});
		}

		audioRefs.current[id].play();
	};

	/**
	 * Pause voice message
	 */
	const pauseVoiceMessage = (id: string) => {
		const audio = audioRefs.current[id];
		if (audio) {
			audio.pause();
		}
		
		setVoiceMessages(prev => prev.map(msg =>
			msg.id === id ? { ...msg, isPlaying: false } : msg
		));
	};

	/**
	 * Handles voice message file upload and generates a fake waveform.
	 * @param e - File input change event
	 */
	const handleVoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const audioUrl = URL.createObjectURL(file);

		// Generate a fake waveform (replace with real waveform extraction for production)
		const fakeWaveform = Array.from({ length: 40 }, () =>
			Math.floor(Math.random() * 32 + 4)
		);

		// Create audio element to get duration
		const audio = new Audio(audioUrl);
		audio.addEventListener('loadedmetadata', () => {
			const newMessage: VoiceMessage = {
				id: Date.now().toString(),
				audioUrl,
				duration: audio.duration,
				timestamp: new Date(),
				isPlaying: false,
				currentTime: 0,
				isUser: true,
				waveform: fakeWaveform,
			};
			
			setVoiceMessages(prev => [...prev, newMessage]);
		});
	};

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (recordingIntervalRef.current) {
				clearInterval(recordingIntervalRef.current);
			}
			Object.values(audioRefs.current).forEach(audio => {
				audio.pause();
				audio.src = '';
			});
		};
	}, []);

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

				{/* Voice Recording Interface */}
				<div className="w-full max-w-2xl mx-auto">
					<VoiceRecorder
						isRecording={isRecording}
						recordingTime={recordingTime}
						onStopRecording={stopRecording}
						onCancelRecording={cancelRecording}
					/>
				</div>

				{/* Display voice messages with enhanced bubbles */}
				{voiceMessages.length > 0 && (
					<div className="w-full max-w-2xl mx-auto mb-6">
						{voiceMessages.map((message) => (
							<VoiceMessageBubble
								key={message.id}
								message={message}
								onPlay={playVoiceMessage}
								onPause={pauseVoiceMessage}
							/>
						))}
					</div>
				)}

				{/* Input Area for user to type messages and record voice */}
				<div className="w-full max-w-2xl mx-auto">
					<div className="relative flex items-center gap-2">
						<Input
							placeholder="Ask something..."
							className="pr-12 h-14 text-lg bg-gray-50 border border-[var(--border)] rounded-2xl shadow w-full text-black placeholder:text-black"
							disabled={isRecording}
						/>
						<Button
							size="icon"
							className="rounded-xl bg-gray-200 hover:bg-gray-300 text-black absolute right-2 top-1/2 transform -translate-y-1/2"
							disabled={isRecording}
						>
							<Send className="w-5 h-5" />
						</Button>
						
						{/* Enhanced voice recording button */}
						{isRecording ? (
							<Button
								size="icon"
								className="rounded-xl bg-red-500 hover:bg-red-600 text-white absolute left-2 top-1/2 transform -translate-y-1/2 animate-pulse"
								onClick={stopRecording}
							>
								<MicOff className="w-6 h-6" />
							</Button>
						) : (
							<>
								{/* Voice recording button */}
								<Button
									size="icon"
									className="rounded-xl bg-transparent hover:bg-gray-100 text-purple-400 absolute left-2 top-1/2 transform -translate-y-1/2"
									onClick={startRecording}
								>
									<Mic className="w-6 h-6" />
								</Button>
								{/* Hidden file input for voice upload (keeping your original functionality) */}
								<label className="absolute left-12 top-1/2 transform -translate-y-1/2 cursor-pointer opacity-0 pointer-events-none">
									<input
										type="file"
										accept="audio/*"
										onChange={handleVoiceUpload}
										className="hidden"
									/>
								</label>
							</>
						)}
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