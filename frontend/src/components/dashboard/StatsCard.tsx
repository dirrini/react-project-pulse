interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export default function StatsCard({
  title,
  value,
  subtitle
}: StatsCardProps) {
  return (
    <div
      className="
        bg-white
        rounded-xl
        border
        shadow-sm
        p-5
      "
    >
      <p
        className="
          text-sm
          text-slate-500
          mb-2
        "
      >
        {title}
      </p>

      <h3
        className="
          text-3xl
          font-bold
        "
      >
        {value}
      </h3>

      {subtitle && (
        <p
          className="
            text-xs
            text-slate-400
            mt-2
          "
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}