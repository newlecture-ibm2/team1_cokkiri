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
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.loginId || !formData.password || !formData.passwordConfirm || !formData.name || !formData.email) {
      setError('필수 정보를 모두 입력해주세요.');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
      setLoading(false);
    }
  };

  const inputClasses = "w-full border-b border-primary/20 bg-transparent px-0 py-3 text-lg font-medium text-primary outline-none focus:border-accent transition-colors placeholder:text-primary/30";
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
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 rounded-2xl bg-red-500/10 p-4 text-sm font-medium text-red-600">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants} className="space-y-10">
        <div>
          <label className={labelClasses}>LOGIN ID *</label>
          <input name="loginId" value={formData.loginId} onChange={handleChange} className={inputClasses} placeholder="아이디를 입력하세요 (4자 이상)" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <label className={labelClasses}>PASSWORD *</label>
            <input name="password" type="password" value={formData.password} onChange={handleChange} className={inputClasses} placeholder="비밀번호" />
          </div>
          <div>
            <label className={labelClasses}>CONFIRM PASSWORD *</label>
            <input name="passwordConfirm" type="password" value={formData.passwordConfirm} onChange={handleChange} className={inputClasses} placeholder="비밀번호 재입력" />
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <label className={labelClasses}>FULL NAME *</label>
            <input name="name" value={formData.name} onChange={handleChange} className={inputClasses} placeholder="이름을 입력하세요" />
          </div>
          <div>
            <label className={labelClasses}>EMAIL ADDRESS *</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} className={inputClasses} placeholder="cokkiri@example.com" />
          </div>
        </div>

        <div>
          <label className={labelClasses}>PHONE NUMBER</label>
          <input name="phone" value={formData.phone} onChange={handleChange} className={inputClasses} placeholder="010-0000-0000" />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="col-span-1 md:col-span-1">
             <label className={labelClasses}>M/F</label>
             <select name="gender" value={formData.gender} onChange={handleChange} className={`${inputClasses} appearance-none cursor-pointer`}>
               <option value="MALE">MALE (남성)</option>
               <option value="FEMALE">FEMALE (여성)</option>
             </select>
          </div>
          <div className="col-span-1 md:col-span-1">
            <label className={labelClasses}>BIRTH DATE</label>
            <input name="birthDate" value={formData.birthDate} onChange={handleChange} className={inputClasses} placeholder="YYMMDD" />
          </div>
          <div className="col-span-1 md:col-span-1">
            <label className={labelClasses}>NATION</label>
            <input name="nationality" value={formData.nationality} onChange={handleChange} className={inputClasses} placeholder="대한민국" />
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
