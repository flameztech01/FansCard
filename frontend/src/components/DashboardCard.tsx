// DashboardCard.tsx
import React, { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  // ShoppingBag,
  AlertCircle,
  CheckCircle,
  // Clock,
  Download,
  Printer,
  Info,
  Shield,
  // Calendar,
  // Hash,
  // User,
  Mail,
  Phone,
  CreditCard,
  Star,
  Zap,
  Crown,
  MapPin,
  Globe,
  Award,
} from "lucide-react";
import { useGetUserInfoQuery } from "../slices/userApiSlice";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

interface PackageDetails {
  name: string;
  bgGradientCss: string; // keep hex/rgb gradients
  badgeBg: string;
  icon: React.ReactNode;
  features: string[];
}

const packageDetails: Record<string, PackageDetails> = {
  basic: {
    name: "Basic",
    bgGradientCss: "linear-gradient(135deg, #374151 0%, #111827 100%)",
    badgeBg: "#4B5563",
    icon: <Star className="h-3 w-3" />,
    features: ["Digital Card", "Basic Benefits", "Newsletter"],
  },
  standard: {
    name: "Standard",
    bgGradientCss: "linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%)",
    badgeBg: "#2563EB",
    icon: <Zap className="h-3 w-3" />,
    features: ["Digital Card", "Standard Benefits", "Event Access", "10% Discount"],
  },
  premium: {
    name: "Premium",
    bgGradientCss: "linear-gradient(135deg, #7E22CE 0%, #831843 100%)",
    badgeBg: "#9333EA",
    icon: <Crown className="h-3 w-3" />,
    features: ["Digital Card", "Premium Benefits", "VIP Access", "Merch Discount", "Meet & Greet"],
  },
};

// ID-1 size (credit card)
const ID_CARD_MM = { w: 85.6, h: 54 };

// helpers
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const waitForFonts = async () => {

  if (document.fonts?.ready) await document.fonts.ready;
  else await sleep(250);
};

const waitForImages = async (root: HTMLElement) => {
  const imgs = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    imgs.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const done = () => resolve();
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      });
    })
  );
};

