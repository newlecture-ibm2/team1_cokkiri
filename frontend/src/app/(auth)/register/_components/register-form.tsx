'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Frontend Validations
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
      // on success
      alert('회원가입이 완료되었습니다.');
      router.push('/login');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full rounded-xl border border-secondary bg-transparent px-4 py-3 text-primary outline-none focus:border-primary transition-colors";
  const labelClasses = "mb-2 block text-[10px] font-black uppercase tracking-[0.3em] text-muted";

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit} 
      className="flex flex-col gap-6"
    >
      {error && (
        <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      <div>
        <label className={labelClasses}>ID *</label>
        <input name="loginId" value={formData.loginId} onChange={handleChange} className={inputClasses} placeholder="아이디를 입력하세요 (4자 이상)" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClasses}>PASSWORD *</label>
          <input name="password" type="password" value={formData.password} onChange={handleChange} className={inputClasses} placeholder="비밀번호" />
        </div>
        <div>
          <label className={labelClasses}>CONFIRM PASSWORD *</label>
          <input name="passwordConfirm" type="password" value={formData.passwordConfirm} onChange={handleChange} className={inputClasses} placeholder="비밀번호 재입력" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClasses}>NAME *</label>
          <input name="name" value={formData.name} onChange={handleChange} className={inputClasses} placeholder="이름을 입력하세요" />
        </div>
        <div>
          <label className={labelClasses}>EMAIL *</label>
          <input name="email" type="email" value={formData.email} onChange={handleChange} className={inputClasses} placeholder="cokkiri@example.com" />
        </div>
      </div>

      <div>
        <label className={labelClasses}>PHONE</label>
        <input name="phone" value={formData.phone} onChange={handleChange} className={inputClasses} placeholder="010-0000-0000" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClasses}>BIRTH DATE</label>
          <input name="birthDate" value={formData.birthDate} onChange={handleChange} className={inputClasses} placeholder="YYMMDD" />
        </div>
        <div>
          <label className={labelClasses}>GENDER</label>
          <select name="gender" value={formData.gender} onChange={handleChange} className={inputClasses}>
            <option value="MALE">남성 (MALE)</option>
            <option value="FEMALE">여성 (FEMALE)</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClasses}>NATIONALITY</label>
        <input name="nationality" value={formData.nationality} onChange={handleChange} className={inputClasses} placeholder="대한민국" />
      </div>

      <Button
        className="mt-6 w-full py-4 text-lg"
        disabled={loading}
        type="submit"
      >
        {loading ? '처리 중...' : '회원가입 완료'}
      </Button>
    </motion.form>
  );
}
