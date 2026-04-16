import { LayoutList, Clock, CheckCircle2, Bell } from "lucide-react";
import { adminBffGet } from "../_api/admin-bff-server";
import type { AdminVocListData, ApiResponse } from "../_types/admin-vocs";

async function getCount(query: string): Promise<number> {
  try {
    const res = await adminBffGet(`admin/vocs?${query}&s=1`);
    if (res.ok) {
      const body = (await res.json()) as ApiResponse<AdminVocListData>;
      return body.data?.totalElements ?? 0;
    }
  } catch (e) {
    console.error(e);
  }
  return 0;
}

export async function AdminVocDashboard() {
  // 실제 데이터를 병렬로 가져옵니다.
  const [total, pending, open] = await Promise.all([
    getCount(""), // 전체
    getCount("pending=true"), // 접수+처리중
    getCount("status=OPEN"), // 순수 접수 상태
  ]);
  
  const inProgress = pending - open;

  const stats = [
    {
      label: "전체 민원",
      value: total,
      icon: LayoutList,
      color: "text-[#4A7C6F]",
      bg: "bg-[#4A7C6F]/10",
    },
    {
      label: "신규 접수",
      value: open,
      icon: Bell,
      color: "text-[#7F1D1D]",
      bg: "bg-[#7F1D1D]/10",
      alert: open > 0,
    },
    {
      label: "처리 중",
      value: inProgress,
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-600/10",
    },
    {
      label: "해결됨",
      value: total - pending,
      icon: CheckCircle2,
      color: "text-[#4A7C6F]",
      bg: "bg-[#4A7C6F]/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-[2rem] border border-primary/5 bg-white p-6 shadow-sm transition-all hover:bg-primary/[0.02]"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs md:text-sm font-bold uppercase tracking-wider text-primary/50">
                  {stat.label}
                </p>
                <p className="text-3xl font-black tracking-tighter text-primary">
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <div className={`rounded-2xl ${stat.bg} p-3 transition-transform group-hover:scale-110`}>
                <Icon className={`size-5 ${stat.color}`} strokeWidth={2.5} />
              </div>
            </div>
            
            {stat.alert && (
              <div className="absolute top-3 right-3 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7F1D1D] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7F1D1D]"></span>
              </div>
            )}
            
            <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-primary/5">
              <div 
                className={`h-full ${stat.color.replace('text-', 'bg-')} opacity-40 transition-all duration-1000`}
                style={{ width: total > 0 ? `${(stat.value / total) * 100}%` : '0%' }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
