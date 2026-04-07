"use client";

import { useState } from "react";
import { LoginRequiredModal } from "@/components/shared/LoginRequiredModal";

export function LoginRequiredGate() {
  const [open, setOpen] = useState(true);
  return <LoginRequiredModal isOpen={open} onClose={() => setOpen(false)} />;
}
