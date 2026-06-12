import {
  useState,
  type FormEvent
} from "react";
import {
  Navigate,
  useLocation,
  useNavigate
} from "react-router-dom";
import {
  useApolloClient,
  useMutation
} from "@apollo/client/react";

import { LOGIN_MUTATION }
  from "../graphql/queries/auth";
import {
  getAuthToken,
  setAuthToken
} from "../lib/authStorage";

type LoginMutationData = {
  login: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  };
};

type LoginLocationState = {
  from?: {
    pathname?: string;
  };
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const apolloClient = useApolloClient();
  const [email, setEmail] = useState(
    "admin@projectpulse.local"
  );
  const [password, setPassword] =
    useState("admin123");
  const [
    login,
    {
      loading,
      error
    }
  ] = useMutation<LoginMutationData>(
    LOGIN_MUTATION
  );

  const token = getAuthToken();
  const locationState =
    location.state as
      | LoginLocationState
      | null;
  const returnPath =
    locationState?.from?.pathname ?? "/";

  if (token) {
    return (
      <Navigate
        to={returnPath}
        replace
      />
    );
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const response = await login({
      variables: {
        email: email.trim(),
        password
      }
    });

    const authToken =
      response.data?.login.token;

    if (!authToken) {
      return;
    }

    setAuthToken(authToken);
    await apolloClient.resetStore();
    navigate(returnPath, {
      replace: true
    });
  };

  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-slate-100
        p-6
      "
    >
      <div
        className="
          w-full
          max-w-md
        "
      >
        <div
          className="
            mb-8
            text-center
          "
        >
          <h1
            className="
              text-3xl
              font-bold
              text-slate-900
            "
          >
            ProjectPulse
          </h1>

          <p
            className="
              mt-2
              text-sm
              text-slate-500
            "
          >
            Sign in to continue.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="
            rounded-xl
            border
            bg-white
            p-6
            shadow-sm
          "
        >
          <div className="space-y-4">
            <label className="block">
              <span
                className="
                  mb-1
                  block
                  text-sm
                  font-medium
                  text-slate-700
                "
              >
                Email
              </span>
              <input
                required
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                className="
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  px-3
                  py-2
                  outline-none
                  focus:border-slate-900
                "
              />
            </label>

            <label className="block">
              <span
                className="
                  mb-1
                  block
                  text-sm
                  font-medium
                  text-slate-700
                "
              >
                Password
              </span>
              <input
                required
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                className="
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  px-3
                  py-2
                  outline-none
                  focus:border-slate-900
                "
              />
            </label>
          </div>

          {error && (
            <p
              className="
                mt-4
                text-sm
                text-red-600
              "
            >
              Invalid email or password.
            </p>
          )}

          <button
            type="submit"
            disabled={
              loading ||
              !email.trim() ||
              !password
            }
            className="
              mt-6
              w-full
              rounded-lg
              bg-slate-900
              px-4
              py-2
              text-sm
              font-medium
              text-white
              transition
              hover:bg-slate-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading
              ? "Signing in..."
              : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
