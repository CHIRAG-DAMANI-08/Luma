"use client";
import { useAuth, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import HeroSection from "@/components/HeroSection";
import MainFeatureSection from "@/components/MainFeatures";
import CategoriesSection from "@/components/Categories";
import UserTypesSection from "@/components/UserTypes";
import BenefitsSection from "@/components/goBeyond";
import MediaSection from "@/components/Statement";
import CTASection from "@/components/Footer";
import GoingBeyondSection from "@/components/goBeyond";

export default function Home() {
  const { isSignedIn, userId } = useAuth();
  const router = useRouter();
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (isSignedIn && userId) {
        try {
          const response = await fetch(
            `/api/user/onboarding-status?userId=${userId}`
          );
          const data = await response.json();

          if (data.isOnboarded) {
            setIsOnboarded(true);
            router.push("/dashboard");
          } else {
            setIsOnboarded(false);
          }
        } catch (error) {
          console.error("Error checking onboarding status:", error);
          setIsOnboarded(false);
        }
      }
    };

    checkOnboardingStatus();
  }, [isSignedIn, userId, router]);

  // Show loading while checking onboarding status
  if (isSignedIn && isOnboarded === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Profile icon in top right */}
      <div className="absolute top-6 right-8 z-50">
        <UserButton afterSignOutUrl="/" />
      </div>
      <HeroSection />
      <MainFeatureSection />
      <CategoriesSection />
      <UserTypesSection />
      <GoingBeyondSection />
      <MediaSection />
      <CTASection />
    </div>
  );
}
