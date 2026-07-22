import { ImageResponse } from "next/og"

// Image metadata
export const alt = "Sistem Informasi Kependudukan"
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

// Image generation
export default async function Image() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Sistem Informasi Kependudukan"

  return new ImageResponse(
    // ImageResponse JSX element
    <div
      style={{
        fontSize: 128,
        background: "linear-gradient(to bottom, #3b82f6, #1d4ed8)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        padding: "40px",
      }}
    >
      <div
        style={{
          fontSize: 64,
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: 40,
          textShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}
      >
        {appName}
      </div>
      <div
        style={{
          fontSize: 32,
          opacity: 0.8,
          textAlign: "center",
          maxWidth: "80%",
        }}
      >
        Sistem Pengelolaan Data Kependudukan Desa
      </div>
    </div>,
    // ImageResponse options
    {
      ...size,
    },
  )
}

