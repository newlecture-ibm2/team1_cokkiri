'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
    passwordConfirm: '',
    name: '',
    birthDate: '',
    gender: 'MALE',
    nationality: '',
    phone: '',
    email: '',
  });
  
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isDateWidgetOpen, setIsDateWidgetOpen] = useState(false);
  const [dateWidgetStep, setDateWidgetStep] = useState<'YEAR' | 'MONTH' | 'DAY'>('YEAR');
  const [tempDate, setTempDate] = useState({ year: 2000, month: 1, day: 1 });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;
    
    // Phone auto-format (supports 02- and other region/mobile codes)
    if (name === 'phone') {
      value = value.replace(/[^0-9]/g, '');
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
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for the field being edited
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (globalError) setGlobalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};

    let finalBirthDate = formData.birthDate;
    if (finalBirthDate.includes('-')) {
      const parts = finalBirthDate.split('-');
      if (parts.length === 3) {
        finalBirthDate = parts[0].slice(2) + parts[1] + parts[2];
      }
    }

    if (!formData.loginId) errors.loginId = "아이디를 입력해주세요.";
    else if (formData.loginId.length < 4 || formData.loginId.length > 50 || !/^[a-zA-Z0-9]+$/.test(formData.loginId)) {
      errors.loginId = "아이디는 4~50자의 영문자와 숫자로만 구성되어야 합니다.";
    }

    if (!formData.password) errors.password = "비밀번호를 입력해주세요.";
    else if (formData.password.length < 8 || !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]+$/.test(formData.password)) {
      errors.password = "비밀번호는 영문자, 숫자, 특수문자를 포함해 8자 이상이어야 합니다.";
    }

    if (!formData.passwordConfirm) errors.passwordConfirm = "비밀번호 확인을 입력해주세요.";
    else if (formData.password !== formData.passwordConfirm) {
      errors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    }

    if (!formData.name) errors.name = "이름을 입력해주세요.";
    else if (formData.name.length < 2 || formData.name.length > 50) {
      errors.name = "이름은 2~50자로 입력해주세요.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) errors.email = "이메일을 입력해주세요.";
    else if (!emailRegex.test(formData.email)) {
      errors.email = "올바른 이메일 형식이 아닙니다.";
    }

    if (finalBirthDate && !/^\d{6}$/.test(finalBirthDate)) {
      errors.birthDate = "생년월일은 올바른 날짜로 입력해주세요.";
    }

    if (formData.phone && !/^(02-\d{3,4}-\d{4}|0\d{2}-\d{3,4}-\d{4})$/.test(formData.phone)) {
      errors.phone = "올바른 연락처 형식이 아닙니다.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setGlobalError("입력 정보를 다시 확인해주세요.");
      return;
    }

    try {
      setLoading(true);
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          birthDate: finalBirthDate
        }),
      });
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err) {
      if (err instanceof ApiError) {
        setGlobalError(err.message);
      } else {
        setGlobalError('알 수 없는 오류가 발생했습니다.');
      }
      setLoading(false);
    }
  };

  const getInputClasses = (hasError: boolean) => 
    `w-full border-b bg-transparent px-0 py-3 text-lg font-medium text-primary outline-none transition-colors placeholder:text-primary/30 ${hasError ? 'border-red-500 focus:border-red-500' : 'border-primary/20 focus:border-accent'}`;
  const labelClasses = "block text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mb-1";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="rounded-full bg-accent/10 p-6 mb-6">
          <CheckCircle2 className="h-16 w-16 text-accent" />
        </div>
        <h3 className="text-3xl font-black uppercase tracking-tight text-primary mb-2">Welcome Aboard</h3>
        <p className="text-primary/60 font-medium">회원가입이 성공적으로 완료되었습니다.<br/>잠시 후 로그인 페이지로 이동합니다.</p>
      </motion.div>
    );
  }

  return (
    <motion.form 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onSubmit={handleSubmit} 
      className="flex flex-col gap-10"
    >
      <AnimatePresence>
        {globalError && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 rounded-2xl bg-red-500/10 p-4 text-sm font-medium text-red-600 mb-6">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{globalError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants} className="space-y-10">
        <div>
          <label className={labelClasses}>LOGIN ID *</label>
          <input name="loginId" value={formData.loginId} onChange={handleChange} className={getInputClasses(!!fieldErrors.loginId)} placeholder="아이디를 입력하세요 (4자 이상)" />
          {fieldErrors.loginId && <p className="text-red-500 text-xs mt-2 font-medium">{fieldErrors.loginId}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <label className={labelClasses}>PASSWORD *</label>
            <input name="password" type="password" value={formData.password} onChange={handleChange} className={getInputClasses(!!fieldErrors.password)} placeholder="비밀번호" />
            <p className="text-primary/40 text-xs mt-2 font-medium tracking-tight">8자 이상, 영문+숫자+특수문자 조합</p>
            {fieldErrors.password && <p className="text-red-500 text-xs mt-2 font-medium">{fieldErrors.password}</p>}
          </div>
          <div>
            <label className={labelClasses}>CONFIRM PASSWORD *</label>
            <input name="passwordConfirm" type="password" value={formData.passwordConfirm} onChange={handleChange} className={getInputClasses(!!fieldErrors.passwordConfirm)} placeholder="비밀번호 재입력" />
            {fieldErrors.passwordConfirm && <p className="text-red-500 text-xs mt-2 font-medium">{fieldErrors.passwordConfirm}</p>}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <label className={labelClasses}>FULL NAME *</label>
            <input name="name" value={formData.name} onChange={handleChange} className={getInputClasses(!!fieldErrors.name)} placeholder="이름을 입력하세요" />
            {fieldErrors.name && <p className="text-red-500 text-xs mt-2 font-medium">{fieldErrors.name}</p>}
          </div>
          <div>
            <label className={labelClasses}>EMAIL ADDRESS *</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} className={getInputClasses(!!fieldErrors.email)} placeholder="cokkiri@example.com" />
            {fieldErrors.email && <p className="text-red-500 text-xs mt-2 font-medium">{fieldErrors.email}</p>}
          </div>
        </div>

        <div>
          <label className={labelClasses}>PHONE NUMBER</label>
          <input name="phone" value={formData.phone} onChange={handleChange} className={getInputClasses(!!fieldErrors.phone)} placeholder="010-0000-0000" />
          {fieldErrors.phone && <p className="text-red-500 text-xs mt-2 font-medium">{fieldErrors.phone}</p>}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="col-span-1 md:col-span-1 relative flex flex-col justify-end z-20">
             <label className={labelClasses}>M/F</label>
             <div 
               onClick={() => setIsGenderOpen(!isGenderOpen)}
               className={`${getInputClasses(false)} cursor-pointer flex justify-between items-center`}
             >
               <span>{formData.gender === 'MALE' ? 'MALE (남성)' : 'FEMALE (여성)'}</span>
               <motion.span animate={{ rotate: isGenderOpen ? 180 : 0 }} className="text-[10px] text-primary/40">▼</motion.span>
             </div>
             
             {/* Backdrop to close when clicking outside */}
             {isGenderOpen && (
               <div className="fixed inset-0 z-40" onClick={() => setIsGenderOpen(false)} />
             )}
             
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
                     onClick={() => { setFormData(p => ({...p, gender: 'MALE'})); setIsGenderOpen(false); }}
                     className="px-5 py-4 cursor-pointer hover:bg-primary/5 transition-colors flex items-center justify-between border-b border-primary/5 group relative"
                   >
                     {formData.gender === 'MALE' && <motion.div layoutId="gender-active" className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />}
                     <span className="font-black tracking-tight text-primary group-hover:tracking-widest transition-all duration-300">MALE</span>
                     <span className="text-[10px] text-primary/50 font-bold uppercase tracking-[0.2em]">남성</span>
                   </div>
                   <div 
                     onClick={() => { setFormData(p => ({...p, gender: 'FEMALE'})); setIsGenderOpen(false); }}
                     className="px-5 py-4 cursor-pointer hover:bg-primary/5 transition-colors flex items-center justify-between group relative"
                   >
                     {formData.gender === 'FEMALE' && <motion.div layoutId="gender-active" className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />}
                     <span className="font-black tracking-tight text-primary group-hover:tracking-widest transition-all duration-300">FEMALE</span>
                     <span className="text-[10px] text-primary/50 font-bold uppercase tracking-[0.2em]">여성</span>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
          <div className="col-span-1 md:col-span-1 flex flex-col justify-end relative z-30">
            <label className={labelClasses}>BIRTH DATE</label>
            <div 
              onClick={() => {
                setIsDateWidgetOpen(true);
                setDateWidgetStep('YEAR');
              }}
              className={`${getInputClasses(!!fieldErrors.birthDate)} cursor-pointer flex items-center justify-between`}
            >
               <span className={formData.birthDate ? 'text-primary' : 'text-primary/30'}>
                 {formData.birthDate ? formData.birthDate : 'YYYY-MM-DD'}
               </span>
            </div>
            
            {/* Backdrop to close date widget */}
            {isDateWidgetOpen && (
               <div className="fixed inset-0 z-40" onClick={() => setIsDateWidgetOpen(false)} />
            )}

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
                         {Array.from({length: 70}, (_, i) => new Date().getFullYear() - 69 + i).reverse().map(y => (
                           <div key={y} onClick={() => { setTempDate(p => ({...p, year: y})); setDateWidgetStep('MONTH'); }} className={`text-center py-2 cursor-pointer rounded-lg text-sm transition-colors ${tempDate.year === y ? 'bg-primary text-background font-bold' : 'hover:bg-primary/5 text-primary'}`}>{y}</div>
                         ))}
                       </motion.div>
                     )}
                     {dateWidgetStep === 'MONTH' && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-4 gap-2">
                         {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                           <div key={m} onClick={() => { setTempDate(p => ({...p, month: m})); setDateWidgetStep('DAY'); }} className={`text-center py-2 cursor-pointer rounded-lg text-sm transition-colors ${tempDate.month === m ? 'bg-primary text-background font-bold' : 'hover:bg-primary/5 text-primary'}`}>{m}</div>
                         ))}
                       </motion.div>
                     )}
                     {dateWidgetStep === 'DAY' && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-5 gap-2">
                         {Array.from({length: new Date(tempDate.year, tempDate.month, 0).getDate()}, (_, i) => i + 1).map(d => (
                           <div key={d} onClick={() => { 
                                setTempDate(p => ({...p, day: d}));
                                const finalDate = `${tempDate.year}-${String(tempDate.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                setFormData(p => ({...p, birthDate: finalDate})); 
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
            {fieldErrors.birthDate && <p className="text-red-500 text-xs mt-2 font-medium">{fieldErrors.birthDate}</p>}
          </div>
          <div className="col-span-1 md:col-span-1 flex flex-col justify-end">
            <label className={labelClasses}>NATION</label>
            <input name="nationality" value={formData.nationality} onChange={handleChange} className={getInputClasses(false)} placeholder="대한민국" />
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="pt-8">
        <Button
          className="w-full rounded-2xl bg-primary py-7 text-sm font-black tracking-[0.2em] uppercase transition-transform hover:scale-[1.02] active:scale-[0.98]"
          disabled={loading}
          type="submit"
        >
          {loading ? 'Creating Account...' : 'Complete Registration'}
        </Button>
      </motion.div>
    </motion.form>
  );
}
