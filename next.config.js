/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  // react-split-flap ships type:module with a CJS .js main; bundle it instead of requiring it
  // kappan 直接發 TS 原始碼（沒有建置步驟），所以要讓 Next 自己轉。
  transpilePackages: ['react-split-flap', 'kappan'],
  // Assets are resized and re-encoded ahead of time by scripts/optimizeAssets.js,
  // so there is nothing left for a loader to do.
  images: {
    unoptimized: true,
  },
  webpack(config) {
    config.module.rules = [
      ...config.module.rules,
      {
        test: /\.svg$/i,
        type: 'asset',
        resourceQuery: /url/, // *.svg?url
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: { not: [/url/] }, // exclude react component if *.svg?url
        use: ['@svgr/webpack'],
      },
    ]
    return config
  },
}

module.exports = nextConfig
