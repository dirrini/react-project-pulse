import {
  useState,
  type FormEvent
} from "react";

import type { Product }
  from "../../types/Project";

export type ProductFormValues = {
  status: string;
  vendor: string;
  materialCode: string;
  quantity: number;
  materialDescription: string;
  deliveryDate: string;
};

interface ProductDialogProps {
  title: string;
  saving: boolean;
  errorMessage?: string;
  product?: Product | null;
  onClose: () => void;
  onSave: (
    values: ProductFormValues
  ) => Promise<void>;
}

const emptyProductForm: ProductFormValues = {
  status: "",
  vendor: "",
  materialCode: "",
  quantity: 1,
  materialDescription: "",
  deliveryDate: ""
};

function getInitialValues(
  product?: Product | null
): ProductFormValues {
  if (!product) {
    return emptyProductForm;
  }

  return {
    status: product.status,
    vendor: product.vendor,
    materialCode: product.materialCode,
    quantity: product.quantity,
    materialDescription:
      product.materialDescription,
    deliveryDate: product.deliveryDate
  };
}

export default function ProductDialog({
  title,
  saving,
  errorMessage,
  product,
  onClose,
  onSave
}: ProductDialogProps) {
  const [form, setForm] =
    useState<ProductFormValues>(() =>
      getInitialValues(product)
    );

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    await onSave({
      ...form,
      status: form.status.trim(),
      vendor: form.vendor.trim(),
      materialCode:
        form.materialCode.trim(),
      quantity: Number(form.quantity),
      materialDescription:
        form.materialDescription.trim()
    });
  };

  const isInvalid =
    !form.status.trim() ||
    !form.vendor.trim() ||
    !form.materialCode.trim() ||
    !form.materialDescription.trim() ||
    !form.deliveryDate ||
    Number(form.quantity) <= 0;

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
          max-h-[90vh]
          w-full
          max-w-3xl
          overflow-y-auto
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
            {title}
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
              SAP external code
            </span>
            <input
              disabled
              value={
                product?.externalCode ??
                "Assigned by SAP"
              }
              className="
                w-full
                rounded-lg
                border
                border-slate-200
                bg-slate-50
                px-3
                py-2
                text-slate-500
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
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Status
              </span>
              <input
                required
                value={form.status}
                onChange={(event) =>
                  setForm({
                    ...form,
                    status:
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
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Vendor
              </span>
              <input
                required
                value={form.vendor}
                onChange={(event) =>
                  setForm({
                    ...form,
                    vendor:
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
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Material code
              </span>
              <input
                required
                value={form.materialCode}
                onChange={(event) =>
                  setForm({
                    ...form,
                    materialCode:
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
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Quantity
              </span>
              <input
                required
                type="number"
                min={0.01}
                step="any"
                value={form.quantity}
                onChange={(event) =>
                  setForm({
                    ...form,
                    quantity:
                      Number(
                        event.target.value
                      )
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
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Material description
            </span>
            <textarea
              required
              rows={4}
              value={form.materialDescription}
              onChange={(event) =>
                setForm({
                  ...form,
                  materialDescription:
                    event.target.value
                })
              }
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
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Delivery date
            </span>
            <input
              required
              type="date"
              value={form.deliveryDate}
              onChange={(event) =>
                setForm({
                  ...form,
                  deliveryDate:
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
              disabled={saving || isInvalid}
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
              {saving
                ? "Saving..."
                : "Save product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
