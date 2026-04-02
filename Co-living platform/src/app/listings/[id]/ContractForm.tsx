"use client";

import { motion } from "framer-motion";
import { X, Calendar, User, Phone, Briefcase, Clock, FileText } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface ContractFormProps {
  listingId: string;
  listingTitle: string;
  onClose: () => void;
}

export function ContractForm({ listingId, listingTitle, onClose }: ContractFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    occupation: "",
    moveInDate: "",
    stayPeriod: "6"
  });

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(`contract_draft_${listingId}`);
    if (savedDraft) {
      try {
        const parsedData = JSON.parse(savedDraft);
        setFormData(parsedData);
        toast.info("이전에 작성하셨던 내용을 불러왔습니다.", {
          duration: 3000,
        });
      } catch (e) {
        console.error("Failed to load draft:", e);
      }
    }
  }, [listingId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      // Map element IDs to field names
      [id === "move-in" ? "moveInDate" : id === "stay-period" ? "stayPeriod" : id]: value
    }));
  };

  const handleSaveDraft = () => {
    localStorage.setItem(`contract_draft_${listingId}`, JSON.stringify(formData));
    toast.success("신청서가 임시 저장되었습니다.", {
      description: "나중에 다시 열면 자동으로 불러옵니다.",
    });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      // Remove draft after successful submission
      localStorage.removeItem(`contract_draft_${listingId}`);
      toast.success("계약 신청서가 성공적으로 제출되었습니다!", {
        description: "관리자가 검토 후 연락드릴 예정입니다.",
      });
      onClose();
    }, 1500);
  };

  const handleClose = () => {
    const savedDraft = localStorage.getItem(`contract_draft_${listingId}`);
    const isInitial = formData.name === "" && 
                     formData.phone === "" && 
                     formData.occupation === "" && 
                     formData.moveInDate === "";
    
    let isSaved = false;
    if (savedDraft) {
      try {
        const parsedSaved = JSON.parse(savedDraft);
        isSaved = JSON.stringify(formData) === JSON.stringify(parsedSaved);
      } catch (e) {
        console.error("Error parsing draft for comparison:", e);
      }
    }

    // If it's already saved or it's still in the initial state, just close
    if (isSaved || (isInitial && !savedDraft)) {
      onClose();
      return;
    }

    // Otherwise, ask for confirmation
    if (window.confirm("작성 중인 내용이 저장되지 않았습니다.\n정말 신청서 작성을 중단하시겠습니까?")) {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-8 md:p-12 max-h-[90vh] overflow-y-auto">
          <button 
            onClick={handleClose}
            className="absolute top-8 right-8 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>

          <header className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2C3424]/[0.05] text-[#2C3424] rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              <FileText className="w-3 h-3" />
              Contract Application
            </div>
            <h2 className="text-3xl font-black text-[#2C3424] tracking-tight">
              입주 신청서 작성
            </h2>
            <p className="text-gray-500 mt-2">
              <span className="font-bold text-[#2C3424]">{listingTitle}</span> 에 대한 입주 신청을 진행합니다.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Applicant Information */}
            <section className="space-y-6">
              <h3 className="text-sm font-black text-[#2C3424]/40 uppercase tracking-[0.2em]">신청자 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-bold text-gray-500 uppercase tracking-wider">성함</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      id="name" 
                      placeholder="홍길동" 
                      className="pl-10 h-12 bg-gray-50 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-[#2C3424]" 
                      required 
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-bold text-gray-500 uppercase tracking-wider">연락처</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      id="phone" 
                      placeholder="010-0000-0000" 
                      className="pl-10 h-12 bg-gray-50 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-[#2C3424]" 
                      required 
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="occupation" className="text-xs font-bold text-gray-500 uppercase tracking-wider">직업 / 소속</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      id="occupation" 
                      placeholder="프리랜서 디자이너" 
                      className="pl-10 h-12 bg-gray-50 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-[#2C3424]" 
                      value={formData.occupation}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </section>

            <Separator className="bg-gray-100" />

            {/* Stay Terms */}
            <section className="space-y-6">
              <h3 className="text-sm font-black text-[#2C3424]/40 uppercase tracking-[0.2em]">입주 기간 설정</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="move-in" className="text-xs font-bold text-gray-500 uppercase tracking-wider">입주 희망일</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      id="move-in" 
                      type="date" 
                      className="pl-10 h-12 bg-gray-50 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-[#2C3424]" 
                      required 
                      value={formData.moveInDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stay-period" className="text-xs font-bold text-gray-500 uppercase tracking-wider">계약 기간</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select 
                      id="stay-period" 
                      className="w-full pl-10 h-12 bg-gray-50 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-[#2C3424] appearance-none text-sm font-medium pr-4"
                      value={formData.stayPeriod}
                      onChange={handleChange}
                    >
                      <option value="6">6개월</option>
                      <option value="12">12개월</option>
                      <option value="24">24개월</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            <div className="pt-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  className="flex-1 h-14 rounded-2xl border-2 border-[#2C3424]/10 text-[#2C3424] font-black text-lg hover:bg-gray-50 transition-all font-bold"
                >
                  임시 저장
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-[2] h-14 rounded-2xl bg-[#2C3424] text-white font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "제출 중..." : "계약 신청 완료하기"}
                </Button>
              </div>
              <p className="text-center text-gray-400 text-xs mt-4">
                신청 완료 후 영업일 기준 48시간 이내에 담당 컨시어지가 연락드립니다.
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
