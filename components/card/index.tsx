import { Button } from "../ui/button";

export default function Card({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border border-border rounded-xl p-4 md:p-6 hover:shadow-lg transition-shadow bg-card">
      <div className="flex items-start justify-between mb-4">
        <div className="text-3xl md:text-4xl">{icon}</div>
        <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
          ⭐
        </button>
      </div>
      <h3 className="font-bold text-lg md:text-xl text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mb-6">{description}</p>
      <Button variant="outline" className="w-full bg-transparent">
        Open
      </Button>
    </div>
  );
}
