import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, User, Phone, Briefcase, Clock, FileText, CheckCircle2, AlertCircle, Save, Loader2, Send } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";

interface ContractFormProps {
  listingId: string;
  listingTitle: string;
  onClose: () => void;
}

export function ContractForm({ listingId, listingTitle, onClose }: ContractFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    occupation: "",
    moveInDate: "",
    stayPeriod: "6",
    usagePurpose: "",
    privacyAgreed: false,
    termsAgreed: false
  });

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(`contract_draft_${listingId}`);
    if (savedDraft) {
      try {
        const parsedData = JSON.parse(savedDraft);
        setFormData(prev => ({ ...prev, ...parsedData }));
        toast.info("이전에 작성하셨던 내용을 불러왔습니다.", {
          duration: 3000,
          id: "load-draft-toast"
        });
      } catch (e) {
        console.error("Failed to load draft:", e);
      }
    }
  }, [listingId]);

  // Throttled Draft Save API Call
  const saveDraftToApi = useCallback(async (data: typeof formData) => {
    setIsSaving(true);
    try {
      // Backend Draft API
      await fetch('/api/v1/contracts/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          spaceId: Number(listingId),
          desiredStartDate: data.moveInDate,
          desiredDurationMonths: Number(data.stayPeriod)
        })
      });

      localStorage.setItem(`contract_draft_${listingId}`, JSON.stringify(data));
      setLastSaved(new Date());
    } catch (err) {
      console.error("Draft save failed", err);
    } finally {
      setIsSaving(false);
    }
  }, [listingId]);

  // Throttling logic
  useEffect(() => {
    const isInitial = formData.name === "" && formData.phone === "" && formData.moveInDate === "";
    if (isInitial) return;

    const handler = setTimeout(() => {
      saveDraftToApi(formData);
    }, 2000);

    return () => clearTimeout(handler);
  }, [formData, saveDraftToApi]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData(prev => ({
      ...prev,
      [id === "move-in" ? "moveInDate" : id === "stay-period" ? "stayPeriod" : id === "usage-purpose" ? "usagePurpose" : id === "privacy-agreed" ? "privacyAgreed" : id === "terms-agreed" ? "termsAgreed" : id]: val
    }));
  };

  const handleSaveDraft = () => {
    saveDraftToApi(formData);
    toast.success("신청서가 임시 저장되었습니다.");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 필드 개별 체크 및 알림
    if (!formData.name.trim()) {
      toast.error("신청자 성함을 입력해주세요.");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("연락처를 입력해주세요.");
      return;
    }
    if (!formData.moveInDate) {
      toast.error("입주 희망일을 선택해주세요.");
      return;
    }
    if (!formData.usagePurpose.trim()) {
      toast.error("사용 목적을 입력해주세요.");
      return;
    }
    if (!formData.privacyAgreed) {
      toast.error("개인정보 수집 및 심사 이용에 동의해주세요.");
      return;
    }
    if (!formData.termsAgreed) {
      toast.error("코리빙 입주 주의사항을 확인하고 체크해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/v1/contracts/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          spaceId: Number(listingId),
          desiredStartDate: formData.moveInDate,
          desiredDurationMonths: Number(formData.stayPeriod)
        })
      });

      if (!response.ok) throw new Error("Submission failed");

      localStorage.removeItem(`contract_draft_${listingId}`);
      toast.success("계약 신청서가 성공적으로 제출되었습니다!", {
        description: "PENDING 상태로 등록되었습니다.",
      });
      onClose();
    } catch (err) {
      toast.error("신청 도중 오류가 발생했습니다. 입력한 정보를 다시 확인해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
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

    if (isSaved || (isInitial && !savedDraft)) {
      onClose();
      return;
    }

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
        className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Autosave Status Badge */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100 pointer-events-none z-10">
          {isSaving ? (
            <span className="flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest text-indigo-500">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving Draft
            </span>
          ) : lastSaved ? (
            <span className="flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest text-green-500">
              <CheckCircle2 className="w-3 h-3 text-green-500" /> Saved at {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest text-gray-400">
              <Clock className="w-3 h-3" /> Auto-Saving Enabled
            </span>
          )}
        </div>

        <div className="relative p-10 md:p-14 max-h-[90vh] overflow-y-auto">
          <button
            onClick={handleClose}
            className="absolute top-10 right-10 p-2.5 rounded-full hover:bg-gray-100 transition-colors group"
          >
            <X className="w-6 h-6 text-gray-400 group-hover:text-rose-500 transition-colors" />
          </button>

          <header className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2C3424]/[0.05] text-[#2C3424] rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              <FileText className="w-3.5 h-3.5" />
              Contract Application
            </div>
            <h2 className="text-4xl font-black text-[#2C3424] tracking-tight leading-tight">
              입주 신청서 작성
            </h2>
            <p className="text-gray-500 mt-3 text-lg leading-relaxed">
              <span className="font-bold text-[#2C3424] underline decoration-indigo-500/30 underline-offset-4">{listingTitle}</span> 에 대한 입주 신청을 진행합니다.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Applicant Information */}
            <section className="space-y-8">
              <h3 className="text-xs font-bold text-[#2C3424]/30 uppercase tracking-[0.3em] flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#2C3424]/20 rounded-full" /> 신청자 정보
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <Label htmlFor="name" className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">성함</Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#2C3424] transition-colors" />
                    <Input
                      id="name"
                      placeholder="홍길동"
                      className="pl-12 h-14 bg-gray-50/50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-[#2C3424] transition-all"
                      required
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="phone" className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">연락처</Label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#2C3424] transition-colors" />
                    <Input
                      id="phone"
                      placeholder="010-0000-0000"
                      className="pl-12 h-14 bg-gray-50/50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-[#2C3424] transition-all"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2.5 md:col-span-2">
                  <Label htmlFor="occupation" className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">직업 / 소속</Label>
                  <div className="relative group">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#2C3424] transition-colors" />
                    <Input
                      id="occupation"
                      placeholder="프리랜서 디자이너"
                      className="pl-12 h-14 bg-gray-50/50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-[#2C3424] transition-all"
                      value={formData.occupation}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </section>

            <Separator className="bg-gray-100/80" />

            {/* Stay Terms */}
            <section className="space-y-8">
              <h3 className="text-xs font-bold text-[#2C3424]/30 uppercase tracking-[0.3em] flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#2C3424]/20 rounded-full" /> 입주 조건 및 기간
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <Label htmlFor="move-in" className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">입주 희망일</Label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#2C3424] transition-colors" />
                    <Input
                      id="move-in"
                      type="date"
                      className="pl-12 h-14 bg-gray-50/50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-[#2C3424] transition-all"
                      required
                      value={formData.moveInDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="stay-period" className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">계약 기간</Label>
                  <div className="relative group">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#2C3424] transition-colors" />
                    <select
                      id="stay-period"
                      className="w-full pl-12 h-14 bg-gray-50/50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-[#2C3424] appearance-none text-sm font-bold pr-4 transition-all"
                      value={formData.stayPeriod}
                      onChange={handleChange}
                    >
                      <option value="6">6개월</option>
                      <option value="12">12개월</option>
                      <option value="24">24개월</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2.5 md:col-span-2">
                  <Label htmlFor="usage-purpose" className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">사용 목적</Label>
                  <Input
                    id="usage-purpose"
                    placeholder="예: 학업, 직장 출퇴근용, 한달 살기 등"
                    className="h-14 bg-gray-50/50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-[#2C3424] px-5 transition-all text-sm font-medium"
                    required
                    value={formData.usagePurpose}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </section>

            {/* Agreements */}
            <section className="space-y-6 pt-6 bg-slate-50/50 p-8 rounded-[32px] border border-slate-100">
              <h3 className="text-xs font-bold text-[#2C3424]/30 uppercase tracking-[0.22em] flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4" /> 주의사항 및 동의
              </h3>
              <div className="space-y-4">
                <label className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white cursor-pointer transition-all border border-transparent hover:border-slate-100 group">
                  <input
                    type="checkbox"
                    id="privacy-agreed"
                    checked={formData.privacyAgreed}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 rounded-lg text-[#2C3424] focus:ring-[#2C3424]"
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-black text-[#2C3424]">개인정보 수집 및 심사 이용 동의 <span className="text-rose-500">(필수)</span></p>
                    <p className="text-[11px] text-gray-400">원활한 계약 및 승인을 위해 개인정보를 수집합니다.</p>
                  </div>
                </label>
                <label className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white cursor-pointer transition-all border border-transparent hover:border-slate-100 group">
                  <input
                    type="checkbox"
                    id="terms-agreed"
                    checked={formData.termsAgreed}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 rounded-lg text-[#2C3424] focus:ring-[#2C3424]"
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-black text-[#2C3424]">코리빙 입주 주의사항 확인 <span className="text-rose-500">(필수)</span></p>
                    <p className="text-[11px] text-gray-400">공동 생활 규정 및 주의사항을 모두 확인하였습니다.</p>
                  </div>
                </label>
              </div>
            </section>

            <div className="pt-8 space-y-6">
              <div className="flex flex-col sm:flex-row gap-5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  className="flex-1 h-16 rounded-[22px] border-2 border-[#2C3424]/10 text-[#2C3424] font-black text-lg hover:bg-gray-50 transition-all"
                >
                  <Save className="w-5 h-5 mr-2" /> 임시 저장
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] h-16 rounded-[22px] bg-[#2C3424] text-white font-black text-xl hover:scale-[1.03] active:scale-[0.98] transition-all disabled:bg-gray-400 shadow-xl shadow-[#2C3424]/20"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> 제출 중...</span>
                  ) : (
                    <span className="flex items-center gap-2">신청 완료하기 <Send className="w-5 h-5" /></span>
                  )}
                </Button>
              </div>
              <p className="text-center text-gray-400 text-xs font-medium italic">
                “Your journey to a better living starts here”
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
