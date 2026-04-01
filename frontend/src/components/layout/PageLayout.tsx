// Placeholder for PageLayout.tsx (반응형 Adaptive Spacing 래퍼 컴포넌트)
import React from 'react';

export default function PageLayout({ children }: { children: React.ReactNode }) {
    return (
        // 데스크톱은 pt-32, 모바일은 pt-16 등으로 50% 축소하는 가이드라인 적용 컨테이너
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24">
            {children}
        </div>
    );
}
