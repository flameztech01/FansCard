import { useMemo, useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import { useGenerateLinkMutation } from "../slices/adminApiSlice";

const GenerateLink = () => {
  const [celebName, setCelebName] = useState("");
  const [expiresInDays, setExpiresInDays] = useState<string>("");

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
    return celebName.trim().length >= 2 && !isLoading;
  }, [celebName, isLoading]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setCopied(false);
    setResult(null);

    const payload: any = { celebName: celebName.trim() };

    // optional
    if (expiresInDays.trim() !== "") {
      const n = Number(expiresInDays);
      if (Number.isNaN(n) || n <= 0) {
        setErrorMsg("expiresInDays must be a valid number greater than 0");
        return;
      }
      payload.expiresInDays = n;
    }

    try {
      const res: any = await generateLink(payload).unwrap();
      setResult(res);
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.error ||
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sm:p-8">
          <h1 className="text-2xl font-bold">Generate Celeb Signup Link</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Enter a celebrity name and generate a unique signup link. Anyone who
            signs up through the link will have <span className="text-gray-200">celebName</span>{" "}
            saved in their profile automatically.
          </p>

          <form onSubmit={handleGenerate} className="mt-6 space-y-4">
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
                Expires In (Days) <span className="text-gray-500">(optional)</span>
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

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-4 py-3 text-sm">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-semibold transition
                ${
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
                    {result.expiresAt ? new Date(result.expiresAt).toLocaleString() : "No expiry"}
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
                  Share this link. When a user signs up via this link, their profile will store the celebrity name.
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