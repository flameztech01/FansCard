import { useMemo, useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import { useGetGeneratedLinksQuery } from "../slices/adminApiSlice";

type FilterType = "all" | "active" | "inactive" | "expired";

const isExpired = (expiresAt?: string | null) => {
  if (!expiresAt) return false;
  const t = new Date(expiresAt).getTime();
  if (Number.isNaN(t)) return false;
  return t <= Date.now();
};

const formatDate = (d?: string | null) => {
  if (!d) return "No expiry";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "Invalid date";
  return dt.toLocaleString();
};

const GeneratedLinks = () => {
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  // ✅ If your backend supports query params, you can pass them here.
  // For now we fetch all then filter client-side (works immediately).
  const { data, isLoading, isError, error, refetch } =
    useGetGeneratedLinksQuery(undefined);

  const links = useMemo(() => {
    const list = Array.isArray(data) ? data : [];

    // Search
    const searched = search.trim()
      ? list.filter((l: any) =>
          (l.celebName || "").toLowerCase().includes(search.trim().toLowerCase())
        )
      : list;

    // Filter
    if (filter === "all") return searched;

    if (filter === "expired") {
      return searched.filter((l: any) => isExpired(l.expiresAt));
    }

    if (filter === "active") {
      return searched.filter(
        (l: any) => l.isActive === true && !isExpired(l.expiresAt)
      );
    }

    // inactive
    return searched.filter((l: any) => l.isActive === false);
  }, [data, filter, search]);

  const counts = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const all = list.length;
    const expired = list.filter((l: any) => isExpired(l.expiresAt)).length;
    const active = list.filter(
      (l: any) => l.isActive === true && !isExpired(l.expiresAt)
    ).length;
    const inactive = list.filter((l: any) => l.isActive === false).length;

    return { all, active, inactive, expired };
  }, [data]);

  const errorMsg =
    (error as any)?.data?.message ||
    (error as any)?.error ||
    "Failed to load generated links";

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AdminNavbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Generated Links</h1>
            <p className="text-sm text-gray-400 mt-1">
              View and filter celeb signup links you’ve created.
            </p>
          </div>

          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm font-semibold transition w-full sm:w-auto"
          >
            Refresh
          </button>
        </div>

        {/* Controls */}
        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-2">
                Search (by celeb name)
              </label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            {/* Filter */}
            <div className="md:w-64">
              <label className="block text-xs text-gray-400 mb-2">Filter</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="all">All ({counts.all})</option>
                <option value="active">Active ({counts.active})</option>
                <option value="inactive">Inactive ({counts.inactive})</option>
                <option value="expired">Expired ({counts.expired})</option>
              </select>
            </div>
          </div>

          {/* Summary chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-gray-800 text-gray-200">
              All: {counts.all}
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-green-900/40 text-green-200 border border-green-700/40">
              Active: {counts.active}
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-yellow-900/40 text-yellow-200 border border-yellow-700/40">
              Inactive: {counts.inactive}
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-red-900/40 text-red-200 border border-red-700/40">
              Expired: {counts.expired}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
          {isLoading && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <p className="text-gray-300 text-sm">Loading links...</p>
            </div>
          )}

          {isError && !isLoading && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-6">
              <p className="text-sm">{errorMsg}</p>
            </div>
          )}

          {!isLoading && !isError && links.length === 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
              <p className="text-gray-300 font-semibold">No links found</p>
              <p className="text-gray-500 text-sm mt-2">
                Try changing the filter or search, or generate a new link.
              </p>
            </div>
          )}

          {!isLoading && !isError && links.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-950/60 border-b border-gray-800">
                    <tr>
                      <th className="text-left font-semibold text-gray-300 px-5 py-4">
                        Celebrity
                      </th>
                      <th className="text-left font-semibold text-gray-300 px-5 py-4">
                        Status
                      </th>
                      <th className="text-left font-semibold text-gray-300 px-5 py-4">
                        Expires
                      </th>
                      <th className="text-left font-semibold text-gray-300 px-5 py-4">
                        Created
                      </th>
                      <th className="text-right font-semibold text-gray-300 px-5 py-4">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {links.map((l: any) => {
                      const expired = isExpired(l.expiresAt);
                      const active = l.isActive === true && !expired;
                      const inactive = l.isActive === false;

                      let statusLabel = "Unknown";
                      let statusClass =
                        "bg-gray-800 text-gray-200 border border-gray-700";

                      if (expired) {
                        statusLabel = "Expired";
                        statusClass =
                          "bg-red-900/30 text-red-200 border border-red-700/40";
                      } else if (active) {
                        statusLabel = "Active";
                        statusClass =
                          "bg-green-900/30 text-green-200 border border-green-700/40";
                      } else if (inactive) {
                        statusLabel = "Inactive";
                        statusClass =
                          "bg-yellow-900/30 text-yellow-200 border border-yellow-700/40";
                      }

                      return (
                        <tr
                          key={l._id}
                          className="border-b border-gray-800 hover:bg-gray-950/30 transition"
                        >
                          <td className="px-5 py-4">
                            <div className="font-semibold text-white">
                              {l.celebName || "—"}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {l._id}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}
                            >
                              {statusLabel}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-gray-300">
                            {formatDate(l.expiresAt)}
                          </td>

                          <td className="px-5 py-4 text-gray-300">
                            {formatDate(l.createdAt)}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={async () => {
                                  // Best effort: if backend returns signupLink in list later, use it
                                  // Otherwise you can’t reconstruct (token not stored), so copy disabled.
                                  if (!l.signupLink) return;
                                  await navigator.clipboard.writeText(
                                    l.signupLink
                                  );
                                }}
                                disabled={!l.signupLink}
                                className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                                  l.signupLink
                                    ? "bg-gray-800 hover:bg-gray-700 text-white"
                                    : "bg-gray-900 text-gray-600 cursor-not-allowed border border-gray-800"
                                }`}
                                title={
                                  l.signupLink
                                    ? "Copy signup link"
                                    : "signupLink not returned by backend list"
                                }
                              >
                                Copy Link
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-4 text-xs text-gray-500">
                Note: if you want “Copy Link” to work here, the backend must
                return the raw token again (not recommended). Better approach:
                store the full signupLink string in DB when creating it.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneratedLinks;