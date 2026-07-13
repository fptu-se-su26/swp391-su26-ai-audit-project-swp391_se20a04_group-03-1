import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  // Ghim workspace root về đúng thư mục frontend.
  // Nếu để Next tự suy luận, do repo có NHIỀU lockfile (gốc monorepo + frontend),
  // Turbopack chọn gốc monorepo làm root và file-watcher của `next dev` sẽ quét
  // cả src/backend và src/computer-vison (Python venv, model HEF nặng) -> phình
  // RAM (native watcher + JS heap) và có thể treo máy. Build không bị vì không watch.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
