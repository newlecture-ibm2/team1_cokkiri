"use client";

import Link from 'next/link';
import RegisterForm from './_components/register-form';
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

export default function RegisterPage() {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <motion.div variants={itemVariants} className="mb-14">
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-primary mb-4">
          Create Account<span className="text-accent">.</span>
        </h2>
        <p className="text-base text-primary/80 font-medium tracking-tight">
          Already a member?{' '}
          <Link href="/login" className="text-primary font-bold underline decoration-accent underline-offset-4 hover:text-accent transition-colors">
            Log in here
          </Link>
        </p>
      </motion.div>

      <RegisterForm />
    </motion.div>
  );
}
