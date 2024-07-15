import React, { ReactNode } from 'react'

const ChartTextLayout = ({
  children,
  title,
}: {
  children: ReactNode
  title?: string | ReactNode
}) => {
  return (
    <div className="pb-16">
      {React.isValidElement(title) ? (
        title
      ) : (
        <h1 className="text-2xl pb-4">{title}</h1>
      )}
      {children}
    </div>
  )
}

export default ChartTextLayout
