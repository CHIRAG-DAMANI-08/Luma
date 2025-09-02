"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useForm, useFormContext, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import styles from "./onboarding.module.css";

// Shadcn Components
// Shadcn Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentUpload } from "@/components/document-upload";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Form schemas for each step
const personalInfoSchema = z.object({
  nickname: z.string().min(2, "Nickname must be at least 2 characters").max(30),
  pronouns: z.string().optional(),
  timezone: z.string().min(1, "Please select your timezone"),
  preferredLanguage: z.string().min(1, "Please select your preferred language"),
});

const healthInfoSchema = z.object({
  medicalConditions: z.string().optional(),
  currentMedications: z.string().optional(),
  therapyExperience: z.string().optional(),
  comfortLevel: z.number().min(1).max(5),
});

const goalsSchema = z.object({
  goals: z.string().min(10, "Please provide more details about your goals"),
  checkInFrequency: z.enum(["daily", "few_times_week", "weekly", "as_needed"]),
});

const documentSchema = z.object({
  documentUrl: z.string().optional(),
});

const formSchema = personalInfoSchema
  .merge(healthInfoSchema)
  .merge(goalsSchema)
  .merge(documentSchema);

type FormData = {
  nickname: string;
  pronouns?: string;
  timezone: string;
  preferredLanguage: string;
  medicalConditions?: string;
  currentMedications?: string;
  therapyExperience?: string;
  comfortLevel: number;
  goals: string;
  checkInFrequency: "daily" | "few_times_week" | "weekly" | "as_needed";
  documentUrl?: string;
};

// Mock timezones and languages
const timezones = [
  { value: "UTC-12:00", label: "UTC-12:00" },
  { value: "UTC-08:00", label: "PST (UTC-8)" },
  { value: "UTC-05:00", label: "EST (UTC-5)" },
  { value: "UTC+00:00", label: "GMT (UTC+0)" },
  { value: "UTC+05:30", label: "IST (UTC+5:30)" },
];

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "hi", label: "हिंदी" },
];

