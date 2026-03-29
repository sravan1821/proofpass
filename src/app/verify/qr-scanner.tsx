"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, CameraOff, ScanLine } from "lucide-react";

const SCANNER_REGION_ID = "qr-scanner-region";

export function QrScanner() {
  const router = useRouter();
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [scannedValue, setScannedValue] = useState("");

  async function startScanner() {
    setError("");
    setScannedValue("");

    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      if (!scannerRef.current) return;

      if (!document.getElementById(SCANNER_REGION_ID)) return;
      if (html5QrCodeRef.current) return;

      const html5QrCode = new Html5Qrcode(SCANNER_REGION_ID);
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1,
        },
        (decodedText: string) => {
          setScannedValue(decodedText);
          stopScanner();

          // Extract certificate ID from URL or use directly
          let certificateId = decodedText;
          try {
            const url = new URL(decodedText);
            const pathParts = url.pathname.split("/");
            const verifyIndex = pathParts.indexOf("verify");
            if (verifyIndex !== -1 && pathParts[verifyIndex + 1]) {
              certificateId = decodeURIComponent(pathParts[verifyIndex + 1]);
            }
          } catch {
            // Not a URL, use the raw value as certificate ID
          }

          router.push(`/verify/${encodeURIComponent(certificateId)}`);
        },
        () => {
          // QR code not found in frame - no action needed
        }
      );

      setScanning(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to start camera";
      if (message.includes("Permission")) {
        setError(
          "Camera access denied. Please allow camera access in your browser settings."
        );
      } else {
        setError(message);
      }
    }
  }

  async function stopScanner() {
    try {
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear?.();
        html5QrCodeRef.current = null;
      }
    } catch {
      // Scanner might already be stopped
    }
    setScanning(false);
  }

  useEffect(() => {
    setMounted(true);

    return () => {
      const qrInstance = html5QrCodeRef.current;
      html5QrCodeRef.current = null;

      if (qrInstance) {
        qrInstance
          .stop()
          .catch(() => {})
          .finally(() => {
            if (typeof qrInstance.clear === "function") {
              Promise.resolve(qrInstance.clear()).catch(() => {});
            }
          });
      }
    };
  }, []);

  if (!mounted) {
    return (
      <div suppressHydrationWarning>
        <div
          style={{
            position: "relative",
            borderRadius: "12px",
            overflow: "hidden",
            background: "rgba(0,0,0,0.25)",
            minHeight: "160px",
            border: "1px dashed rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--muted-foreground)",
            fontSize: "0.82rem",
          }}
        >
          Camera scanner loading…
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Scanner viewport */}
      <div
        ref={scannerRef}
        style={{
          position: "relative",
          borderRadius: "12px",
          overflow: "hidden",
          background: "rgba(0,0,0,0.4)",
          minHeight: scanning ? "280px" : "0px",
        }}
      >
        <div id={SCANNER_REGION_ID} style={{ width: "100%", minHeight: scanning ? "280px" : "0px" }} />
        {scanning && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 10,
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "220px",
                height: "220px",
                border: "2px solid rgba(16,185,129,0.5)",
                borderRadius: "12px",
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.4)",
              }}
            />
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div
          style={{
            marginTop: "12px",
            padding: "10px 14px",
            borderRadius: "10px",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#ef4444",
            fontSize: "0.82rem",
          }}
        >
          {error}
        </div>
      )}

      {/* Scanned result */}
      {scannedValue && (
        <div
          style={{
            marginTop: "12px",
            padding: "10px 14px",
            borderRadius: "10px",
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.2)",
            color: "#10b981",
            fontSize: "0.82rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <ScanLine size={16} />
          Scanned: {scannedValue}
        </div>
      )}

      {/* Toggle button */}
      <button
        type="button"
        onClick={scanning ? stopScanner : startScanner}
        style={{
          marginTop: "14px",
          width: "100%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "12px 20px",
          borderRadius: "12px",
          border: scanning
            ? "1px solid rgba(239,68,68,0.3)"
            : "1px solid rgba(16,185,129,0.3)",
          background: scanning
            ? "rgba(239,68,68,0.08)"
            : "rgba(16,185,129,0.08)",
          color: scanning ? "#ef4444" : "#10b981",
          fontSize: "0.88rem",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
      >
        {scanning ? (
          <>
            <CameraOff size={18} />
            Stop Scanner
          </>
        ) : (
          <>
            <Camera size={18} />
            Scan QR Code
          </>
        )}
      </button>
    </div>
  );
}
