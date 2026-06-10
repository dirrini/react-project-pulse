interface ProjectCardProps {
  name: string;
  description: string;
  progress: number;
}

export default function ProjectCard({
  name,
  description,
  progress
}: ProjectCardProps) {
  return (
    <div
      className="
        bg-white
        rounded-xl
        shadow-sm
        p-5
        border
        hover:shadow-md
        transition
      "
    >
      <h3
        className="
          text-lg
          font-semibold
          mb-2
        "
      >
        {name}
      </h3>

      <p
        className="
          text-slate-600
          text-sm
          mb-4
        "
      >
        {description}
      </p>

      <div className="space-y-2">
        <div
          className="
            flex
            justify-between
            text-sm
          "
        >
          <span>Progress</span>
          <span>{progress}%</span>
        </div>

        <div
          className="
            w-full
            bg-slate-200
            rounded-full
            h-2
          "
        >
          <div
            className="
              bg-blue-600
              h-2
              rounded-full
              transition-all
            "
            style={{
              width: `${progress}%`
            }}
          />
        </div>
      </div>
    </div>
  );
}