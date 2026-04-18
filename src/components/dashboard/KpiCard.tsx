import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  subtitle?: string;
}

export function KpiCard({ title, value, delta, deltaPositive, subtitle }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {delta && (
          <Badge
            variant="outline"
            className={cn(
              "mt-1 text-xs",
              deltaPositive ? "border-green-500 text-green-600" : "border-red-500 text-red-600"
            )}
          >
            {delta}
          </Badge>
        )}
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
