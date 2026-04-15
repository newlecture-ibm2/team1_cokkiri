import Link from "next/link";
import { adminVocCategoryLabel, adminVocStatusLabel, type AdminVocListItem } from "../_types/admin-vocs";
import { formatDateTimeKo } from "@/lib/format-date";
import { cn } from "@/lib/utils";

function statusBadgeClass(status: string) {
  switch (status) {
    case "OPEN":
      return "bg-[#7F1D1D]/10 text-[#7F1D1D] border-[#7F1D1D]/20";
    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-600 border-blue-400/30";
    case "RESOLVED":
      return "bg-accent/15 text-accent border-accent/30";
    case "CANCELLED":
      return "bg-gray-100 text-gray-500 border-gray-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

interface AdminVocListRowProps {
  item: AdminVocListItem;
  rowNumber: number;
}

export function AdminVocListRow({ item, rowNumber }: AdminVocListRowProps) {
  return (
    <tr className="border-b border-primary/5 hover:bg-primary/[0.03] transition-colors group">
      <td className="px-5 py-4 text-center font-mono text-[15px] font-medium text-primary/50">
        {rowNumber}
      </td>
      <td className="px-5 py-4 text-center">
        <span className="text-[15px] font-medium text-primary/70">
          {adminVocCategoryLabel(item.category)}
        </span>
      </td>
      <td className="px-5 py-4">
        <Link
          href={`/admin/vocs/${item.vocId}`}
          className="text-lg font-normal text-primary hover:text-accent transition-colors line-clamp-1"
        >
          {item.title}
        </Link>
      </td>
      <td className="px-5 py-4 text-center">
        <span className="text-[15px] font-medium text-primary/70">
          {item.userName || `회원 #${item.userId}`}
        </span>
      </td>
      <td className="px-5 py-4 text-center">
        <span
          className={cn(
            "inline-flex items-center px-3.5 py-1 rounded-full text-[13px] font-bold tracking-wide border",
            statusBadgeClass(item.status),
          )}
          suppressHydrationWarning
        >
          {adminVocStatusLabel(item.status)}
        </span>
      </td>
      <td className="px-5 py-4 text-center text-sm font-normal text-primary/50 tabular-nums" suppressHydrationWarning>
        <time dateTime={item.createdAt}>
          {formatDateTimeKo(item.createdAt)}
        </time>
      </td>
    </tr>
  );
}
