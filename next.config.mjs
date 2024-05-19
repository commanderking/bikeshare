import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],

  webpack(config) {
    config.experiments = { ...config.experiments, asyncWebAssembly: true }

    config.module.rules.push({
      test: /.*\.wasm$/,
      type: "asset/resource",
      generator: {
        filename: "static/wasm/[name].[contenthash][ext]",
      },
    })

    config.devtool = 'source-map';
    config.module.rules.push({
      test: /\.js$/,
      enforce: 'pre',
      use: ['source-map-loader'],
      exclude: /node_modules\/(?!duckdb-browser)/, // Exclude all node_modules except duckdb-browser
    });

    // config.optimization = {
    //   minimize: false
    // }

    return config;
  }

}

const withMDX = createMDX({
  // Add markdown plugins here, as desired
})
 

export default withMDX(nextConfig)
