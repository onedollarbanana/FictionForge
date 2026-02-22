import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") || "Untitled Story";
  const author = searchParams.get("author") || "Unknown Author";
  const cover = searchParams.get("cover") || "";
  const description = searchParams.get("description") || "";
  const genre = searchParams.get("genre") || "";

  const truncatedDescription =
    description.length > 120
      ? description.substring(0, 120) + "..."
      : description;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200",
          height: "630",
          display: "flex",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Left side: Cover */}
        <div
          style={{
            width: "340",
            height: "630",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px 40px 40px",
          }}
        >
          {cover ? (
            <img
              src={cover}
              alt=""
              width={280}
              height={420}
              style={{
                borderRadius: "12px",
                objectFit: "cover",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              }}
            />
          ) : (
            <div
              style={{
                width: "280",
                height: "420",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              }}
            >
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.8)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Right side: Info */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "40px 40px 40px 20px",
          }}
        >
          {/* Title */}
          <div
            style={{
              fontSize: "42",
              fontWeight: "bold",
              color: "#ffffff",
              lineHeight: 1.2,
              marginBottom: "16",
              display: "-webkit-box",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title.length > 60 ? title.substring(0, 60) + "..." : title}
          </div>

          {/* Author */}
          <div
            style={{
              fontSize: "22",
              color: "#c4b5fd",
              marginBottom: "20",
              display: "flex",
              alignItems: "center",
            }}
          >
            by {author}
          </div>

          {/* Description */}
          {truncatedDescription && (
            <div
              style={{
                fontSize: "18",
                color: "rgba(255,255,255,0.7)",
                lineHeight: 1.5,
                marginBottom: "24",
              }}
            >
              {truncatedDescription}
            </div>
          )}

          {/* Genre badge */}
          {genre && (
            <div style={{ display: "flex", marginBottom: "24" }}>
              <div
                style={{
                  background: "rgba(124, 58, 237, 0.3)",
                  border: "1px solid rgba(124, 58, 237, 0.6)",
                  borderRadius: "20px",
                  padding: "6px 16px",
                  fontSize: "16",
                  color: "#c4b5fd",
                }}
              >
                {genre}
              </div>
            </div>
          )}

          {/* Branding */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "auto",
            }}
          >
            <div
              style={{
                width: "8",
                height: "28",
                background: "#7c3aed",
                borderRadius: "4px",
                marginRight: "12",
              }}
            />
            <div
              style={{
                fontSize: "20",
                color: "rgba(255,255,255,0.6)",
                fontWeight: "600",
              }}
            >
              fictionry.com
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
