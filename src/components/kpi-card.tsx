import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  iconClassName?: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
}

export default function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
  trend,
}: KpiCardProps) {
  return (
    <Card className="pro-card border border-slate-200/60 shadow-sm rounded-2xl overflow-hidden group animate-slide-up">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">{value}</h3>
          </div>
          <div className={cn(
            "p-3 rounded-xl bg-slate-50 transition-all duration-500 group-hover:bg-indigo-600 group-hover:scale-110 group-hover:rotate-3 shadow-sm",
            iconClassName
          )}>
            <Icon className={cn("w-5 h-5 text-slate-400 transition-colors group-hover:text-white")} />
          </div>
        </div>
        {description && (
          <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4">
            <p className="text-[11px] font-medium text-slate-400">{description}</p>
            {trend && (
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                trend.isUp ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
              )}>
                {trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
