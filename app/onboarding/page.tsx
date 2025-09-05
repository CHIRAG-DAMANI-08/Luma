"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useForm, useFormContext, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Form schemas
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

const formSchema = personalInfoSchema.merge(healthInfoSchema).merge(goalsSchema);

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
};

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
        <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Personal Information</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Let's get to know you better. This information helps us personalize your experience.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="nickname" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            What should we call you? *
          </label>
          <Input
            id="nickname"
            {...register("nickname")}
            placeholder="e.g., Alex"
            style={{ background: '#fff', color: 'var(--text-primary)' }}
          />
          {errors.nickname && (
            <p className="text-sm text-red-500 mt-1">
              {errors.nickname.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="pronouns" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Pronouns (optional)
          </label>
          <Input
            id="pronouns"
            {...register("pronouns")}
            placeholder="e.g., they/them, she/her, he/him"
            style={{ background: '#fff', color: 'var(--text-primary)' }}
          />
        </div>

        <div>
          <label htmlFor="timezone" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Timezone *
          </label>
          <Controller
            name="timezone"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger style={{ background: '#fff', color: 'var(--text-primary)' }}>
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
          <label htmlFor="preferredLanguage" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Preferred Language *
          </label>
          <Controller
            name="preferredLanguage"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger style={{ background: '#fff', color: 'var(--text-primary)' }}>
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
  const { control, register, formState: { errors }, setValue } = useFormContext<FormData>();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Health Information</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Share any relevant health information to help us better support you.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="medicalConditions" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Medical Conditions (optional)
          </label>
          <Textarea
            id="medicalConditions"
            {...register("medicalConditions")}
            placeholder="e.g., Anxiety, Depression, ADHD"
            rows={3}
            style={{ background: '#fff', color: 'var(--text-primary)' }}
          />
        </div>

        <div>
          <label htmlFor="currentMedications" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Current Medications (optional)
          </label>
          <Textarea
            id="currentMedications"
            {...register("currentMedications")}
            placeholder="e.g., Sertraline 50mg daily, Adderall XR 20mg"
            rows={3}
            style={{ background: '#fff', color: 'var(--text-primary)' }}
          />
        </div>

        <div>
          <label htmlFor="therapyExperience" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Previous Therapy Experience (optional)
          </label>
          <Textarea
            id="therapyExperience"
            {...register("therapyExperience")}
            placeholder="Tell us about your past therapy experiences, if any"
            rows={3}
            style={{ background: '#fff', color: 'var(--text-primary)' }}
          />
        </div>

        <div className="pt-4">
          <label className="block text-sm font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
            How comfortable are you discussing mental health?
            <span className="ml-1" style={{ color: 'var(--text-secondary)' }}>
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
                  {[1, 2, 3, 4, 5].map((value) => (
                    <label key={value} className="flex flex-col items-center gap-2">
                      <RadioGroupItem value={String(value)} />
                      <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{value}</span>
                    </label>
                  ))}
                </RadioGroup>
              )}
            />
            <div className="flex justify-between text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
              <span>Not comfortable</span>
              <span>Very comfortable</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            How often would you like to check in? *
          </label>
          <Controller
            name="checkInFrequency"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger style={{ background: '#fff', color: 'var(--text-primary)' }}>
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

// Step 3: Goals
function GoalsStep() {
  const { register, formState: { errors }, control } = useFormContext<FormData>();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Your Goals</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          What would you like to achieve through therapy?
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="goals" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Your Goals *
          </label>
          <Textarea
            id="goals"
            {...register("goals")}
            placeholder="e.g., I want to manage my anxiety, improve my relationships, and develop better coping strategies"
            rows={4}
            style={{ background: '#fff', color: 'var(--text-primary)' }}
          />
          {errors.goals && (
            <p className="text-sm text-red-500 mt-1">{errors.goals.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            How often would you like to check in? *
          </label>
          <Controller
            name="checkInFrequency"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger style={{ background: '#fff', color: 'var(--text-primary)' }}>
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
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

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
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    watch,
    setValue,
    trigger,
  } = methods;

  const comfortLevel = watch("comfortLevel");

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
        throw new Error("Failed to save onboarding data");
      }

      toast.success("Onboarding completed successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error during form submission:", error);
      toast.error("An error occurred during submission");
    }
  };

  const nextStep = async () => {
    const isValid = await trigger();
    if (isValid && step < totalSteps) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
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
      default:
        return null;
    }
  };

  if (!isLoaded || !userId) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--accent-color)' }}>
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 mx-auto mb-4" style={{ borderTopColor: 'var(--primary-color)' }}></div>
          <p style={{ color: 'var(--text-primary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--accent-color)' }}>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Welcome to Luma</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Let's set up your profile to personalize your experience
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-8 mb-12">
            <div
              className="h-2.5 rounded-full transition-all duration-300"
              style={{ 
                width: `${(step / totalSteps) * 100}%`,
                background: 'var(--primary-color)'
              }}
            />
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border" style={{ borderColor: '#e5e7eb' }}>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {renderStep()}
              <div className="flex justify-between pt-6" style={{ borderTop: '1px solid #e5e7eb' }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={step === 1}
                  style={{ 
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    borderColor: '#d1d5db'
                  }}
                >
                  Previous
                </Button>
                
                {step === totalSteps ? (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      background: 'var(--primary-color)',
                      color: '#000',
                      border: 'none'
                    }}
                  >
                    {isSubmitting ? 'Processing...' : 'Complete Setup'}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={nextStep}
                    style={{
                      background: 'var(--primary-color)',
                      color: '#000',
                      border: 'none'
                    }}
                  >
                    Continue
                  </Button>
                )}
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}
