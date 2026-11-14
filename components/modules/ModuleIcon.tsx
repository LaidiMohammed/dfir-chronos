import type { ComponentType, SVGProps } from "react";
import { Clock, Cpu, ShieldQuestion } from "lucide-react";

const iconMap: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  Clock,
  Cpu,
};

export function ModuleIcon({
  icon,
  className = "",
}: {
  icon: string;
  className?: string;
}) {
  const Icon = iconMap[icon] ?? ShieldQuestion;
  return <Icon className={className} aria-hidden="true" />;
}
