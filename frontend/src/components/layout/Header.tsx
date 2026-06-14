import {
  useMemo,
  useState
} from "react";
import {
  useApolloClient,
  useQuery
} from "@apollo/client/react";
import {
  ChevronDown,
  Menu
} from "lucide-react";
import {
  useLocation,
  useNavigate
} from "react-router-dom";

import { ME_QUERY }
  from "../../graphql/queries/auth";
import { clearAuthToken }
  from "../../lib/authStorage";

type MeQueryData = {
  me: {
    name: string;
    email: string;
    role: string;
  } | null;
};

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({
  onMenuClick
}: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const apolloClient = useApolloClient();
  const [
    isProfileOpen,
    setIsProfileOpen
  ] = useState(false);
  const { data } =
    useQuery<MeQueryData>(ME_QUERY);
  const currentUser = data?.me;
  const userInitials = useMemo(() => {
    if (!currentUser?.name) {
      return "U";
    }

    return currentUser.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }, [currentUser?.name]);
  const pageTitle = useMemo(() => {
    const pathname =
      location.pathname;

    if (pathname === "/") {
      return "Dashboard";
    }

    if (pathname === "/projects") {
      return "Projects";
    }

    if (
      pathname.startsWith("/projects/")
    ) {
      return "Project details";
    }

    if (pathname === "/users") {
      return "Users";
    }

    return "ProjectPulse";
  }, [location.pathname]);

  const handleLogout = async () => {
    clearAuthToken();
    await apolloClient.clearStore();
    navigate("/login", {
      replace: true
    });
  };

  const handleProfileToggle = () => {
    setIsProfileOpen(
      (isOpen) => !isOpen
    );
  };

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
      <div
        className="
          flex
          min-w-0
          items-center
          gap-3
        "
      >
        <button
          type="button"
          onClick={onMenuClick}
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-lg
            border
            transition
            hover:bg-slate-100
            lg:hidden
          "
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>

        <h2
          className="
            truncate
            text-xl
            font-semibold
            text-slate-900
          "
        >
          {pageTitle}
        </h2>
      </div>

      <div
        className="
          relative
          flex
          items-center
          gap-3
        "
      >
        <button
          type="button"
          onClick={handleProfileToggle}
          className="
            flex
            items-center
            gap-2
            justify-center
            rounded-lg
            border
            px-2
            py-1.5
            transition
            hover:bg-slate-100
          "
          aria-label="Open profile menu"
        >
          <span
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              bg-slate-900
              text-xs
              font-semibold
              text-white
            "
          >
            {userInitials}
          </span>

          <span
            className="
              hidden
              max-w-32
              truncate
              text-sm
              font-medium
              text-slate-700
              sm:block
            "
          >
            {currentUser?.name ?? "User"}
          </span>

          <ChevronDown
            size={16}
            className="text-slate-500"
          />
        </button>

        {isProfileOpen && (
          <div
            className="
              absolute
              right-0
              top-12
              z-50
              w-72
              rounded-xl
              border
              bg-white
              p-4
              shadow-lg
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
                border-b
                pb-4
              "
            >
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  bg-slate-900
                  text-sm
                  font-semibold
                  text-white
                "
              >
                {userInitials}
              </div>

              <div className="min-w-0">
                <p
                  className="
                    truncate
                    font-semibold
                    text-slate-900
                  "
                >
                  {currentUser?.name ?? "User"}
                </p>

                <p
                  className="
                    truncate
                    text-sm
                    text-slate-500
                  "
                >
                  {currentUser?.email}
                </p>
              </div>
            </div>

            <div
              className="
                mt-3
                flex
                items-center
                justify-between
                text-sm
              "
            >
              <span className="text-slate-500">
                Role
              </span>
              <span
                className="
                  rounded-full
                  bg-slate-100
                  px-3
                  py-1
                  text-xs
                  font-medium
                  text-slate-700
                "
              >
                {currentUser?.role ?? "USER"}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="
                mt-4
                w-full
                rounded-lg
                border
                px-4
                py-2
                text-sm
                font-medium
                text-slate-700
                transition
                hover:bg-slate-100
              "
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
