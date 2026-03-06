import { useMemo, useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import { useGenerateLinkMutation } from "../slices/adminApiSlice";

type PaymentDetail = {
  key: string;
  value: string;
};

type PaymentMethod = {
  methodId: string;
  type: string;
  label: string;
  details: PaymentDetail[];
};

const createEmptyPaymentMethod = (): PaymentMethod => ({
  methodId: `pm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  type: "",
  label: "",
  details: [{ key: "", value: "" }],
});

const GenerateLink = () => {
  const [celebName, setCelebName] = useState("");
  const [expiresInDays, setExpiresInDays] = useState<string>("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    createEmptyPaymentMethod(),
  ]);

  const [generateLink, { isLoading }] = useGenerateLinkMutation();

  const [result, setResult] = useState<{
    celebName?: string;
    signupLink?: string;
    expiresAt?: string | null;
    message?: string;
  } | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const canSubmit = useMemo(() => {
    if (isLoading) return false;
    if (celebName.trim().length < 2) return false;
    if (paymentMethods.length < 1) return false;

    for (const method of paymentMethods) {
      if (!method.type.trim() || !method.label.trim()) return false;

      const validDetails = method.details.filter(
        (detail) => detail.key.trim() && detail.value.trim()
      );

      if (validDetails.length < 1) return false;
    }

    return true;
  }, [celebName, isLoading, paymentMethods]);

  const updatePaymentMethod = (
    index: number,
    field: keyof Omit<PaymentMethod, "details">,
    value: string
  ) => {
    setPaymentMethods((prev) =>
      prev.map((method, i) =>
        i === index ? { ...method, [field]: value } : method
      )
    );
  };

  const updatePaymentDetail = (
    methodIndex: number,
    detailIndex: number,
    field: keyof PaymentDetail,
    value: string
  ) => {
    setPaymentMethods((prev) =>
      prev.map((method, i) => {
        if (i !== methodIndex) return method;

        const nextDetails = method.details.map((detail, dIndex) =>
          dIndex === detailIndex ? { ...detail, [field]: value } : detail
        );

        return { ...method, details: nextDetails };
      })
    );
  };

  const addPaymentMethod = () => {
    setPaymentMethods((prev) => [...prev, createEmptyPaymentMethod()]);
  };

  const removePaymentMethod = (index: number) => {
    setPaymentMethods((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const addPaymentDetail = (methodIndex: number) => {
    setPaymentMethods((prev) =>
      prev.map((method, i) =>
        i === methodIndex
          ? {
              ...method,
              details: [...method.details, { key: "", value: "" }],
            }
          : method
      )
    );
  };

  const removePaymentDetail = (methodIndex: number, detailIndex: number) => {
    setPaymentMethods((prev) =>
      prev.map((method, i) => {
        if (i !== methodIndex) return method;
        if (method.details.length === 1) return method;

        return {
          ...method,
          details: method.details.filter((_, dIndex) => dIndex !== detailIndex),
        };
      })
    );
  };

  const buildPayload = () => {
    const payload: any = {
      celebName: celebName.trim(),
      paymentMethods: paymentMethods.map((method) => {
        const detailsObject = method.details.reduce<Record<string, string>>(
          (acc, detail) => {
            const cleanKey = detail.key.trim();
            const cleanValue = detail.value.trim();

            if (cleanKey && cleanValue) {
              acc[cleanKey] = cleanValue;
            }

            return acc;
          },
          {}
        );

        return {
          methodId: method.methodId,
          type: method.type.trim().toLowerCase(),
          label: method.label.trim(),
          details: detailsObject,
        };
      }),
    };

    if (expiresInDays.trim() !== "") {
      const n = Number(expiresInDays);
      if (Number.isNaN(n) || n <= 0) {
        throw new Error("expiresInDays must be a valid number greater than 0");
      }
      payload.expiresInDays = n;
    }

    return payload;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setCopied(false);
    setResult(null);

    try {
      const payload = buildPayload();

      for (let i = 0; i < payload.paymentMethods.length; i++) {
        const method = payload.paymentMethods[i];

        if (!method.type) {
          setErrorMsg(`Payment method ${i + 1}: type is required`);
          return;
        }

        if (!method.label) {
          setErrorMsg(`Payment method ${i + 1}: label is required`);
          return;
        }

        if (!Object.keys(method.details).length) {
          setErrorMsg(`Payment method ${i + 1}: add at least one detail`);
          return;
        }
      }

      const res: any = await generateLink(payload).unwrap();
      setResult(res);
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.error ||
        err?.message ||
        "Failed to generate link. Please try again.";
      setErrorMsg(msg);
    }
  };

  const handleCopy = async () => {
    if (!result?.signupLink) return;

    try {
      await navigator.clipboard.writeText(result.signupLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setErrorMsg("Copy failed. Please copy manually.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AdminNavbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sm:p-8">
          <h1 className="text-2xl font-bold">Generate Celeb Signup Link</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Enter a celebrity name, add one or more payment methods, and
            generate a unique signup link. Anyone who signs up through the link
            will have the celeb name and payment details saved automatically.
          </p>

          <form onSubmit={handleGenerate} className="mt-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Celebrity Name
              </label>
              <input
                value={celebName}
                onChange={(e) => setCelebName(e.target.value)}
                placeholder="e.g. Davido"
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-2">
                Minimum 2 characters.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Expires In (Days){" "}
                <span className="text-gray-500">(optional)</span>
              </label>
              <input
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value)}
                placeholder="e.g. 30"
                inputMode="numeric"
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-2">
                Leave empty if you don’t want the link to expire.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-white">
                    Payment Methods
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Add one or more payment methods and their account/payment
                    details.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addPaymentMethod}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 transition"
                >
                  Add Payment Method
                </button>
              </div>

              {paymentMethods.map((method, methodIndex) => (
                <div
                  key={method.methodId}
                  className="border border-gray-800 rounded-xl p-4 sm:p-5 bg-gray-950 space-y-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-gray-200">
                      Payment Method {methodIndex + 1}
                    </h3>

                    {paymentMethods.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePaymentMethod(methodIndex)}
                        className="text-sm px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Payment Type
                      </label>
                      <input
                        value={method.type}
                        onChange={(e) =>
                          updatePaymentMethod(
                            methodIndex,
                            "type",
                            e.target.value
                          )
                        }
                        placeholder="e.g. bank_transfer, crypto, zelle, paypal"
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        System name. Example: zelle
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Payment Label
                      </label>
                      <input
                        value={method.label}
                        onChange={(e) =>
                          updatePaymentMethod(
                            methodIndex,
                            "label",
                            e.target.value
                          )
                        }
                        placeholder="e.g. Zelle Payment"
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        What admin/users should see.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-sm font-medium text-gray-300">
                        Payment / Account Details
                      </h4>

                      <button
                        type="button"
                        onClick={() => addPaymentDetail(methodIndex)}
                        className="px-3 py-2 rounded-lg text-sm font-semibold bg-gray-800 hover:bg-gray-700 transition"
                      >
                        Add Detail
                      </button>
                    </div>

                    {method.details.map((detail, detailIndex) => (
                      <div
                        key={`${method.methodId}_detail_${detailIndex}`}
                        className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3"
                      >
                        <input
                          value={detail.key}
                          onChange={(e) =>
                            updatePaymentDetail(
                              methodIndex,
                              detailIndex,
                              "key",
                              e.target.value
                            )
                          }
                          placeholder="Detail key e.g. accountNumber"
                          className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500"
                        />

                        <input
                          value={detail.value}
                          onChange={(e) =>
                            updatePaymentDetail(
                              methodIndex,
                              detailIndex,
                              "value",
                              e.target.value
                            )
                          }
                          placeholder="Detail value e.g. 1234567890"
                          className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removePaymentDetail(methodIndex, detailIndex)
                          }
                          disabled={method.details.length === 1}
                          className={`px-4 py-3 rounded-lg text-sm font-semibold transition ${
                            method.details.length === 1
                              ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                              : "bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20"
                          }`}
                        >
                          Remove
                        </button>
                      </div>
                    ))}

                    <p className="text-xs text-gray-500">
                      Examples: <span className="text-gray-400">accountNumber</span>,{" "}
                      <span className="text-gray-400">bankName</span>,{" "}
                      <span className="text-gray-400">walletAddress</span>,{" "}
                      <span className="text-gray-400">email</span>.
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-4 py-3 text-sm">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-semibold transition ${
                canSubmit
                  ? "bg-blue-600 hover:bg-blue-500 text-white"
                  : "bg-gray-800 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isLoading ? "Generating..." : "Generate Link"}
            </button>
          </form>

          {result?.signupLink && (
            <div className="mt-8 bg-gray-950 border border-gray-800 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-400">Celebrity</p>
                  <p className="text-lg font-semibold">{result.celebName}</p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-400">Expires</p>
                  <p className="text-sm text-gray-200">
                    {result.expiresAt
                      ? new Date(result.expiresAt).toLocaleString()
                      : "No expiry"}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2">Signup Link</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    readOnly
                    value={result.signupLink}
                    className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm text-gray-200"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-5 py-3 rounded-lg text-sm font-semibold bg-gray-800 hover:bg-gray-700 transition"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-3">
                  Share this link. When a user signs up via this link, their
                  profile will store the celebrity name and linked payment
                  methods automatically.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateLink;