import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "My Story",
    short_name: "My Story",
    description: "สมุดบันทึกเรื่องราวของฉัน",
    start_url: `${base}/`,
    scope: `${base}/`,
    display: "standalone",
    background_color: "#faf8f5",
    theme_color: "#c2410c",
    icons: [{ src: `${base}/icon.svg`, sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
