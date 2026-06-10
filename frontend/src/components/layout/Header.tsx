export default function Header() {
  return (
    <header
      className="
        h-16
        bg-white
        border-b
        px-6
        flex
        items-center
        justify-between
      "
    >
      <div>
        <p
          className="
            text-sm
            text-slate-500
          "
        >
          Welcome back
        </p>

        <h2
          className="
            font-semibold
          "
        >
          Diego
        </h2>
      </div>

      <div
        className="
          w-10
          h-10
          rounded-full
          bg-slate-200
        "
      />
    </header>
  );
}