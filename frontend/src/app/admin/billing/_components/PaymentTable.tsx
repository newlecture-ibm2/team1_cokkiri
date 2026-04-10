'use client';

import { useState, useTransition } from 'react';
import { Payment } from '../_types';
import { approvePayment } from '../_api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PaymentTableProps {
  initialPayments: Payment[];
}

export default function PaymentTable({ initialPayments }: PaymentTableProps) {
  const [payments, setPayments] = useState(initialPayments);
  const [isPending, startTransition] = useTransition();

  const handleApprove = async (paymentId: number) => {
    if (!confirm('해당 결제를 승인하시겠습니까?')) return;

    startTransition(async () => {
      try {
        const approved = await approvePayment(paymentId, {
          paymentMethod: 'TRANSFER', 
          paidDate: new Date().toISOString().split('T')[0],
        });
        
        if (approved.success) {
          setPayments(prev => 
            prev.map(p => p.paymentId === paymentId ? approved.data! : p)
          );
          alert('결제가 승인되었습니다.');
        }
      } catch (error: any) {
        alert(error.message || '결제 승인 중 오류가 발생했습니다.');
      }
    });
  };

  return (
    <div className="mt-8 overflow-hidden rounded-xl border border-secondary/20 bg-moss/5">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[#2C3424] text-[#DADED8] uppercase text-[10px] font-black tracking-widest">
          <tr>
            <th className="px-6 py-4">ID</th>
            <th className="px-6 py-4">유저</th>
            <th className="px-6 py-4">유형</th>
            <th className="px-6 py-4">금액</th>
            <th className="px-6 py-4">상태</th>
            <th className="px-6 py-4">청구일</th>
            <th className="px-6 py-4">납부일</th>
            <th className="px-6 py-4">관리</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary/10">
          {payments.map((payment) => (
            <tr key={payment.paymentId} className="hover:bg-moss/10 transition-colors">
              <td className="px-6 py-4 font-mono text-sm">{payment.paymentId}</td>
              <td className="px-6 py-4 text-sm">
                <div className="font-bold">{payment.userName || '-'}</div>
                <div className="text-[10px] text-muted-foreground">{payment.loginId || '-'}</div>
              </td>
              <td className="px-6 py-4">
                <Badge variant="outline" className="bg-white/50">{payment.type}</Badge>
              </td>
              <td className="px-6 py-4 font-bold">
                {Number(payment.amount || 0).toLocaleString()}원
              </td>
              <td className="px-6 py-4">
                <Badge 
                  className={payment.status === 'PAID' ? 'bg-[#768064]' : payment.status === 'PENDING' ? 'bg-yellow-600' : 'bg-red-600'}
                >
                  {payment.status}
                </Badge>
              </td>
              <td className="px-6 py-4 text-muted-foreground text-sm">
                {payment.billingDate}
              </td>
              <td className="px-6 py-4 text-muted-foreground text-sm">
                {payment.paidDate || '-'}
              </td>
              <td className="px-6 py-4">
                {payment.status !== 'PAID' && (
                  <Button 
                    size="default" 
                    variant="default"
                    onClick={() => handleApprove(payment.paymentId)}
                    disabled={isPending}
                  >
                    승인
                  </Button>
                )}
              </td>
            </tr>
          ))}
          {payments.length === 0 && (
            <tr>
              <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                결제 내역이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
