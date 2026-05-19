import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChartInfoButton } from "@/components/ChartInfoButton";

interface KpiCardProps {
  title: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  subtitle?: string;
  description?: string;
}

export function KpiCard({ title, value, delta, deltaPositive, subtitle, description }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className={cn("pb-2", description && "flex flex-row items-center justify-between")}>
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {description && <ChartInfoButton title={title} description={description} />}
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold sm:text-2xl">{value}</div>
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
