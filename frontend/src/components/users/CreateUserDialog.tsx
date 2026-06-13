import {
  useState,
  type FormEvent
} from "react";

import type { UserRole }
  from "../../types/User";

export type CreateUserFormValues = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

interface CreateUserDialogProps {
  creating: boolean;
  errorMessage?: string;
  onClose: () => void;
  onCreate: (
    values: CreateUserFormValues
  ) => Promise<void>;
}

const initialForm: CreateUserFormValues = {
  name: "",
  email: "",
  password: "",
  role: "MEMBER"
};

export default function CreateUserDialog({
  creating,
  errorMessage,
  onClose,
  onCreate
}: CreateUserDialogProps) {
  const [form, setForm] =
    useState<CreateUserFormValues>(
      initialForm
    );

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    await onCreate({
      ...form,
      name: form.name.trim(),
      email: form.email
        .trim()
        .toLowerCase()
    });
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-slate-950/40
        p-4
      "
    >
      <div
        className="
          w-full
          max-w-lg
          rounded-xl
          bg-white
          p-6
          shadow-xl
        "
      >
        <div
          className="
            mb-5
            flex
            items-center
            justify-between
          "
        >
          <h3 className="text-xl font-semibold">
            New user
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-lg
              px-3
              py-1
              text-sm
              text-slate-500
              hover:bg-slate-100
            "
          >
            Close
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
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
              Name
            </span>
            <input
              required
              value={form.name}
              onChange={(event) =>
                setForm({
                  ...form,
                  name: event.target.value
                })
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
              Email
            </span>
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({
                  ...form,
                  email: event.target.value
                })
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

          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
            "
          >
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
                minLength={6}
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm({
                    ...form,
                    password:
                      event.target.value
                  })
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
                Role
              </span>
              <select
                value={form.role}
                onChange={(event) =>
                  setForm({
                    ...form,
                    role:
                      event.target
                        .value as UserRole
                  })
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
              >
                <option value="MEMBER">
                  Member
                </option>
                <option value="ADMIN">
                  Admin
                </option>
              </select>
            </label>
          </div>

          {errorMessage && (
            <p className="text-sm text-red-600">
              {errorMessage}
            </p>
          )}

          <div
            className="
              flex
              justify-end
              gap-3
              pt-2
            "
          >
            <button
              type="button"
              onClick={onClose}
              className="
                rounded-lg
                border
                px-4
                py-2
                text-sm
                hover:bg-slate-100
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                creating ||
                !form.name.trim() ||
                !form.email.trim() ||
                form.password.length < 6
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
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {creating
                ? "Creating..."
                : "Create user"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
