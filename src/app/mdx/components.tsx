import { ReactNode } from "react";

type Size = '4xl' | "2xl" | "xl" | "lg" | "md" | "sm"

export const Header = ({ children, size }: { children: ReactNode, size: Size}) => {
    return <h3 className={`text-${size}`}>{children}</h3>

}

export const Code = ({ children }: { children: ReactNode}) => {
    return <code className="bg-slate-200 p-2 pl-4 pr-8 block overflow-x-auto" >{children}</code>
}


export const Paragraph = ({ children }: {children: ReactNode }) => <p className="mb-4 mt-4">{children}</p>