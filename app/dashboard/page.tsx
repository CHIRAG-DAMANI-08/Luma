import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MainNav } from "@/components/main-nav"

export default function DashboardPage() {
  return (
    <>
      <MainNav />
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Your Dashboard</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
            Your mental health journey starts here. We're here to support you every step of the way.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
            {/* Chat Card */}
            <div className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-2">Start a Conversation</h3>
              <p className="text-muted-foreground mb-4">Chat with Luma about anything on your mind.</p>
              <Button asChild className="w-full">
                <Link href="/chat">Chat Now</Link>
              </Button>
            </div>

            {/* Resources Card */}
            <div className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">Resources</h3>
              <p className="text-muted-foreground mb-4">Access helpful mental health resources and tools.</p>
              <Button variant="outline" className="w-full">
                <Link href="/resources">View Resources</Link>
              </Button>
            </div>

            {/* Profile Card */}
            <div className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-4">👤</div>
              <h3 className="text-xl font-semibold mb-2">Your Profile</h3>
              <p className="text-muted-foreground mb-4">Update your preferences and account settings.</p>
              <Button variant="outline" className="w-full">
                <Link href="/profile">View Profile</Link>
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-12 w-full max-w-3xl">
            <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto py-3" asChild>
                <Link href="/journal">
                  <span className="text-lg">✍️</span>
                  <span className="ml-2">Journal Entry</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-3" asChild>
                <Link href="/mood-tracker">
                  <span className="text-lg">😊</span>
                  <span className="ml-2">Track My Mood</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-3" asChild>
                <Link href="/goals">
                  <span className="text-lg">🎯</span>
                  <span className="ml-2">Set Goals</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-3" asChild>
                <Link href="/resources/emergency">
                  <span className="text-lg">🆘</span>
                  <span className="ml-2">Emergency Resources</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
