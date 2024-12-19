import createMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

/** @type {import('next').NextConfig} */

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],

  webpack(config) {
    config.experiments = { ...config.experiments, asyncWebAssembly: true }
    config.module.rules.push({
      test: /.*\.wasm$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/wasm/[name].[contenthash][ext]',
      },
    })

    // There is an issue with @duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js when minimized with swc causes duplicate variables 't'. I need to investigate this further, so for now skipping minimization.
    config.optimization = {
      minimize: false,
    }

    config

    return config
  },
}

const withMDX = createMDX({
  // Add markdown plugins here, as desired
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug, // Adds IDs to headers
      rehypeAutolinkHeadings, // Adds anchor links to headers
    ],
  },
})

export default withMDX(nextConfig)
