'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface NationalityItem {
  code: string;
  nameKo: string;
  nameEn: string;
  nameNative: string;
}

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
    privacyConsent: false,
    termsConsent: false,
  });

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isDateWidgetOpen, setIsDateWidgetOpen] = useState(false);
  const [dateWidgetStep, setDateWidgetStep] = useState<'YEAR' | 'MONTH' | 'DAY'>('YEAR');
  const [tempDate, setTempDate] = useState({ year: 2000, month: 1, day: 1 });
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isServiceTermsOpen, setIsServiceTermsOpen] = useState(false);
  const [nationalityList, setNationalityList] = useState<NationalityItem[]>([]);
  const [isNationalityOpen, setIsNationalityOpen] = useState(false);

  const genderRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const nationalityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchNationalities() {
      try {
        const res = await apiFetch<NationalityItem[]>("/nationalities");
        if (isMounted && res.data) {
          const sortedList = [...res.data].sort((a, b) => a.nameEn.localeCompare(b.nameEn));
          setNationalityList(sortedList);
          
          const defaultNationality = sortedList.find(item => item.code === 'KR');
          if (defaultNationality) {
            setFormData(prev => ({ ...prev, nationality: defaultNationality.code }));
          }
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (globalError) setGlobalError(null);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let error = '';

    if (name === 'loginId') {
      if (!value) error = "아이디를 입력해주세요.";
      else if (value.length < 4 || value.length > 50 || !/^[a-zA-Z0-9]+$/.test(value)) error = "아이디는 4~50자의 영문자와 숫자로만 구성되어야 합니다.";
    } else if (name === 'password') {
      if (!value) error = "비밀번호를 입력해주세요.";
      else if (value.length < 8 || !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]+$/.test(value)) error = "영문, 숫자, 특수문자 포함 8자 이상 작성하세요.";
    } else if (name === 'passwordConfirm') {
      if (!value) error = "비밀번호 확인을 입력해주세요.";
      else if (value !== formData.password) error = "비밀번호가 일치하지 않습니다.";
    } else if (name === 'name') {
      if (!value) error = "이름을 입력해주세요.";
      else if (value.length < 2 || value.length > 50) error = "이름은 2~50자로 입력해주세요.";
    } else if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) error = "이메일을 입력해주세요.";
      else if (!emailRegex.test(value)) error = "올바른 이메일 형식이 아닙니다.";
    } else if (name === 'phone') {
      if (!value) error = "연락처를 입력해주세요.";
      else if (!/^(02-\d{3,4}-\d{4}|0\d{2}-\d{3,4}-\d{4})$/.test(value)) error = "올바른 연락처 형식이 아닙니다.";
    }

    if (error) {
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setFieldErrors({});

    if (!formData.privacyConsent || !formData.termsConsent) {
      if (!formData.termsConsent) setFieldErrors(prev => ({ ...prev, termsConsent: '이용 약관에 동의해야 합니다.' }));
      if (!formData.privacyConsent) setFieldErrors(prev => ({ ...prev, privacyConsent: '개인 정보 수집 및 이용에 동의해야 합니다.' }));
      setGlobalError('입력 정보를 다시 확인해주세요.');
      return;
    }

    let finalBirthDate = formData.birthDate;
    if (finalBirthDate.includes('-')) {
      const parts = finalBirthDate.split('-');
      if (parts.length === 3) {
        finalBirthDate = parts[0].slice(2) + parts[1] + parts[2];
      }
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
        if (err.errorCode === 'VALIDATION_ERROR') {
          if (err.data && typeof err.data === 'object' && Object.keys(err.data).length > 0) {
            setFieldErrors(err.data);
            setGlobalError("입력 정보를 다시 확인해주세요.");
          } else {
            setGlobalError(err.message);
          }
        } else {
          setGlobalError(err.message);
        }
      } else {
        setGlobalError('알 수 없는 오류가 발생했습니다.');
      }
      setLoading(false);
    }
  };

  const getInputClasses = (hasError: boolean) =>
    `w-full border-b bg-transparent px-0 py-3 text-lg font-medium text-primary outline-none transition-colors placeholder:text-primary/50 ${hasError ? 'border-red-500 focus:border-red-500' : 'border-primary/20 focus:border-accent'}`;
  const labelClasses = "block text-[10px] font-black uppercase tracking-[0.3em] text-primary/80 mb-1";

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
        <p className="text-primary/60 font-medium">회원가입이 성공적으로 완료되었습니다.<br />잠시 후 로그인 페이지로 이동합니다.</p>
      </motion.div>
    );
  }

  return (
    <>
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
            <label className={labelClasses}>LOGIN ID *</label>
            <input name="loginId" value={formData.loginId} onChange={handleChange} onBlur={handleBlur} className={getInputClasses(!!fieldErrors.loginId)} placeholder="아이디를 입력하세요 (4자 이상)" />
            {fieldErrors.loginId && <p className="absolute top-full left-0 mt-1.5 text-red-500 text-xs font-medium leading-tight">{fieldErrors.loginId}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-8">
            <div className="relative">
              <label className={labelClasses}>PASSWORD *</label>
              <input name="password" type="password" value={formData.password} onChange={handleChange} onBlur={handleBlur} className={getInputClasses(!!fieldErrors.password)} placeholder="비밀번호" />
              {fieldErrors.password ? (
                <p className="absolute top-full left-0 mt-1.5 text-red-500 text-xs font-medium leading-tight">{fieldErrors.password}</p>
              ) : (
                <p className="absolute top-full left-0 mt-1.5 text-primary/60 text-[11px] font-medium tracking-tight">8자 이상, 특수문자 조합</p>
              )}
            </div>
            <div className="relative">
              <label className={labelClasses}>CONFIRM PASSWORD *</label>
              <input name="passwordConfirm" type="password" value={formData.passwordConfirm} onChange={handleChange} onBlur={handleBlur} className={getInputClasses(!!fieldErrors.passwordConfirm)} placeholder="비밀번호 재입력" />
              {fieldErrors.passwordConfirm && <p className="absolute top-full left-0 mt-1.5 text-red-500 text-xs font-medium leading-tight">{fieldErrors.passwordConfirm}</p>}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-8">
            <div className="relative">
              <label className={labelClasses}>FULL NAME *</label>
              <input name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur} className={getInputClasses(!!fieldErrors.name)} placeholder="이름을 입력하세요" />
              {fieldErrors.name && <p className="absolute top-full left-0 mt-1.5 text-red-500 text-xs font-medium leading-tight">{fieldErrors.name}</p>}
            </div>
            <div className="relative">
              <label className={labelClasses}>EMAIL ADDRESS *</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} className={getInputClasses(!!fieldErrors.email)} placeholder="cokkiri@example.com" />
              {fieldErrors.email && <p className="absolute top-full left-0 mt-1.5 text-red-500 text-xs font-medium leading-tight">{fieldErrors.email}</p>}
            </div>
          </div>

          <div className="relative">
            <label className={labelClasses}>PHONE NUMBER *</label>
            <input name="phone" value={formData.phone} onChange={handleChange} onBlur={handleBlur} className={getInputClasses(!!fieldErrors.phone)} placeholder="010-0000-0000" />
            {fieldErrors.phone && <p className="absolute top-full left-0 mt-1.5 text-red-500 text-xs font-medium leading-tight">{fieldErrors.phone}</p>}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className={`space-y-6 relative ${isGenderOpen || isDateWidgetOpen || isNationalityOpen ? 'z-50' : 'z-20'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-8">
            <div className="col-span-1 md:col-span-1 relative flex flex-col justify-end z-20" ref={genderRef}>
              <label className={labelClasses}>M/F</label>
              <div
                onClick={() => {
                  setIsGenderOpen(!isGenderOpen);
                  setIsDateWidgetOpen(false);
                  setIsNationalityOpen(false);
                }}
                className={`${getInputClasses(false)} cursor-pointer flex justify-between items-center`}
              >
                <span>{formData.gender === 'MALE' ? 'MALE (남성)' : 'FEMALE (여성)'}</span>
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
                      onClick={() => { setFormData(p => ({ ...p, gender: 'MALE' })); setIsGenderOpen(false); }}
                      className="px-5 py-4 cursor-pointer hover:bg-primary/5 transition-colors flex items-center justify-between border-b border-primary/5 group relative"
                    >
                      {formData.gender === 'MALE' && <motion.div layoutId="gender-active" className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />}
                      <span className="font-black tracking-tight text-primary group-hover:tracking-widest transition-all duration-300">MALE</span>
                      <span className="text-[10px] text-primary/60 font-bold uppercase tracking-[0.2em]">남성</span>
                    </div>
                    <div
                      onClick={() => { setFormData(p => ({ ...p, gender: 'FEMALE' })); setIsGenderOpen(false); }}
                      className="px-5 py-4 cursor-pointer hover:bg-primary/5 transition-colors flex items-center justify-between group relative"
                    >
                      {formData.gender === 'FEMALE' && <motion.div layoutId="gender-active" className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />}
                      <span className="font-black tracking-tight text-primary group-hover:tracking-widest transition-all duration-300">FEMALE</span>
                      <span className="text-[10px] text-primary/60 font-bold uppercase tracking-[0.2em]">여성</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {fieldErrors.birthDate && <p className="absolute top-full left-0 mt-1.5 text-red-500 text-xs font-medium leading-tight">{fieldErrors.birthDate}</p>}
            </div>
            <div className="col-span-1 md:col-span-1 flex flex-col justify-end relative z-30" ref={dateRef}>
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
                <span className={formData.birthDate ? 'text-primary' : 'text-primary/50'}>
                  {formData.birthDate ? formData.birthDate : 'YYYY-MM-DD'}
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
                              setFormData(p => ({ ...p, birthDate: finalDate }));
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

          <div className={`relative ${isNationalityOpen ? 'z-50' : 'z-10'} mt-6`} ref={nationalityRef}>
              <label className={labelClasses}>LOCATION</label>
              <div
                onClick={() => {
                  setIsNationalityOpen(!isNationalityOpen);
                  setIsGenderOpen(false);
                  setIsDateWidgetOpen(false);
                }}
                className={`${getInputClasses(!!fieldErrors.nationality)} cursor-pointer flex justify-between items-center`}
              >
                <span className={formData.nationality ? '' : 'text-primary/50'}>
                  {formData.nationality ? nationalityList.find(n => n.code === formData.nationality)?.nameNative || formData.nationality : '국적을 선택해주세요'}
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
                    className="absolute bottom-full left-0 right-0 mb-3 bg-[#e8ebe6] border border-primary/10 rounded-lg shadow-xl overflow-y-auto max-h-60 z-50 origin-bottom [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-primary/20 [&::-webkit-scrollbar-thumb]:rounded-full"
                  >
                    {nationalityList.map((item) => (
                      <div
                        key={item.code}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, nationality: item.code }));
                          setIsNationalityOpen(false);
                          if (fieldErrors.nationality) setFieldErrors(prev => ({ ...prev, nationality: '' }));
                        }}
                        className="px-5 py-3 cursor-pointer hover:bg-primary/5 transition-colors flex items-center justify-between group relative"
                      >
                        {formData.nationality === item.code && <motion.div layoutId="nationality-active" className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />}
                        <span className={`text-lg font-bold tracking-tight group-hover:tracking-normal transition-all duration-300 ${formData.nationality === item.code ? 'text-accent' : 'text-primary'}`}>
                          {item.nameEn.toUpperCase()}
                        </span>
                        <span className="text-xs text-primary/60 font-black uppercase tracking-[0.2em]">{item.nameNative}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              {fieldErrors.nationality && <p className="absolute top-full left-0 mt-1.5 text-red-500 text-xs font-medium leading-tight">{fieldErrors.nationality}</p>}
            </div>
        </motion.div>

        <motion.div variants={itemVariants} className="pt-0 flex flex-col gap-8">
          <div className="relative flex items-center gap-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.termsConsent ? 'bg-accent border-accent text-background' : 'border-primary/30 group-hover:border-primary/60'}`}>
                <CheckCircle2 className={`w-3.5 h-3.5 ${formData.termsConsent ? 'opacity-100' : 'opacity-0'}`} />
              </div>
              <input
                name="termsConsent"
                type="checkbox"
                className="hidden"
                checked={formData.termsConsent}
                onChange={handleCheckboxChange}
              />
              <span className="text-sm font-medium text-primary/80 group-hover:text-primary transition-colors">
                이용 약관 동의 <span className="text-accent font-black">(필수)</span>
              </span>
            </label>
            <button
              type="button"
              onClick={() => setIsServiceTermsOpen(true)}
              className="text-xs font-black tracking-widest uppercase text-primary/50 underline underline-offset-4 hover:text-primary transition-colors"
            >
              약관 보기
            </button>
            {fieldErrors.termsConsent && <p className="absolute top-full left-0 mt-1 text-red-500 text-xs font-medium leading-tight">{fieldErrors.termsConsent}</p>}
          </div>

          <div className="relative flex items-center gap-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.privacyConsent ? 'bg-accent border-accent text-background' : 'border-primary/30 group-hover:border-primary/60'}`}>
                <CheckCircle2 className={`w-3.5 h-3.5 ${formData.privacyConsent ? 'opacity-100' : 'opacity-0'}`} />
              </div>
              <input
                name="privacyConsent"
                type="checkbox"
                className="hidden"
                checked={formData.privacyConsent}
                onChange={handleCheckboxChange}
              />
              <span className="text-sm font-medium text-primary/80 group-hover:text-primary transition-colors">
                개인 정보 수집 및 이용 동의 <span className="text-accent font-black">(필수)</span>
              </span>
            </label>
            <button
              type="button"
              onClick={() => setIsTermsOpen(true)}
              className="text-xs font-black tracking-widest uppercase text-primary/50 underline underline-offset-4 hover:text-primary transition-colors"
            >
              약관 보기
            </button>
            {fieldErrors.privacyConsent && <p className="absolute top-full left-0 mt-1 text-red-500 text-xs font-medium leading-tight">{fieldErrors.privacyConsent}</p>}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="pt-2">
          <Button
            className="w-full rounded-xl bg-primary h-12 text-sm font-black tracking-[0.2em] uppercase transition-transform hover:scale-[1.02] active:scale-[0.98]"
            disabled={loading}
            type="submit"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </Button>
        </motion.div>
      </form>

      <AnimatePresence>
        {isTermsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm"
            onClick={() => setIsTermsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-primary/10 flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-primary/10 flex items-center justify-between bg-primary/5">
                <h4 className="font-black tracking-tight text-primary uppercase text-lg">개인 정보 수집 및 이용 동의</h4>
                <button
                  type="button"
                  onClick={() => setIsTermsOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary/10 transition-colors text-primary/70 hover:text-primary"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 overflow-y-auto text-sm text-primary/70 space-y-4 font-medium leading-relaxed [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary/20 hover:[&::-webkit-scrollbar-thumb]:bg-primary/40 [&::-webkit-scrollbar-thumb]:rounded-full pr-4">
                <p>
                  <strong>1. 수집하는 개인정보 항목</strong><br />
                  서비스는 회원가입, 공간 계약, 문의 응대 등을 위해 아래와 같은 개인정보를 수집합니다.<br />
                  • 필수 항목: 아이디, 비밀번호, 이름, 생년월일, 성별, 국적, 휴대전화번호, 이메일<br />
                  • 계약 항목: 주소, 계좌번호 (계약 신청 시)<br />
                  • 자동 수집 항목: 기기 제어 이력, 공용 시설 예약 로그, 접속 로그, 쿠키, 접속 IP 정보
                </p>
                <p>
                  <strong>2. 개인정보의 수집 및 이용 목적</strong><br />
                  • 회원 가입 및 관리: 본인 확인, 회원 자격 유지·관리<br />
                  • 계약 및 주거 관리: 임대차 계약 체결, 결제 및 청구 관리, 입주자 권한 부여<br />
                  • 서비스 제공: 개인공간 및 공용공간 IoT 기기 제어, 공용 시설 예약<br />
                  • 문의 및 고객 지원: 민원(VoC) 접수, 불만 처리, 공지사항 전달
                </p>
                <p>
                  <strong>3. 개인정보의 보유 및 이용 기간</strong><br />
                  • 회원 탈퇴 및 계약 만료 시까지 보유하며, 이후에는 지체 없이 파기합니다. 단, 관계 법령에 따라 보존할 필요가 있는 경우 해당 기간 동안 보관합니다.<br />
                  • 전자상거래 등에서의 소비자 보호에 관한 법률 등에 따라 계약 및 청구 관련 기록은 5년간 보관할 수 있습니다.
                </p>
                <p>
                  <strong>4. 개인정보의 제3자 제공</strong><br />
                  서비스는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 스마트 기기 연동(Mock IoT 등)을 위해 불가피하게 제한된 정보(기기 제어 토큰 등)가 전송될 수 있으며, 법령에 의하거나 이용자가 사전에 동의한 경우에는 예외로 합니다.
                </p>
                <p>
                  <strong>5. 이용자의 권리</strong><br />
                  이용자는 언제든지 자신의 개인정보를 조회·수정·삭제·처리 정지를 요청할 수 있으며, 서비스는 이에 대해 지체 없이 조치합니다. (단, 활성 계약이 있는 경우 일부 정보 삭제가 제한될 수 있습니다.)
                </p>
                <p>
                  <strong>6. 개인정보 보호책임자</strong><br />
                  개인정보 처리와 관련한 문의는 Co-끼리(COKKIRI) 웹/앱 내 민원(VoC) 접수 또는 고객센터로 문의하시기 바랍니다.
                </p>
              </div>
              <div className="p-6 border-t border-primary/10 bg-primary/5">
                <Button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, privacyConsent: true }));
                    setFieldErrors(prev => ({ ...prev, privacyConsent: '' }));
                    if (globalError) setGlobalError(null);
                    setIsTermsOpen(false);
                  }}
                  className="w-full rounded-xl bg-primary text-background font-black tracking-widest uppercase py-6 hover:scale-[1.02] transition-transform"
                >
                  동의하고 닫기
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isServiceTermsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm"
            onClick={() => setIsServiceTermsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-primary/10 flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-primary/10 flex items-center justify-between bg-primary/5">
                <h4 className="font-black tracking-tight text-primary uppercase text-lg">이용 약관</h4>
                <button
                  type="button"
                  onClick={() => setIsServiceTermsOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary/10 transition-colors text-primary/70 hover:text-primary"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 overflow-y-auto text-sm text-primary/70 space-y-4 font-medium leading-relaxed [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary/20 hover:[&::-webkit-scrollbar-thumb]:bg-primary/40 [&::-webkit-scrollbar-thumb]:rounded-full pr-4">
                <p>
                  <strong>제1조 (목적)</strong><br />
                  이 약관은 Co-끼리(COKKIRI)(이하 "서비스")가 제공하는 코리빙(Co-Living) 공간 임대차, IoT 기기 제어, 공용 시설 예약 및 회원 관리 서비스의 이용과 관련하여 서비스와 이용자 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
                </p>
                <p>
                  <strong>제2조 (정의)</strong><br />
                  ① "서비스"란 COKKIRI가 제공하는 웹/앱 기반의 공간 조회, 계약 관리, IoT 제어, 예약, 결제 등 전체 코리빙 플랫폼을 말합니다.<br />
                  ② "이용자"란 본 약관에 따라 서비스를 이용하는 회원(일반 유저, 입주자) 및 비회원을 말합니다.<br />
                  ③ "일반 유저(USER)"란 서비스에 가입하여 체결 전 상태로 서비스를 이용하는 자를 말합니다.<br />
                  ④ "입주자(RESIDENT)"란 계약 체결을 완료하여 입주 및 IoT, 시설 예약 권한을 부여받은 자를 말합니다.
                </p>
                <p>
                  <strong>제3조 (약관의 효력 및 변경)</strong><br />
                  ① 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 공지함으로써 효력이 발생합니다.<br />
                  ② 서비스는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있으며, 변경된 약관은 사전에 공지합니다.<br />
                  ③ 이용자는 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다. (단, 진행 중인 활성 임대차 계약이 있는 경우 탈퇴가 제한될 수 있습니다.)
                </p>
                <p>
                  <strong>제4조 (서비스의 제공)</strong><br />
                  ① 서비스는 방 둘러보기, 계약 신청 및 체결, 개인 및 공용공간 IoT 제어, 커뮤니티, 알림, 민원(VoC) 접수 등의 기능을 제공합니다.<br />
                  ② 공용 기기의 경우 예약된 시간대에만 제어가 가능하며, 입주자의 안전과 관리를 위해 관리자(ADMIN) 권한으로 접근이 제한될 수 있습니다.
                </p>
                <p>
                  <strong>제5조 (이용계약의 성립)</strong><br />
                  ① 이용계약은 이용자가 약관 내용에 동의하고 가입 신청을 한 후, 서비스가 이를 승낙함으로써 성립합니다.<br />
                  ② 서비스는 아래 사항(타인 명의 도용, 허위 정보 기재 등)에 해당하는 경우 언제든 가입 및 계약을 거부하거나 해지할 수 있습니다.
                </p>
                <p>
                  <strong>제6조 (회원의 의무)</strong><br />
                  회원은 서비스 이용 시 관계 법령, 본 약관 및 각 시설의 이용 수칙을 준수하여야 하며, IoT 기기 및 공간을 훼손하거나 부정제어, 타인의 거주 환경을 침해하는 행위를 하여서는 안 됩니다.
                </p>
              </div>
              <div className="p-6 border-t border-primary/10 bg-primary/5">
                <Button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, termsConsent: true }));
                    setFieldErrors(prev => ({ ...prev, termsConsent: '' }));
                    if (globalError) setGlobalError(null);
                    setIsServiceTermsOpen(false);
                  }}
                  className="w-full rounded-xl bg-primary text-background font-black tracking-widest uppercase py-6 hover:scale-[1.02] transition-transform"
                >
                  동의하고 닫기
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
