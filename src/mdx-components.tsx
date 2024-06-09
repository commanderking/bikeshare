import type { MDXComponents } from 'mdx/types'
import { Header, Code, Paragraph, Link, UnorderedList, Pre } from "@/app/mdx/components"

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => <Header size="4xl">{children}</Header>,
    h3: ({ children }) => <Header size="2xl">{children}</Header>,
    h4: ({ children }) => <Header size="xl">{children}</Header>,
    code: ({ children }) => (
      <Code>{children}</Code>
    ),
    pre: ({ children }) => (
      <Pre>{children }</Pre>
    ),
    p: ({ children }) => (
      <Paragraph>{children}</Paragraph>
    ),
    a: ({ children, href }) => (
      <Link href={href}>{children}</Link>
    ),

    ul: ({ children }) => (
      <UnorderedList>{children}</UnorderedList>
    )

  }

}