export default function RegisterLoading() {
  return (
    <main
      className="min-h-screen flex items-center justify-center p-4 py-12"
      style={{
        background:
          "radial-gradient(circle at 30% 20%, rgba(79,70,229,0.15), transparent 40%), linear-gradient(180deg, #060816 0%, #070b17 42%, #091121 100%)",
      }}
    >
      <div className="w-full max-w-2xl animate-fade-in">
        {/* Header skeleton */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl animate-shimmer"
              style={{ background: "rgba(88,115,255,0.2)" }}
            />
            <div
              className="h-7 rounded-lg animate-shimmer"
              style={{
                width: "260px",
                background: "rgba(255,255,255,0.06)",
              }}
            />
          </div>
          <div
            className="h-4 rounded-lg mx-auto animate-shimmer"
            style={{
              width: "340px",
              background: "rgba(255,255,255,0.04)",
              marginTop: "8px",
            }}
          />
        </div>

        {/* Card skeleton */}
        <div
          className="glass-card"
          style={{ padding: "32px" }}
        >
          {/* Section title */}
          <div
            className="h-4 rounded animate-shimmer"
            style={{
              width: "160px",
              background: "rgba(143,220,255,0.08)",
              marginBottom: "20px",
            }}
          />

          {/* Input row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div
                  className="h-3 rounded animate-shimmer"
                  style={{
                    width: "80px",
                    background: "rgba(255,255,255,0.06)",
                    marginBottom: "8px",
                  }}
                />
                <div
                  className="h-12 rounded-2xl animate-shimmer"
                  style={{
                    background: "rgba(10,18,34,0.84)",
                    border: "1px solid var(--border)",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Section title 2 */}
          <div
            className="h-4 rounded animate-shimmer"
            style={{
              width: "180px",
              background: "rgba(143,220,255,0.08)",
              marginBottom: "20px",
            }}
          />

          {/* Input row 2 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            {[1, 2].map((i) => (
              <div key={i}>
                <div
                  className="h-3 rounded animate-shimmer"
                  style={{
                    width: "100px",
                    background: "rgba(255,255,255,0.06)",
                    marginBottom: "8px",
                  }}
                />
                <div
                  className="h-12 rounded-2xl animate-shimmer"
                  style={{
                    background: "rgba(10,18,34,0.84)",
                    border: "1px solid var(--border)",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Button skeleton */}
          <div
            className="h-12 rounded-full animate-shimmer"
            style={{
              background: "linear-gradient(135deg, rgba(91,118,255,0.3), rgba(69,102,255,0.2))",
              marginTop: "16px",
            }}
          />
        </div>
      </div>
    </main>
  );
}
