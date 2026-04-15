"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { Profile } from "../../_types/profile";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

interface NationalityItem {
  code: string;
  nameKo: string;
  nameEn: string;
  nameNative: string;
}

const validateName = (val: string) => val.length >= 2 && val.length <= 50;
const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
const validatePhone = (val: string) => /^(02-\d{3,4}-\d{4}|0\d{2}-\d{3,4}-\d{4})$/.test(val);

export function ProfileEditForm() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [nationality, setNationality] = useState("");
  const [nationalityList, setNationalityList] = useState<NationalityItem[]>([]);
  const [isNationalityOpen, setIsNationalityOpen] = useState(false);

  // Verification states for Email
  const [emailCode, setEmailCode] = useState("");
  const [isEmailVerificationSent, setIsEmailVerificationSent] = useState(false);
  const [emailVerificationToken, setEmailVerificationToken] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);


  // UI state for custom dropdowns
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isDateWidgetOpen, setIsDateWidgetOpen] = useState(false);
  const [dateWidgetStep, setDateWidgetStep] = useState<'YEAR' | 'MONTH' | 'DAY'>('YEAR');
  const [tempDate, setTempDate] = useState({ year: 2000, month: 1, day: 1 });

  const genderRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const nationalityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchProfile() {
      try {
        const data = await apiFetch<Profile>("/users/me");
        if (isMounted && data.data) {
          setProfile(data.data);
          setName(data.data.name || "");
          setEmail(data.data.email || "");
          setPhone(data.data.phone || "");
          if (data.data.birthDate) {
            // Reconstruct YYYY-MM-DD from YYMMDD
            const yy = data.data.birthDate.slice(0, 2);
            const mm = data.data.birthDate.slice(2, 4);
            const dd = data.data.birthDate.slice(4, 6);
            const yearStr = parseInt(yy) > 50 ? `19${yy}` : `20${yy}`;
            setBirthDate(`${yearStr}-${mm}-${dd}`);
          }
          setGender(data.data.gender || "");
          setNationality(data.data.nationality || "");
        }
      } catch (err) {
        if (isMounted) setGlobalError(err instanceof ApiError ? err.message : "프로필을 불러오는데 실패했습니다.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchProfile();

    async function fetchNationalities() {
      try {
        const res = await apiFetch<NationalityItem[]>("/nationalities");
        if (isMounted && res.data) {
          const sortedList = [...res.data].sort((a, b) => a.nameEn.localeCompare(b.nameEn));
          setNationalityList(sortedList);
        }
      } catch (err) {
        console.error("Failed to fetch nationalities", err);
      }
    }
    fetchNationalities();

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (genderRef.current && !genderRef.current.contains(e.target as Node)) {
        setIsGenderOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setIsDateWidgetOpen(false);
      }
      if (nationalityRef.current && !nationalityRef.current.contains(e.target as Node)) {
        setIsNationalityOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (globalError) {
      timeoutId = setTimeout(() => {
        setGlobalError(null);
      }, 5000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [globalError]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.startsWith('02')) {
      if (value.length > 10) value = value.slice(0, 10);
      if (value.length > 2 && value.length <= 5) {
        value = value.replace(/(\d{2})(\d{1,3})/, '$1-$2');
      } else if (value.length > 5 && value.length < 10) {
        value = value.replace(/(\d{2})(\d{3})(\d{1,4})/, '$1-$2-$3');
      } else if (value.length === 10) {
        value = value.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
      }
    } else {
      if (value.length > 11) value = value.slice(0, 11);
      if (value.length > 3 && value.length <= 6) {
        value = value.replace(/(\d{3})(\d{1,3})/, '$1-$2');
      } else if (value.length > 6 && value.length < 11) {
        value = value.replace(/(\d{3})(\d{3})(\d{1,4})/, '$1-$2-$3');
      } else if (value.length === 11) {
        value = value.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
      }
    }
    setPhone(value);
    if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setFieldErrors({});

    let hasError = false;
    const newErrors: Record<string, string> = {};

    if (!validateName(name)) {
      newErrors.name = "이름은 2~50자로 입력해주세요.";
      hasError = true;
    }
    if (!validateEmail(email)) {
      newErrors.email = "유효한 이메일 주소를 입력해주세요.";
      hasError = true;
    }
    if (!validatePhone(phone)) {
      newErrors.phone = "올바른 연락처 형식이 아닙니다.";
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(newErrors);
      setGlobalError("입력 정보를 다시 확인해주세요.");
      return;
    }

    let finalBirthDate = birthDate;
    if (finalBirthDate && finalBirthDate.includes('-')) {
      const parts = finalBirthDate.split('-');
      if (parts.length === 3) {
        finalBirthDate = parts[0].slice(2) + parts[1] + parts[2];
      }
    } else if (finalBirthDate && !/^\d{6}$/.test(finalBirthDate)) {
        setFieldErrors(prev => ({ ...prev, birthDate: "올바른 생년월일 형식(YYMMDD)이 아닙니다." }));
        return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch("/users/me", {
        method: "PUT",
        body: JSON.stringify({
          name,
          phone,
          email,
          birthDate: finalBirthDate,
          ...(gender && { gender }),
          ...(nationality && { nationality }),
        }),
      });
      router.push("/profile");
    } catch (err) {
      if (err instanceof ApiError && err.errorCode === 'VALIDATION_ERROR' && err.data && typeof err.data === 'object' && Object.keys(err.data).length > 0) {
        setFieldErrors(err.data as Record<string, string>);
        setGlobalError("입력 정보를 다시 확인해주세요.");
      } else {
        setGlobalError(err instanceof ApiError ? err.message : "프로필 수정에 실패했습니다.");
      }
      setIsSubmitting(false);
    }
  };

  const getInputClasses = (hasError: boolean) =>
    `w-full border-b bg-transparent px-0 py-3 text-lg font-medium text-primary outline-none transition-colors placeholder:text-primary/50 disabled:opacity-50 ${hasError ? 'border-red-500 focus:border-red-500' : 'border-primary/20 focus:border-accent'}`;
  const labelClasses = "block text-[10px] font-black uppercase tracking-[0.3em] text-primary/80 mb-1";
  
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20 text-red-800">
        프로필 데이터를 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <>
      <button 
        onClick={() => router.back()}
        className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-accent transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Profile
      </button>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6"
        noValidate
      >
        <AnimatePresence>
          {globalError && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 50, x: "-50%" }}
              className="fixed bottom-12 left-1/2 z-[100] shadow-2xl w-[90%] max-w-sm rounded-[1rem] overflow-hidden bg-red-950/90 backdrop-blur-xl border border-red-500/30"
            >
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 5, ease: "linear" }}
                className="h-[3px] bg-red-500/80"
              />
              <div className="flex items-center justify-center gap-3 px-6 py-4 text-sm font-medium tracking-tight text-red-100">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
                <p>{globalError}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={itemVariants} className="space-y-6">
          <div className="relative">
            <label className={labelClasses}>LOGIN ID</label>
            <input 
              value={profile.loginId} 
              disabled 
              className={getInputClasses(false)} 
            />
          </div>
          
          <div className="relative">
            <label className={labelClasses}>ROLE</label>
            <input 
              value={profile.role} 
              disabled 
              className={getInputClasses(false)} 
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className={`space-y-6 pt-6 border-t border-primary/10 relative ${isNationalityOpen ? 'z-50' : 'z-30'}`}>
          <div className="relative">
            <label className={labelClasses}>FULL NAME *</label>
            <input 
              name="name" 
              value={name} 
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: '' }));
              }} 
              className={getInputClasses(!!fieldErrors.name)} 
              placeholder="이름을 입력하세요" 
            />
            {fieldErrors.name && <p className="absolute top-full left-0 mt-1.5 text-red-500 text-xs font-medium leading-tight">{fieldErrors.name}</p>}
          </div>

          <div className="relative">
            <label className={labelClasses}>EMAIL ADDRESS *</label>
            <div className="flex gap-2 items-end">
              <input 
                name="email" 
                type="email" 
                value={email} 
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
                }} 
                className={getInputClasses(!!fieldErrors.email)} 
                placeholder="cokkiri@example.com" 
              />
            </div>
            {fieldErrors.email && <p className="absolute top-full left-0 mt-1.5 text-red-500 text-xs font-medium leading-tight">{fieldErrors.email}</p>}
          </div>

          <div className="relative mt-4">
            <label className={labelClasses}>PHONE NUMBER *</label>
            <input 
              name="phone" 
              value={phone} 
              onChange={handlePhoneChange}
              className={getInputClasses(!!fieldErrors.phone)} 
              placeholder="010-0000-0000" 
            />
            {fieldErrors.phone && <p className="absolute top-full left-0 mt-1.5 text-red-500 text-xs font-medium leading-tight">{fieldErrors.phone}</p>}
          </div>

          <div className={`relative mt-4 ${isNationalityOpen ? 'z-50' : 'z-30'}`} ref={nationalityRef}>
            <label className={labelClasses}>NATIONALITY</label>
            <div
              onClick={() => {
                setIsNationalityOpen(!isNationalityOpen);
                setIsGenderOpen(false);
                setIsDateWidgetOpen(false);
              }}
              className={`${getInputClasses(!!fieldErrors.nationality)} cursor-pointer flex justify-between items-center`}
            >
              <span className={nationality ? '' : 'text-primary/50'}>
                {nationality ? nationalityList.find(n => n.code === nationality)?.nameNative || nationality : '국적을 선택해주세요'}
              </span>
              <motion.span animate={{ rotate: isNationalityOpen ? 180 : 0 }} className="text-[10px] text-primary/50">▼</motion.span>
            </div>

            <AnimatePresence>
              {isNationalityOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-3 bg-[#e8ebe6] border border-primary/10 rounded-lg shadow-xl overflow-y-auto max-h-60 z-50 origin-top [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-primary/20 [&::-webkit-scrollbar-thumb]:rounded-full"
                >
                  {nationalityList.map((item) => (
                    <div
                      key={item.code}
                      onClick={() => {
                        setNationality(item.code);
                        setIsNationalityOpen(false);
                        if (fieldErrors.nationality) setFieldErrors(prev => ({ ...prev, nationality: '' }));
                      }}
                      className="px-5 py-3 cursor-pointer hover:bg-primary/5 transition-colors flex items-center justify-between group relative"
                    >
                      {nationality === item.code && <motion.div layoutId="nationality-active" className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />}
                      <span className={`font-black tracking-tight group-hover:tracking-widest transition-all duration-300 ${nationality === item.code ? 'text-accent' : 'text-primary'}`}>
                        {item.nameEn.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-primary/60 font-bold uppercase tracking-[0.2em]">{item.nameNative}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            {fieldErrors.nationality && <p className="absolute top-full left-0 mt-1.5 text-red-500 text-xs font-medium leading-tight">{fieldErrors.nationality}</p>}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className={`space-y-4 pt-4 relative ${isGenderOpen || isDateWidgetOpen ? 'z-50' : 'z-20'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`col-span-1 relative flex flex-col justify-end ${isGenderOpen ? 'z-50' : 'z-20'}`} ref={genderRef}>
              <label className={labelClasses}>M/F</label>
              <div
                onClick={() => {
                  setIsGenderOpen(!isGenderOpen);
                  setIsDateWidgetOpen(false);
                  setIsNationalityOpen(false);
                }}
                className={`${getInputClasses(false)} cursor-pointer flex justify-between items-center`}
              >
                <span>{gender === 'MALE' ? 'MALE (남성)' : (gender === 'FEMALE' ? 'FEMALE (여성)' : '선택해주세요')}</span>
                <motion.span animate={{ rotate: isGenderOpen ? 180 : 0 }} className="text-[10px] text-primary/50">▼</motion.span>
              </div>

              <AnimatePresence>
                {isGenderOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-full left-0 right-0 mb-3 bg-[#e8ebe6] border border-primary/10 rounded-lg shadow-xl overflow-hidden z-50 origin-bottom"
                  >
                    <div
                      onClick={() => { setGender('MALE'); setIsGenderOpen(false); }}
                      className="px-5 py-4 cursor-pointer hover:bg-primary/5 transition-colors flex items-center justify-between border-b border-primary/5 group relative"
                    >
                      {gender === 'MALE' && <motion.div layoutId="gender-active" className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />}
                      <span className="font-black tracking-tight text-primary group-hover:tracking-widest transition-all duration-300">MALE</span>
                      <span className="text-[10px] text-primary/60 font-bold uppercase tracking-[0.2em]">남성</span>
                    </div>
                    <div
                      onClick={() => { setGender('FEMALE'); setIsGenderOpen(false); }}
                      className="px-5 py-4 cursor-pointer hover:bg-primary/5 transition-colors flex items-center justify-between group relative"
                    >
                      {gender === 'FEMALE' && <motion.div layoutId="gender-active" className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />}
                      <span className="font-black tracking-tight text-primary group-hover:tracking-widest transition-all duration-300">FEMALE</span>
                      <span className="text-[10px] text-primary/60 font-bold uppercase tracking-[0.2em]">여성</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className={`col-span-1 flex flex-col justify-end relative ${isDateWidgetOpen ? 'z-50' : 'z-10'}`} ref={dateRef}>
              <label className={labelClasses}>BIRTH DATE</label>
              <div
                onClick={() => {
                  setIsDateWidgetOpen(!isDateWidgetOpen);
                  setDateWidgetStep('YEAR');
                  setIsGenderOpen(false);
                  setIsNationalityOpen(false);
                }}
                className={`${getInputClasses(!!fieldErrors.birthDate)} cursor-pointer flex items-center justify-between`}
              >
                <span className={birthDate ? 'text-primary' : 'text-primary/50'}>
                  {birthDate ? birthDate : 'YYYY-MM-DD'}
                </span>
              </div>

              <AnimatePresence>
                {isDateWidgetOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-full left-0 md:-left-20 w-[290px] mb-3 p-5 bg-[#e8ebe6] border border-primary/10 rounded-lg shadow-xl z-50 origin-bottom"
                  >
                    <div className="flex justify-between border-b border-primary/10 pb-3 mb-4 text-xs tracking-widest font-bold text-primary/50 uppercase">
                      <button type="button" onClick={() => setDateWidgetStep('YEAR')} className={`hover:text-primary transition-colors ${dateWidgetStep === 'YEAR' ? 'text-primary border-b-2 border-accent pb-1 -mb-3' : ''}`}>{tempDate.year || 'YYYY'}</button>
                      <span className="font-thin">/</span>
                      <button type="button" onClick={() => setDateWidgetStep('MONTH')} className={`hover:text-primary transition-colors ${dateWidgetStep === 'MONTH' ? 'text-primary border-b-2 border-accent pb-1 -mb-3' : ''}`}>{tempDate.month ? String(tempDate.month).padStart(2, '0') : 'MM'}</button>
                      <span className="font-thin">/</span>
                      <button type="button" onClick={() => setDateWidgetStep('DAY')} className={`hover:text-primary transition-colors ${dateWidgetStep === 'DAY' ? 'text-primary border-b-2 border-accent pb-1 -mb-3' : ''}`}>{tempDate.day ? String(tempDate.day).padStart(2, '0') : 'DD'}</button>
                    </div>

                    <div className="h-48 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-primary/20 [&::-webkit-scrollbar-thumb]:rounded-full pr-2">
                      {dateWidgetStep === 'YEAR' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-4 gap-2">
                          {Array.from({ length: 70 }, (_, i) => new Date().getFullYear() - 69 + i).reverse().map(y => (
                            <div key={y} onClick={() => { setTempDate(p => ({ ...p, year: y })); setDateWidgetStep('MONTH'); }} className={`text-center py-2 cursor-pointer rounded-lg text-sm transition-colors ${tempDate.year === y ? 'bg-primary text-background font-bold' : 'hover:bg-primary/5 text-primary'}`}>{y}</div>
                          ))}
                        </motion.div>
                      )}
                      {dateWidgetStep === 'MONTH' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-4 gap-2">
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <div key={m} onClick={() => { setTempDate(p => ({ ...p, month: m })); setDateWidgetStep('DAY'); }} className={`text-center py-2 cursor-pointer rounded-lg text-sm transition-colors ${tempDate.month === m ? 'bg-primary text-background font-bold' : 'hover:bg-primary/5 text-primary'}`}>{m}</div>
                          ))}
                        </motion.div>
                      )}
                      {dateWidgetStep === 'DAY' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-5 gap-2">
                          {Array.from({ length: new Date(tempDate.year, tempDate.month, 0).getDate() }, (_, i) => i + 1).map(d => (
                            <div key={d} onClick={() => {
                              setTempDate(p => ({ ...p, day: d }));
                              const finalDate = `${tempDate.year}-${String(tempDate.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                              setBirthDate(finalDate);
                              setIsDateWidgetOpen(false);
                            }}
                              className={`text-center py-2 cursor-pointer rounded-lg text-sm transition-colors ${tempDate.day === d ? 'bg-primary text-background font-bold' : 'hover:bg-primary/5 text-primary'}`}
                            >
                              {d}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {fieldErrors.birthDate && <p className="absolute top-full left-0 mt-1.5 text-red-500 text-xs font-medium leading-tight">{fieldErrors.birthDate}</p>}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="pt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-background h-14 rounded-xl text-xs font-black tracking-[0.2em] uppercase transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {isSubmitting ? "SAVING..." : "SAVE CHANGES"}
          </button>
        </motion.div>
      </form>
    </>
  );
}
