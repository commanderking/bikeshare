/** @type {import('next').NextConfig} */

const nextConfig = {
  webpack(config) {
    config.experiments = { ...config.experiments, asyncWebAssembly: true }

    config.module.rules.push({
      test: /.*\.wasm$/,
      type: "asset/resource",
      generator: {
        filename: "static/wasm/[name].[contenthash][ext]",
      },
    })

    return config;
  }

}

export default nextConfig