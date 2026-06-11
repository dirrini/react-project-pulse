import type { ProjectStatus }
  from "../../types/Project";

interface Props {
  status: ProjectStatus;
}

export default function StatusBadge({
  status
}: Props) {
  const styles = {
    ON_TRACK:
      "bg-green-100 text-green-700",

    AT_RISK:
      "bg-yellow-100 text-yellow-700",

    COMPLETED:
      "bg-blue-100 text-blue-700"
  };

  const labels = {
    ON_TRACK: "On Track",
    AT_RISK: "At Risk",
    COMPLETED: "Completed"
  };

  return (
    <span
      className={`
        px-3
        py-1
        rounded-full
        text-xs
        font-medium
        ${styles[status]}
      `}
    >
      {labels[status]}
    </span>
  );
}