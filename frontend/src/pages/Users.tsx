import { useState } from "react";
import {
  useMutation,
  useQuery
} from "@apollo/client/react";

import CreateUserDialog, {
  type CreateUserFormValues
} from "../components/users/CreateUserDialog";
import {
  CREATE_USER_MUTATION,
  USERS_QUERY
} from "../graphql/queries/auth";

import type { User } from "../types/User";

type UsersQueryData = {
  users: User[];
};

export default function Users() {
  const [isCreateOpen, setIsCreateOpen] =
    useState(false);
  const {
    data,
    loading,
    error
  } = useQuery<UsersQueryData>(
    USERS_QUERY,
    {
      fetchPolicy: "cache-and-network"
    }
  );
  const [
    createUser,
    {
      loading: creating,
      error: createError
    }
  ] = useMutation(
    CREATE_USER_MUTATION,
    {
      refetchQueries: [
        { query: USERS_QUERY }
      ]
    }
  );

  const handleCreateUser = async (
    values: CreateUserFormValues
  ) => {
    await createUser({
      variables: {
        input: values
      }
    });

    setIsCreateOpen(false);
  };

  const users = data?.users ?? [];

  return (
    <div>
      <div
        className="
          mb-6
          flex
          items-center
          justify-between
        "
      >
        <div>
          <h2
            className="
              text-3xl
              font-bold
            "
          >
            Users
          </h2>

          <p
            className="
              mt-2
              text-slate-500
            "
          >
            Manage who can access ProjectPulse.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setIsCreateOpen(true)
          }
          className="
            rounded-lg
            bg-slate-900
            px-4
            py-2
            text-sm
            font-medium
            text-white
            transition
            hover:bg-slate-700
          "
        >
          New user
        </button>
      </div>

      {loading && (
        <p>Loading users...</p>
      )}

      {error && (
        <div
          className="
            rounded-xl
            border
            bg-white
            p-10
            text-center
            text-slate-500
          "
        >
          You do not have access to manage users.
        </div>
      )}

      {!loading && !error && (
        <div
          className="
            overflow-hidden
            rounded-xl
            border
            bg-white
            shadow-sm
          "
        >
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th
                  className="
                    px-5
                    py-3
                    text-left
                    text-sm
                    font-semibold
                    text-slate-600
                  "
                >
                  Name
                </th>
                <th
                  className="
                    px-5
                    py-3
                    text-left
                    text-sm
                    font-semibold
                    text-slate-600
                  "
                >
                  Email
                </th>
                <th
                  className="
                    px-5
                    py-3
                    text-left
                    text-sm
                    font-semibold
                    text-slate-600
                  "
                >
                  Role
                </th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t"
                >
                  <td
                    className="
                      px-5
                      py-4
                      text-sm
                      font-medium
                      text-slate-900
                    "
                  >
                    {user.name}
                  </td>
                  <td
                    className="
                      px-5
                      py-4
                      text-sm
                      text-slate-600
                    "
                  >
                    {user.email}
                  </td>
                  <td className="px-5 py-4">
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
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div
              className="
                border-t
                p-10
                text-center
                text-slate-500
              "
            >
              No users found.
            </div>
          )}
        </div>
      )}

      {isCreateOpen && (
        <CreateUserDialog
          creating={creating}
          errorMessage={
            createError
              ? "Could not create user."
              : undefined
          }
          onClose={() =>
            setIsCreateOpen(false)
          }
          onCreate={handleCreateUser}
        />
      )}
    </div>
  );
}
