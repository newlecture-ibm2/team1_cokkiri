"use client";

import { motion } from "framer-motion";
import { Compass, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface StatusLayoutProps {
  status: string | number;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon: React.ElementType;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon: React.ElementType;
  };
  isError?: boolean;
}

export function StatusLayout({
  status,
  title,
  description,
  primaryAction,
  secondaryAction,
  isError = false
}: StatusLayoutProps) {
  const router = useRouter();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-background px-6 text-foreground overflow-hidden">
      {/* Premium Grid Background */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: "radial-gradient(#2C3424 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      
      <div className="relative z-10 flex flex-col items-center max-w-2xl w-full text-center">
        {/* Decorative Background Icon */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
          className="absolute -top-24 pointer-events-none"
        >
          {isError ? (
            <AlertTriangle size={300} strokeWidth={0.5} className="text-destructive" />
          ) : (
            <Compass size={300} strokeWidth={0.5} className="text-primary" />
          )}
        </motion.div>

        {/* Status Text with Animation */}
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className={`text-9xl font-bold tracking-tighter sm:text-[12rem] ${isError ? 'text-destructive/20' : 'text-primary/20'}`}
        >
          {status}
        </motion.h1>

        {/* Main Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative z-10 -mt-10 sm:-mt-16"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl text-balance">
            {title}
          </h2>
          <p className="mt-6 text-lg text-secondary leading-relaxed max-w-md mx-auto whitespace-pre-line">
            {description}
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          {secondaryAction && (
            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-primary/20 px-8 hover:bg-surface transition-all duration-300 gap-2 h-12"
              onClick={secondaryAction.onClick}
            >
              <secondaryAction.icon className="w-4 h-4" />
              {secondaryAction.label}
            </Button>
          )}
          
          {primaryAction && (
            <Button
              size="lg"
              className={`rounded-full px-8 hover:opacity-90 transition-all duration-300 shadow-xl gap-2 h-12 ${
                isError ? 'bg-destructive text-destructive-foreground shadow-destructive/10' : 'bg-primary text-primary-foreground shadow-primary/10'
              }`}
              onClick={primaryAction.onClick}
            >
              <primaryAction.icon className="w-4 h-4" />
              {primaryAction.label}
            </Button>
          )}
        </motion.div>
      </div>
    </main>
  );
}
