"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconMail, IconArrowLeft } from "@tabler/icons-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await forgotPassword(email);

    if (result.success) {
      setIsSubmitted(true);
      toast.success(
        "If an account with that email exists, a password reset link has been sent."
      );
    } else {
      toast.error(
        result.error || "Failed to send reset email. Please try again."
      );
    }

    setIsLoading(false);
  };

  const handleResend = async () => {
    setIsLoading(true);
    const result = await forgotPassword(email);

    if (result.success) {
      toast.success("Reset email sent again!");
    } else {
      toast.error(result.error || "Failed to resend email. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 relative">
      {/* Theme Toggle in top-right corner */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md shadow-xl border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-lg flex items-center justify-center mb-4 p-2">
            <Image
              src="/logo.png"
              alt="Logo"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isSubmitted ? "Check Your Email" : "Forgot Password"}
          </CardTitle>
          <CardDescription>
            {isSubmitted
              ? "We&apos;ve sent a password reset link to your email address"
              : "Enter your email address and we&apos;ll send you a link to reset your password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                  <IconMail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                <IconMail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  We&apos;ve sent a password reset link to:
                </p>
                <p className="font-medium text-sm">{email}</p>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Didn&apos;t receive the email? Check your spam folder or try
                  again.
                </p>

                <div className="flex flex-col space-y-2">
                  <Button
                    variant="outline"
                    onClick={handleResend}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Sending..." : "Resend Email"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setIsSubmitted(false)}
                    className="w-full"
                  >
                    Use Different Email
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Back to Login Link */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              <IconArrowLeft className="h-4 w-4 mr-1" />
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
