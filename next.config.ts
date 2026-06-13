import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // รูปสลิปอาจใหญ่กว่า 1MB ซึ่งเป็นค่า default ของ Server Actions
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
