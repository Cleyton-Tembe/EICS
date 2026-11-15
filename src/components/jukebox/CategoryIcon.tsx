import { Mountain, Snowflake, Sparkles, Waves, Wind, type LucideProps } from "lucide-react";
import type { CategoryId } from "@/lib/visualizations";

export function CategoryIcon({ id, ...props }: { id: CategoryId | "todas" } & LucideProps) {
  switch (id) {
    case "atmosfera":
      return <Wind aria-hidden {...props} />;
    case "oceanos":
      return <Waves aria-hidden {...props} />;
    case "gelo":
      return <Snowflake aria-hidden {...props} />;
    case "terra":
      return <Mountain aria-hidden {...props} />;
    default:
      return <Sparkles aria-hidden {...props} />;
  }
}
