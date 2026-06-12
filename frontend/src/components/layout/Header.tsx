import {
  useApolloClient,
  useQuery
} from "@apollo/client/react";
import { useNavigate } from "react-router-dom";

import { ME_QUERY }
  from "../../graphql/queries/auth";
import { clearAuthToken }
  from "../../lib/authStorage";

type MeQueryData = {
  me: {
    name: string;
    email: string;
  } | null;
};

export default function Header() {
  const navigate = useNavigate();
  const apolloClient = useApolloClient();
  const { data } =
    useQuery<MeQueryData>(ME_QUERY);
  const currentUser = data?.me;

  const handleLogout = async () => {
    clearAuthToken();
    await apolloClient.clearStore();
    navigate("/login", {
      replace: true
    });
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
          {currentUser?.name ?? "User"}
        </h2>
      </div>

      <div
        className="
          flex
          items-center
          gap-3
        "
      >
        <div
          className="
            hidden
            text-right
            text-sm
            text-slate-500
            sm:block
          "
        >
          {currentUser?.email}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="
            rounded-lg
            border
            px-3
            py-2
            text-sm
            transition
            hover:bg-slate-100
          "
        >
          Logout
        </button>
      </div>
    </header>
  );
}
