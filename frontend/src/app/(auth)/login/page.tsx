"use client";

import Link from 'next/link';
import LoginForm from './_components/LoginForm';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
};

export default function LoginPage() {
  return (
    <div className="py-24 md:py-32 px-6 md:px-12 lg:px-24 max-w-[1400px] mx-auto min-h-screen flex flex-col justify-center">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full mx-auto"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-primary mb-4">
            Log In<span className="text-accent">.</span>
          </h1>
          <p className="text-base text-primary/80 font-medium tracking-tight">
            Welcome back to COKKIRI.
          </p>
        </motion.div>
        
        <LoginForm />
        
        <motion.div variants={itemVariants} className="mt-12 pt-6 border-t border-secondary/30 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80 mb-4">Not a member yet?</p>
          <Link 
            href="/register" 
            className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-primary text-primary font-black tracking-[0.1em] uppercase hover:bg-primary/5 transition-colors"
          >
            Create Account
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}