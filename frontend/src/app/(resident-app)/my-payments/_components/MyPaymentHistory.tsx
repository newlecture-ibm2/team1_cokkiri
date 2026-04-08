'use client';

import { Payment } from '@/app/admin/billing/_types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface MyPaymentHistoryProps {
  initialPayments: Payment[];
}

declare global {
  interface Window {
    PortOne: any;
  }
}

export default function MyPaymentHistory({ initialPayments }: MyPaymentHistoryProps) {
  const router = useRouter();

  const handlePayment = async (payment: Payment) => {
    if (!window.PortOne) {
      alert('결제 모듈을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    try {
      // 1. Request Payment via PortOne SDK v2
      const response = await window.PortOne.requestPayment({
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID || 'store-demo-id',
        channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY || 'channel-demo-key',
        paymentId: `payment-${payment.paymentId}-${Date.now()}`,
        orderName: `${payment.type} 납부`,
        totalAmount: payment.amount,
        currency: 'KRW',
        payMethod: 'CARD',
      });

      if (response.code != null) {
        // Error occurred
        alert(`결제 실패: ${response.message}`);
        return;
      }

      // 2. Confirm Payment on Backend (Verification)
      const confirmResult = await apiFetch<any>('/payments/confirm', {
        method: 'POST',
        body: JSON.stringify({
          portonePaymentId: response.paymentId,
          ourPaymentId: payment.paymentId,
        }),
      });

      if (confirmResult.success) {
        alert('결제가 성공적으로 처리되었습니다.');
        router.refresh();
      } else {
        alert(`검증 실패: ${confirmResult.message}`);
      }
    } catch (error: any) {
      console.error(error);
      alert('결제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="grid gap-6">
      {initialPayments.map((payment) => (
        <Card key={payment.paymentId} className="border-secondary/20 hover:border-accent transition-all overflow-hidden relative">
          <div className={cn(
            "h-2",
            payment.status === 'PAID' ? "bg-accent" : "bg-destructive"
          )} />
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black tracking-tight uppercase">#{payment.paymentId} {payment.type}</CardTitle>
              <p className="text-sm text-muted-foreground font-medium">Billing Date: {payment.billingDate}</p>
            </div>
            <Badge 
              variant={payment.status === 'PAID' ? "default" : "destructive"}
              className={cn(payment.status === 'PAID' && "bg-accent hover:bg-accent/90")}
            >
              {payment.status}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Amount</p>
                <p className="text-3xl font-black text-primary">{payment.amount.toLocaleString()}원</p>
              </div>
              <div className="text-right">
                {payment.status === 'PAID' ? (
                  <>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Paid via {payment.paymentMethod}</p>
                    <p className="text-sm font-bold text-primary">{payment.paidDate}</p>
                  </>
                ) : payment.status === 'PENDING' ? (
                  <Button 
                    disabled
                    variant="secondary" 
                    className="font-black uppercase tracking-widest text-xs opacity-50"
                  >
                    Processing...
                  </Button>
                ) : (
                  <Button 
                    variant="default" 
                    className="bg-primary text-background hover:bg-primary/90 font-black uppercase tracking-widest text-xs px-6"
                    onClick={() => handlePayment(payment)}
                  >
                    Pay Now
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