// Step 1: Personal Information
function PersonalInfoStep() {
  const { register, control, formState: { errors } } = useFormContext<FormData>();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
        <p className="text-muted-foreground mb-6">
          Let's get to know you better. This information helps us personalize
          your experience.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="nickname" className="block text-sm font-medium mb-1">
            What should we call you? *
          </label>
          <Input
            id="nickname"
            {...register("nickname")}
            placeholder="e.g., Alex"
          />
          {errors.nickname && (
            <p className="text-sm text-red-500 mt-1">
              {errors.nickname.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="pronouns" className="block text-sm font-medium mb-1">
            Pronouns (optional)
          </label>
          <Input
            id="pronouns"
            {...register("pronouns")}
            placeholder="e.g., they/them, she/her, he/him"
          />
        </div>

        <div>
          <label htmlFor="timezone" className="block text-sm font-medium mb-1">
            Timezone *
          </label>
          <Controller
            name="timezone"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.timezone && (
            <p className="text-sm text-red-500 mt-1">
              {errors.timezone.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="preferredLanguage" className="block text-sm font-medium mb-1">
            Preferred Language *
          </label>
          <Controller
            name="preferredLanguage"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your preferred language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.preferredLanguage && (
            <p className="text-sm text-red-500 mt-1">
              {errors.preferredLanguage.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Step 2: Health Information
function HealthInfoStep({ comfortLevel }: { comfortLevel: number }) {
  const { 
    control, 
    register, 
    formState: { errors }, 
    setValue 
  } = useFormContext<FormData>();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-6">Health Information</h2>
        <p className="text-muted-foreground mb-6">
          Share any relevant health information to help us better support you.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="medicalConditions"
            className="block text-sm font-medium mb-1"
          >
            Medical Conditions (optional)
          </label>
          <Textarea
            id="medicalConditions"
            {...register("medicalConditions")}
            placeholder="e.g., Anxiety, Depression, ADHD"
            rows={3}
          />
        </div>

        <div>
          <label
            htmlFor="currentMedications"
            className="block text-sm font-medium mb-1"
          >
            Current Medications (optional)
          </label>
          <Textarea
            id="currentMedications"
            {...register("currentMedications")}
            placeholder="e.g., Sertraline 50mg daily, Adderall XR 20mg"
            rows={3}
          />
        </div>

        <div>
          <label
            htmlFor="therapyExperience"
            className="block text-sm font-medium mb-1"
          >
            Previous Therapy Experience (optional)
          </label>
          <Textarea
            id="therapyExperience"
            {...register("therapyExperience")}
            placeholder="Tell us about your past therapy experiences, if any"
            rows={3}
          />
        </div>
        <div className="pt-4">
          <label className="block text-sm font-medium mb-4">
            How comfortable are you discussing mental health?
            <span className="ml-1 text-muted-foreground">
              ({comfortLevel}/5)
            </span>
          </label>
          <div className="px-2">
            <Controller
              name="comfortLevel"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  className="grid grid-cols-5 gap-3"
                  value={String(field.value)}
                  onValueChange={(val) => {
                    const num = parseInt(val, 10);
                    field.onChange(num);
                    setValue("comfortLevel", num, { shouldValidate: true });
                  }}
                >
                  <label className="flex flex-col items-center gap-2">
                    <RadioGroupItem value="1" />
                    <span className="text-xs">1</span>
                  </label>
                  <label className="flex flex-col items-center gap-2">
                    <RadioGroupItem value="2" />
                    <span className="text-xs">2</span>
                  </label>
                  <label className="flex flex-col items-center gap-2">
                    <RadioGroupItem value="3" />
                    <span className="text-xs">3</span>
                  </label>
                  <label className="flex flex-col items-center gap-2">
                    <RadioGroupItem value="4" />
                    <span className="text-xs">4</span>
                  </label>
                  <label className="flex flex-col items-center gap-2">
                    <RadioGroupItem value="5" />
                    <span className="text-xs">5</span>
                  </label>
                </RadioGroup>
              )}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Not comfortable</span>
              <span>Very comfortable</span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-1">How often would you like to check in? *</p>
          <label className="block text-sm font-medium mb-1">
            <Controller
              name="checkInFrequency"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select check-in frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="few_times_week">A few times a week</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="as_needed">As needed</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

// Step 3: Goals
function GoalsStep() {
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext<FormData>();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-6">Your Goals</h2>
        <p className="text-muted-foreground mb-6">
          What would you like to achieve through therapy?
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="goals" className="block text-sm font-medium mb-1">
            Your Goals *
          </label>
          <Textarea
            id="goals"
            {...register("goals")}
            placeholder="e.g., I want to manage my anxiety, improve my relationships, and develop better coping strategies"
            rows={4}
          />
          {errors.goals && (
            <p className="text-sm text-red-500 mt-1">{errors.goals.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            How often would you like to check in? *
          </label>
          <Controller
            name="checkInFrequency"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select check-in frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="few_times_week">A few times a week</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="as_needed">As needed</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  // Authentication and routing hooks
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  // State hooks
  const [step, setStep] = useState(1);
  const totalSteps = 4; // Steps: Personal Info, Health Info, Goals, Documents

  // Form hooks
  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: "",
      pronouns: "",
      timezone: "",
      preferredLanguage: "",
      medicalConditions: "",
      currentMedications: "",
      therapyExperience: "",
      comfortLevel: 3,
      goals: "",
      checkInFrequency: "few_times_week",
      documentUrl: "",
    },
  });

  const {
    handleSubmit,
    formState: { isValid: isFormValid, isSubmitting: isFormSubmitting, errors },
    watch,
    setValue,
    trigger,
    getValues,
  } = methods;

  const comfortLevel = watch("comfortLevel");

  const stepFields: Record<number, (keyof FormData)[]> = {
    1: ["nickname", "timezone", "preferredLanguage"],
    2: ["comfortLevel", "checkInFrequency"],
    3: ["goals", "checkInFrequency"],
    4: [], // Documents step (no required fields here)
  };
  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-in");
    }
  }, [isLoaded, userId, router]);

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch("/api/onboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        // Try to parse as JSON, but handle non-JSON responses
        let errorMessage = "Failed to save onboarding data";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // If response is not JSON (e.g., HTML error page)
          errorMessage = `Server error (${response.status}): Unable to process your request`;
        }
        throw new Error(errorMessage);
      }
  
      // If this is the last step, show success and redirect
      if (step === totalSteps) {
        toast.success("Onboarding completed successfully!");
        router.push("/dashboard");
      } else {
        // Move to next step if not the last step
        setStep(step + 1);
        window.scrollTo(0, 0);
      }
    } catch (error) {
      console.error("Error during form submission:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred during submission"
      );
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <PersonalInfoStep />;
      case 2:
        return <HealthInfoStep comfortLevel={comfortLevel} />;
      case 3:
        return <GoalsStep />;
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Share Documents</h2>
              <p className="text-muted-foreground">
                Upload any important documents you'd like to share with your
                team
              </p>
            </div>
            <DocumentUpload />
          </div>
        );
      default:
        return null;
    }
  };

  // Show loading state while checking authentication
  if (!isLoaded || !userId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">Welcome to Luma</h1>
          <p className="text-muted-foreground">
            Let's set up your profile to personalize your experience
          </p>

          {/* Progress indicator */}
          <div className="w-full bg-muted rounded-full h-2.5 mt-8 mb-12">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-card p-8 rounded-lg shadow-sm border">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {renderStep()}
              <div className="flex justify-between pt-6 border-t">
              <Button 
                  type="button" 
                  disabled={isFormSubmitting}
                  onClick={async (e) => {
                    e.preventDefault();

                    // Validate current step fields only
                    const fields = stepFields[step] ?? [];
                    const isValid = fields.length ? await trigger(fields as any) : await trigger();

                    if (!isValid) {
                      const firstError = Object.keys(errors)[0];
                      if (firstError) {
                        const element = document.querySelector(`[name="${firstError}"]`);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }
                      return;
                    }

                    // Advance steps until final; only submit on final step
                    if (step < totalSteps) {
                      setStep(step + 1);
                      window.scrollTo(0, 0);
                      return;
                    }

                    await handleSubmit(onSubmit)(e as any);
                  }}
                >
                  {isFormSubmitting ? 'Processing...' : step === totalSteps ? 'Complete Setup' : 'Continue'}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}
