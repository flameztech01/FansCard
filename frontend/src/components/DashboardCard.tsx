import React, { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Printer,
  Info,
  Shield,
  User,
  Mail,
  Phone,
  CreditCard,
  Star,
  Zap,
  Crown,
  MapPin,
  Globe,
  Award,
  Heart,
  Sparkles,
  ScanLine,
} from "lucide-react";
import { useGetUserInfoQuery } from "../slices/userApiSlice";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

interface PackageDetails {
  name: string;
  bgGradientCss: string;
  badgeBg: string;
  icon: React.ReactNode;
  features: string[];
}

const packageDetails: Record<string, PackageDetails> = {
  basic: {
    name: "Basic",
    bgGradientCss: "linear-gradient(135deg, #1F2937 0%, #111827 100%)",
    badgeBg: "#4B5563",
    icon: <Star className="h-3 w-3" />,
    features: ["Digital Card", "Basic Benefits", "Newsletter"],
  },
  standard: {
    name: "Standard",
    bgGradientCss:
      "linear-gradient(135deg, #0F172A 0%, #1D4ED8 55%, #1E3A8A 100%)",
    badgeBg: "#2563EB",
    icon: <Zap className="h-3 w-3" />,
    features: [
      "Digital Card",
      "Standard Benefits",
      "Event Access",
      "10% Discount",
    ],
  },
  premium: {
    name: "Premium",
    bgGradientCss:
      "linear-gradient(135deg, #111827 0%, #581C87 45%, #831843 100%)",
    badgeBg: "#9333EA",
    icon: <Crown className="h-3 w-3" />,
    features: [
      "Digital Card",
      "Premium Benefits",
      "VIP Access",
      "Merch Discount",
      "Meet & Greet",
    ],
  },
};

const CARD_W_MM = 85.6;
const CARD_H_MM = 54;
const CARD_GAP_MM = 8;
const MM_TO_PX = 3.7795275591;

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

