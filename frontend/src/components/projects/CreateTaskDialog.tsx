import {
  useState,
  type FormEvent
} from "react";

import type { TaskStatus }
  from "../../types/Project";

export type CreateTaskFormValues = {
  title: string;
  description: string;
  status: TaskStatus;
};

interface CreateTaskDialogProps {
  creating: boolean;
  errorMessage?: string;
  onClose: () => void;
  onCreate: (
    values: CreateTaskFormValues
  ) => Promise<void>;
}

const initialTaskForm: CreateTaskFormValues = {
  title: "",
  description: "",
  status: "TODO"
};

export default function CreateTaskDialog({
  creating,
  errorMessage,
  onClose,
  onCreate
}: CreateTaskDialogProps) {
  const [taskForm, setTaskForm] =
    useState<CreateTaskFormValues>(
      initialTaskForm
    );

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    await onCreate({
      ...taskForm,
      title: taskForm.title.trim(),
      description:
        taskForm.description.trim()
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
            New task
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
              Title
            </span>
            <input
              required
              value={taskForm.title}
              onChange={(event) =>
                setTaskForm({
                  ...taskForm,
                  title: event.target.value
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
              Description
            </span>
            <textarea
              value={taskForm.description}
              onChange={(event) =>
                setTaskForm({
                  ...taskForm,
                  description:
                    event.target.value
                })
              }
              rows={4}
              className="
                w-full
                resize-none
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
              Status
            </span>
            <select
              value={taskForm.status}
              onChange={(event) =>
                setTaskForm({
                  ...taskForm,
                  status:
                    event.target.value as TaskStatus
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
              <option value="TODO">
                To do
              </option>
              <option value="IN_PROGRESS">
                In progress
              </option>
              <option value="DONE">
                Done
              </option>
            </select>
          </label>

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
                !taskForm.title.trim()
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
                : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