const DashboardCard = () => {
  const { data: userInfo, isLoading, error, refetch } = useGetUserInfoQuery({});
  const cardRef = useRef<HTMLDivElement>(null);

  const googlePicture = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo") || "null")?.picture as string | undefined;
    } catch {
      return undefined;
    }
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getExpiryDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    date.setFullYear(date.getFullYear() + 2);
    return date.toLocaleDateString("en-US", { month: "2-digit", year: "2-digit" });
  };

  const formatCardId = (cardId?: string) => {
    if (!cardId) return "—";
    const clean = cardId.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    const matches = clean.match(/.{1,4}/g);
    return matches ? matches.join("-") : cardId;
  };

  const getInitials = (name: string) =>
    name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  /**
   * ✅ Modern capture using html-to-image (toPng)
   * - More compatible than html2canvas
   */
  const captureCardPng = async () => {
    if (!cardRef.current) return null;

    const el = cardRef.current;

    await waitForFonts();
    await waitForImages(el);

    // toPng returns data URL
    // NOTE: if you use external images, keep useCORS true + correct CORS headers
    const dataUrl = await toPng(el, {
      cacheBust: true,
      pixelRatio: 4,
      backgroundColor: "#ffffff",
      // prevent random emoji/font fallback differences
      style: {
        transform: "none",
      },
      // Optional: skip elements you don't want
      filter: () => {
        // keep everything inside the card
        return true;
      },
    });

    return dataUrl;
  };

  /**
   * ✅ Download: put PNG into exact ID-1 PDF
   */
  const handleDownloadCard = async () => {
    if (!userInfo?.cardId) return;

    try {
      const imgData = await captureCardPng();
      if (!imgData) return;

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [ID_CARD_MM.w, ID_CARD_MM.h],
        compress: true,
      });

      pdf.addImage(imgData, "PNG", 0, 0, ID_CARD_MM.w, ID_CARD_MM.h);

      const safeId = String(userInfo.cardId).replace(/[^a-zA-Z0-9-_]/g, "");
      pdf.save(`fancard-${safeId || "card"}.pdf`);
    } catch (e) {
      console.error("Download card failed:", e);
      alert("Failed to download card. Try again.");
    }
  };

  /**
   * ✅ Print: best quality is printing the HTML directly (NO canvas)
   * This keeps gradients/text sharp, and avoids any CSS parsing library.
   */
  const handlePrintCard = () => {
    if (!cardRef.current) return;

    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
    if (!printWindow) {
      alert("Popup blocked. Allow popups to print the card.");
      return;
    }

    const title = `Fan Card - ${userInfo?.name || "Card"}`;

    // clone card HTML only
    const cardHTML = cardRef.current.outerHTML;

    // IMPORTANT:
    // - Include Tailwind in print window (so the same classes render)
    // - Also add @page size to ID card size
    // - Hide everything except the card
    printWindow.document.open();
    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${title}</title>

          <!-- Tailwind CDN (works for print window) -->
          <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>

          <style>
            @page { size: ${ID_CARD_MM.w}mm ${ID_CARD_MM.h}mm; margin: 0; }
            html, body { margin: 0; padding: 0; background: #fff; }
            body {
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
            }
            /* Force exact physical size */
            .print-card {
              width: ${ID_CARD_MM.w}mm !important;
              height: ${ID_CARD_MM.h}mm !important;
            }
          </style>
        </head>
        <body>
          <div class="print-card">
            ${cardHTML}
          </div>

          <script>
            window.onload = function () {
              setTimeout(function () {
                window.focus();
                window.print();
                window.onafterprint = function () { window.close(); };
              }, 200);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // ---------------- UI states ----------------
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-12 w-12" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !userInfo) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="text-center py-4">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Not Signed In</h3>
          <p className="text-gray-500 mb-4">Please sign in to view your dashboard</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // ✅ only showing approved part here since that’s where the card is
  if (userInfo.status === "approved") {
    const pkg = packageDetails[userInfo.packageType || "basic"] || packageDetails.basic;

    if (!userInfo.cardId) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900">Approved ✅</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Your payment has been approved, but your card number is still being issued.
                  Click refresh in a moment.
                </p>
              </div>
            </div>

            <button
              onClick={() => refetch()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 no-print">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              {googlePicture ? (
                <img
                  src={googlePicture}
                  alt={userInfo.name}
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  className="h-14 w-14 rounded-full border-2 border-blue-500"
                />
              ) : (
                <div className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                  {getInitials(userInfo.name)}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Welcome back, {userInfo.name?.split(" ")[0]}! 👋
                </h2>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                  <span className="flex items-center text-sm text-gray-500">
                    <Mail className="h-3 w-3 mr-1" /> {userInfo.email}
                  </span>
                  <span className="flex items-center text-sm text-gray-500">
                    <Phone className="h-3 w-3 mr-1" /> {userInfo.phone || "No phone"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleDownloadCard}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download ID Card
              </button>
              <button
                onClick={handlePrintCard}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print ID Card
              </button>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="flex justify-center">
          <div
            ref={cardRef}
            className="relative w-[85.6mm] h-[54mm] overflow-hidden rounded-xl shadow-2xl print:shadow-none border-2 border-gray-300 font-sans"
            style={{ background: pkg.bgGradientCss }}
          >
            {/* Pattern */}
            <div
              className="absolute inset-0"
              style={{
                opacity: 0.06,
                backgroundImage:
                  "repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.22) 8px, rgba(255,255,255,0.22) 16px)",
              }}
            />

            {/* Top Accent */}
            <div
              className="absolute top-0 left-0 right-0"
              style={{
                height: "4px",
                background: "linear-gradient(90deg, #FACC15, #FFFFFF, #FACC15)",
              }}
            />

            {/* Content */}
            <div className="relative z-10 p-3 h-full flex flex-col text-white">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-white" />
                  <div>
                    <span className="text-sm font-black tracking-[0.2em]">FANCARD</span>
                    <div className="flex items-center space-x-1 mt-0.5">
                      {pkg.icon}
                      <span
                        className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: pkg.badgeBg, opacity: 0.95 }}
                      >
                        <span className="inline-flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          {pkg.name} ELITE
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {googlePicture ? (
                  <div
                    className="h-14 w-14 rounded-full overflow-hidden shadow-lg"
                    style={{ border: "2px solid rgba(255,255,255,0.9)", background: "#fff" }}
                  >
                    <img
                      src={googlePicture}
                      alt={userInfo.name}
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="h-14 w-14 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg"
                    style={{
                      border: "2px solid rgba(255,255,255,0.9)",
                      background: "rgba(255,255,255,0.18)",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    {getInitials(userInfo.name)}
                  </div>
                )}
              </div>

              <div className="mt-1">
                <p className="text-[8px] tracking-wider" style={{ color: "rgba(255,255,255,0.6)" }}>
                  CARD HOLDER
                </p>
                <div className="flex items-baseline justify-between">
                  <p className="text-sm font-black tracking-wide">{String(userInfo.name).toUpperCase()}</p>
                  <span
                    className="text-[6px] px-1 py-0.5 rounded"
                    style={{ background: "rgba(255,255,255,0.2)" }}
                  >
                    LIFETIME
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1 text-[8px]">
                <div className="rounded p-1" style={{ background: "rgba(255,255,255,0.10)" }}>
                  <p className="text-[6px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                    MEMBER ID
                  </p>
                  <p className="font-mono font-bold truncate">{formatCardId(userInfo.cardId)}</p>
                </div>
                <div className="rounded p-1" style={{ background: "rgba(255,255,255,0.10)" }}>
                  <p className="text-[6px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                    ISSUE DATE
                  </p>
                  <p className="font-bold">{formatDate(userInfo.createdAt)}</p>
                </div>
                <div className="rounded p-1" style={{ background: "rgba(255,255,255,0.10)" }}>
                  <p className="text-[6px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                    EXPIRY
                  </p>
                  <p className="font-bold">{getExpiryDate(userInfo.createdAt)}</p>
                </div>
                <div className="rounded p-1" style={{ background: "rgba(255,255,255,0.10)" }}>
                  <p className="text-[6px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                    TIER
                  </p>
                  <p className="font-bold">{pkg.name}</p>
                </div>
              </div>

              <div className="mt-auto pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.20)" }}>
                <div className="flex justify-between items-center text-[5px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-2 w-2" />
                    <span>fancard.com/verify</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-2 w-2" />
                    <span>{String(userInfo.email).split("@")[1] || "global"}</span>
                  </div>
                </div>
              </div>

              <div className="absolute left-1 bottom-6" style={{ opacity: 0.2 }}>
                <CreditCard className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4 no-print">
          {pkg.features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg p-3 border border-gray-100 flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // keep your other status blocks (pending_payment, pending_verification, rejected) as-is
  return null;
};

export default DashboardCard;