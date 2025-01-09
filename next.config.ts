import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: [
    "onnxruntime-node",
    "sharp", // Add sharp to the external packages list
  ],
};

export default nextConfig;
