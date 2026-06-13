import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside
      className="
        w-64
        bg-slate-900
        text-white
        flex
        flex-col
      "
    >
      <div
        className="
          px-6
          py-5
          border-b
          border-slate-800
        "
      >
        <h1
          className="
            text-xl
            font-bold
          "
        >
          ProjectPulse
        </h1>
      </div>

      <nav
        className="
          flex-1
          p-4
        "
      >
        <ul className="space-y-2">
          <li>
            <Link
              to="/"
              className="
                block
                px-4
                py-2
                rounded-lg
                hover:bg-slate-800
              "
            >
              Dashboard
            </Link>
          </li>

          <li>
            <Link
              to="/projects"
              className="
                block
                px-4
                py-2
                rounded-lg
                hover:bg-slate-800
              "
            >
              Projects
            </Link>
          </li>

          <li>
            <Link
              to="/users"
              className="
                block
                px-4
                py-2
                rounded-lg
                hover:bg-slate-800
              "
            >
              Users
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