const DashboardCard: React.FC = () => {
  const { data: userInfo, isLoading, error, refetch } = useGetUserInfoQuery({});
  const exportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);

  const googlePicture = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo") || "null")?.picture as
        | string
        | undefined;
    } catch {
      return undefined;
    }
  }, []);

  const celebName = (userInfo?.celebName || "").trim();
  const celebPicture = (userInfo?.celebPicture || "").trim();
  const profilePicture = (userInfo?.profilePicture || "").trim();
  const hasCelebPicture = Boolean(celebPicture);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

  const getDisplayUserPicture = () => profilePicture || googlePicture || "";

  const EXPORT_W_PX = Math.round(CARD_W_MM * MM_TO_PX);
  const EXPORT_H_PX = Math.round((CARD_H_MM * 2 + CARD_GAP_MM) * MM_TO_PX);

  const captureExportPng = async () => {
    if (!exportRef.current) return null;

    const el = exportRef.current;
    await waitForFonts();
    await waitForImages(el);

    return toPng(el, {
      cacheBust: true,
      pixelRatio: 3,
      backgroundColor: "#ffffff",
      width: EXPORT_W_PX,
      height: EXPORT_H_PX,
      canvasWidth: EXPORT_W_PX,
      canvasHeight: EXPORT_H_PX,
      style: {
        width: `${EXPORT_W_PX}px`,
        height: `${EXPORT_H_PX}px`,
        transform: "none",
        margin: "0",
        padding: "0",
      },
    });
  };

  const handleDownloadCard = async () => {
    if (!userInfo?.cardId || !exportRef.current) return;

    setDownloading(true);
    try {
      const imgData = await captureExportPng();
      if (!imgData) return;

      const pdfHeight = CARD_H_MM * 2 + CARD_GAP_MM;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [CARD_W_MM, pdfHeight],
        compress: true,
      });

      pdf.addImage(imgData, "PNG", 0, 0, CARD_W_MM, pdfHeight);

      const safeId = String(userInfo.cardId).replace(/[^a-zA-Z0-9-_]/g, "");
      pdf.save(`fancard-${safeId || "card"}.pdf`);
    } catch (e) {
      console.error("Download card failed:", e);
      alert("Failed to download card. Try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrintCard = async () => {
    if (!exportRef.current) return;

    setPrinting(true);
    try {
      await waitForFonts();
      await waitForImages(exportRef.current);

      const printWindow = window.open(
        "",
        "_blank",
        "noopener,noreferrer,width=1000,height=1400"
      );
      if (!printWindow) {
        alert("Popup blocked. Allow popups to print the card.");
        return;
      }

      const cardsHTML = exportRef.current.outerHTML;

      printWindow.document.open();
      printWindow.document.write(`
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Fan Card</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @page {
                size: ${CARD_W_MM}mm ${CARD_H_MM * 2 + CARD_GAP_MM}mm;
                margin: 0;
              }
              html, body {
                margin: 0;
                padding: 0;
                background: #ffffff;
              }
              body {
                display: flex;
                justify-content: center;
                align-items: flex-start;
              }
            </style>
          </head>
          <body>
            ${cardsHTML}
            <script>
              window.onload = function () {
                setTimeout(function () {
                  window.focus();
                  window.print();
                  window.onafterprint = function () { window.close(); };
                }, 300);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (e) {
      console.error("Print card failed:", e);
      alert("Failed to print card. Try again.");
    } finally {
      setPrinting(false);
    }
  };

  const CardShell = ({
    children,
    gradient,
  }: {
    children: React.ReactNode;
    gradient: string;
  }) => (
    <div
      className="relative overflow-hidden rounded-[18px] border border-white/20 font-sans shadow-2xl"
      style={{
        width: "85.6mm",
        height: "54mm",
        background: gradient,
        flexShrink: 0,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(255,255,255,0.22), transparent 28%), radial-gradient(circle at bottom right, rgba(255,255,255,0.12), transparent 30%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.22) 0 2px, transparent 2px 12px)",
        }}
      />
      <div
        className="absolute top-0 left-0 right-0 h-[4px]"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.2), #FACC15, rgba(255,255,255,0.9), #FACC15, rgba(255,255,255,0.2))",
        }}
      />
      <div
        className="absolute right-3 top-3 w-12 h-12 rounded-full blur-2xl opacity-30"
        style={{ background: "rgba(255,255,255,0.45)" }}
      />
      {children}
    </div>
  );

  const DetailBox = ({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) => (
    <div
      className="rounded-xl p-2"
      style={{
        background: "rgba(255,255,255,0.10)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(6px)",
      }}
    >
      <p className="text-[6px] tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.58)" }}>
        {label}
      </p>
      <div className="mt-1 text-[8px] font-semibold leading-tight">{value}</div>
    </div>
  );

  const packageType = userInfo?.packageType || "basic";
  const pkg = packageDetails[packageType] || packageDetails.basic;

  const frontGradient = hasCelebPicture
    ? "linear-gradient(135deg, #050816 0%, #13213d 30%, #4f46e5 62%, #7c3aed 100%)"
    : pkg.bgGradientCss;

  const backGradient =
    "linear-gradient(135deg, #030712 0%, #111827 35%, #1F2937 65%, #0B1120 100%)";

  const FrontCard = () => (
    <CardShell gradient={frontGradient}>
      <div className="relative z-10 h-full p-3 text-white flex flex-col">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              <Shield className="h-5 w-5" />
            </div>

            <div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-black tracking-[0.22em]">FANCARD</span>
                <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
              </div>

              <div className="flex items-center gap-1 mt-1">
                <span
                  className="text-[8px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                  style={{
                    background: "rgba(255,255,255,0.14)",
                    border: "1px solid rgba(255,255,255,0.18)",
                  }}
                >
                  {pkg.icon}
                  {pkg.name} ELITE
                </span>
              </div>
            </div>
          </div>

          <div
            className="px-2 py-1 rounded-full text-[7px] font-bold tracking-[0.18em]"
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            LIFETIME
          </div>
        </div>

        {!hasCelebPicture ? (
          <>
            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="text-[7px] tracking-[0.22em]" style={{ color: "rgba(255,255,255,0.58)" }}>
                  CARD HOLDER
                </p>

                <p className="text-[15px] font-black tracking-[0.08em] mt-1 leading-tight">
                  {String(userInfo?.name || "").toUpperCase()}
                </p>

                <div
                  className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-1"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.16)",
                  }}
                >
                  <Heart className="h-3 w-3 text-pink-300" />
                  <span className="text-[7px] font-semibold tracking-[0.14em]">
                    FAN OF {celebName ? celebName.toUpperCase() : "—"}
                  </span>
                </div>
              </div>

              {getDisplayUserPicture() ? (
                <div
                  className="h-[70px] w-[70px] rounded-2xl overflow-hidden shadow-2xl"
                  style={{
                    border: "2px solid rgba(255,255,255,0.92)",
                    background: "#fff",
                  }}
                >
                  <img
                    src={getDisplayUserPicture()}
                    alt={userInfo?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className="h-[70px] w-[70px] rounded-2xl flex items-center justify-center text-2xl font-bold shadow-2xl"
                  style={{
                    border: "2px solid rgba(255,255,255,0.92)",
                    background: "rgba(255,255,255,0.16)",
                  }}
                >
                  {getInitials(userInfo?.name || "F")}
                </div>
              )}
            </div>

            <div className="mt-auto grid grid-cols-2 gap-2">
              <DetailBox
                label="MEMBER ID"
                value={<span className="font-mono">{formatCardId(userInfo?.cardId)}</span>}
              />
              <DetailBox label="TIER" value={pkg.name} />
            </div>
          </>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-2 gap-3 flex-1">
              <div
                className="rounded-2xl p-3 flex flex-col items-center justify-center text-center"
                style={{
                  background: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <p className="text-[7px] tracking-[0.22em] mb-2" style={{ color: "rgba(255,255,255,0.60)" }}>
                  CELEBRITY
                </p>

                <div
                  className="h-[68px] w-[68px] rounded-2xl overflow-hidden shadow-xl"
                  style={{ border: "2px solid rgba(255,255,255,0.92)", background: "#fff" }}
                >
                  <img
                    src={celebPicture}
                    alt={celebName || "Celebrity"}
                    className="w-full h-full object-cover"
                  />
                </div>

                <p className="mt-2 text-[9px] font-black tracking-[0.1em] leading-tight">
                  {celebName ? celebName.toUpperCase() : "—"}
                </p>
              </div>

              <div
                className="rounded-2xl p-3 flex flex-col items-center justify-center text-center"
                style={{
                  background: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <p className="text-[7px] tracking-[0.22em] mb-2" style={{ color: "rgba(255,255,255,0.60)" }}>
                  FAN
                </p>

                {getDisplayUserPicture() ? (
                  <div
                    className="h-[68px] w-[68px] rounded-2xl overflow-hidden shadow-xl"
                    style={{ border: "2px solid rgba(255,255,255,0.92)", background: "#fff" }}
                  >
                    <img
                      src={getDisplayUserPicture()}
                      alt={userInfo?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="h-[68px] w-[68px] rounded-2xl flex items-center justify-center text-2xl font-bold shadow-xl"
                    style={{
                      border: "2px solid rgba(255,255,255,0.92)",
                      background: "rgba(255,255,255,0.16)",
                    }}
                  >
                    {getInitials(userInfo?.name || "F")}
                  </div>
                )}

                <p className="mt-2 text-[9px] font-black tracking-[0.1em] leading-tight">
                  {String(userInfo?.name || "").toUpperCase()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-auto">
              <DetailBox
                label="MEMBER ID"
                value={<span className="font-mono">{formatCardId(userInfo?.cardId)}</span>}
              />
              <DetailBox label="TIER" value={pkg.name} />
            </div>
          </>
        )}

        <div className="absolute right-2 bottom-10 opacity-20">
          <ScanLine className="h-10 w-10" />
        </div>
      </div>
    </CardShell>
  );

  const BackCard = () => (
    <CardShell gradient={backGradient}>
      <div className="relative z-10 h-full p-3 text-white flex flex-col">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-[0.22em]">CARD DETAILS</span>
              <CreditCard className="h-4 w-4 text-white/80" />
            </div>
            <p className="text-[7px] mt-1 tracking-[0.14em]" style={{ color: "rgba(255,255,255,0.56)" }}>
              VERIFIED MEMBER INFORMATION
            </p>
          </div>

          <div
            className="px-2 py-1 rounded-full text-[7px] font-bold tracking-[0.18em]"
            style={{
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.16)",
            }}
          >
            BACK
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <DetailBox label="FULL NAME" value={userInfo?.name || "—"} />
          <DetailBox label="FAN OF" value={celebName || "—"} />
          <DetailBox
            label="EMAIL"
            value={<span className="break-all">{userInfo?.email || "—"}</span>}
          />
          <DetailBox label="PHONE" value={userInfo?.phone || "—"} />
          <DetailBox
            label="CARD NUMBER"
            value={<span className="font-mono">{formatCardId(userInfo?.cardId)}</span>}
          />
          <DetailBox label="MEMBER SINCE" value={formatDate(userInfo?.createdAt)} />
          <DetailBox label="VALIDITY" value="LIFETIME" />
          <DetailBox label="PACKAGE" value={pkg.name} />
        </div>

        <div
          className="mt-3 rounded-xl px-3 py-2"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Globe className="h-3 w-3 text-white/70" />
              <span className="text-[7px] tracking-[0.16em] text-white/70">
                VERIFY AT FANCARD.COM/VERIFY
              </span>
            </div>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-300" />
              <div className="w-2 h-2 rounded-full bg-sky-400" />
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
          </div>
        </div>

        <div className="mt-auto flex justify-between items-end">
          <div>
            <p className="text-[6px] tracking-[0.18em] text-white/45">SYSTEM ID</p>
            <p className="text-[8px] font-mono text-white/75">
              {String(userInfo?._id || "").slice(-8)}
            </p>
          </div>

          <div
            className="h-8 w-20 rounded-md"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.14), rgba(255,255,255,0.32), rgba(255,255,255,0.14))",
            }}
          />
        </div>
      </div>
    </CardShell>
  );

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
            to="/login"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (userInfo.status === "pending_payment") {
    const selectedPkg = userInfo.packageType
      ? packageDetails[userInfo.packageType]
      : undefined;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center space-x-4">
            {getDisplayUserPicture() ? (
              <img
                src={getDisplayUserPicture()}
                alt={userInfo.name}
                className="h-12 w-12 rounded-xl border-2 border-gray-200 object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                {userInfo.name?.charAt(0) || "F"}
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Welcome, {userInfo.name?.split(" ")[0] || "Fan"}! 👋
              </h2>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Heart className="h-4 w-4 text-red-500" />
                Fan of: <span className="font-semibold">{celebName || "—"}</span>
              </p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Mail className="h-4 w-4" /> {userInfo.email}
              </p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Phone className="h-4 w-4" /> {userInfo.phone || "No phone"}
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-2xl">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800">Complete Your Payment</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your account has been created! Please complete the payment to activate your card.
                  </p>

                  {(userInfo.packageType || userInfo.amount) && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {userInfo.packageType && (
                        <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded inline-flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          Selected: {selectedPkg?.name || userInfo.packageType} Plan
                        </span>
                      )}
                      {userInfo.amount && (
                        <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                          Amount: ${Number(userInfo.amount).toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/packages"
            className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors text-sm whitespace-nowrap"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Proceed to Payment
          </Link>
        </div>
      </div>
    );
  }

  if (userInfo.status === "pending_verification") {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center space-x-4">
            {getDisplayUserPicture() ? (
              <img
                src={getDisplayUserPicture()}
                alt={userInfo.name}
                className="h-12 w-12 rounded-xl border-2 border-gray-200 object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                {userInfo.name?.charAt(0) || "F"}
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Welcome, {userInfo.name?.split(" ")[0] || "Fan"}! 👋
              </h2>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Heart className="h-4 w-4 text-red-500" />
                Fan of: <span className="font-semibold">{celebName || "—"}</span>
              </p>
              <p className="text-sm text-gray-500">{userInfo.email}</p>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-800">
                    Payment Received - Pending Verification
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Thank you for your payment! Your card is being verified by our team.
                  </p>
                  {userInfo.paymentDate && (
                    <p className="text-xs text-blue-600 mt-2">
                      Payment Date: {new Date(userInfo.paymentDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (userInfo.status === "approved") {
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 no-print">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              {getDisplayUserPicture() ? (
                <img
                  src={getDisplayUserPicture()}
                  alt={userInfo.name}
                  className="h-14 w-14 rounded-xl border-2 border-blue-500 object-cover"
                />
              ) : (
                <div className="h-14 w-14 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                  {getInitials(userInfo.name)}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Welcome back, {userInfo.name?.split(" ")[0]}! 👋
                </h2>
                <p className="text-sm text-gray-700 flex items-center gap-1 mt-1">
                  <Heart className="h-4 w-4 text-red-500" />
                  Fan of: <span className="font-semibold">{celebName || "—"}</span>
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                  <span className="flex items-center text-sm text-gray-500">
                    <Mail className="h-3 w-3 mr-1" /> {userInfo.email}
                  </span>
                  <span className="flex items-center text-sm text-gray-500">
                    <Phone className="h-3 w-3 mr-1" /> {userInfo.phone || "No phone"}
                  </span>
                  <span className="flex items-center text-sm text-gray-500">
                    <User className="h-3 w-3 mr-1" /> Member
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleDownloadCard}
                disabled={downloading}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm text-white ${
                  downloading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                <Download className="h-4 w-4 mr-2" />
                {downloading ? "Preparing..." : "Download Card"}
              </button>

              <button
                onClick={handlePrintCard}
                disabled={printing}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm text-white ${
                  printing ? "bg-gray-400 cursor-not-allowed" : "bg-gray-700 hover:bg-gray-800"
                }`}
              >
                <Printer className="h-4 w-4 mr-2" />
                {printing ? "Opening..." : "Print Card"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{pkg.name}</p>
              <p className="text-xs text-gray-500">Membership Tier</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {formatCardId(userInfo.cardId)}
              </p>
              <p className="text-xs text-gray-500">Card Number</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">LIFETIME</p>
              <p className="text-xs text-gray-500">Validity</p>
            </div>
          </div>
        </div>

        {/* visible preview */}
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-8">
            <FrontCard />
            <BackCard />
          </div>
        </div>

        {/* hidden export layout */}
        <div
          style={{
            position: "fixed",
            left: "-10000px",
            top: "0",
            width: `${EXPORT_W_PX}px`,
            height: `${EXPORT_H_PX}px`,
            overflow: "hidden",
            background: "#ffffff",
            zIndex: -1,
            pointerEvents: "none",
          }}
        >
          <div
            ref={exportRef}
            style={{
              width: "85.6mm",
              height: `${CARD_H_MM * 2 + CARD_GAP_MM}mm`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: `${CARD_GAP_MM}mm`,
              padding: "0",
              margin: "0",
              background: "#ffffff",
              boxSizing: "border-box",
            }}
          >
            <FrontCard />
            <BackCard />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 no-print">
          {pkg.features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-3 border border-gray-100 flex items-center space-x-2"
            >
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center no-print">
          <Link to="/support" className="text-sm text-blue-600 hover:text-blue-700">
            Need help with your card?
          </Link>
          <Link
            to="/packages"
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors text-sm"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Upgrade Package
          </Link>
        </div>
      </div>
    );
  }

  if (userInfo.status === "rejected") {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center space-x-4">
            {getDisplayUserPicture() ? (
              <img
                src={getDisplayUserPicture()}
                alt={userInfo.name}
                className="h-12 w-12 rounded-xl border-2 border-gray-200 object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                {userInfo.name?.charAt(0) || "F"}
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Welcome, {userInfo.name?.split(" ")[0] || "Fan"}! 👋
              </h2>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Heart className="h-4 w-4 text-red-500" />
                Fan of: <span className="font-semibold">{celebName || "—"}</span>
              </p>
              <p className="text-sm text-gray-500">{userInfo.email}</p>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-800">Payment Not Approved</h3>
                  <p className="text-sm text-red-700 mt-1">
                    Your payment verification was not successful. Please contact support or try again.
                  </p>
                  <Link
                    to="/support"
                    className="inline-block mt-3 text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Contact Support →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/packages"
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-start space-x-3">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-gray-900">Dashboard</h3>
          <p className="text-sm text-gray-600 mt-1">
            We couldn’t determine your account status. Please refresh or contact support.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh
            </button>
            <Link
              to="/support"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;