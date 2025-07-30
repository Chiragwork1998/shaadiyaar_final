interface FloralDividerProps {
  flip?: boolean
}

export default function FloralDivider({ flip = false }: FloralDividerProps) {
  return (
    <div className={`relative h-24 overflow-hidden ${flip ? "transform rotate-180" : ""}`}>
      <div className="absolute inset-0 bg-[url('/floral-divider.png')] bg-repeat-x bg-center opacity-20"></div>
    </div>
  )
}
