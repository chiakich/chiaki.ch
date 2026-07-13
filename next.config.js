/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  // react-split-flap ships type:module with a CJS .js main; bundle it instead of requiring it
  transpilePackages: ['react-split-flap'],
  images: {
    loader: 'custom',
    loaderFile: './imageLoader.ts',
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
