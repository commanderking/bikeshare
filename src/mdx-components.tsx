import type { MDXComponents } from 'mdx/types'
import { Header, Code, Paragraph } from "@/app/mdx/components"

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => <Header size="4xl">{children}</Header>,
    h3: ({ children }) => <Header size="2xl">{children}</Header>,
    code: ({ children }) => (
      <Code>{children}</Code>
    ),
    p: ({ children }) => (
      <Paragraph>{children}</Paragraph>
    )
  }

}