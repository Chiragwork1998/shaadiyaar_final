"use client"

import { Users, Calculator, ClipboardList, Calendar, ImageIcon, Globe } from "lucide-react"
import { motion } from "framer-motion"

interface FeatureCardProps {
  title: string
  description: string
  icon: string
  delay?: number
}

export default function FeatureCard({ title, description, icon, delay = 0 }: FeatureCardProps) {
  const getIcon = (): JSX.Element => {
    const props = { className: "h-12 w-12 text-gold mb-4" }

    switch (icon) {
      case "Users":
        return <Users {...props} />
      case "Calculator":
        return <Calculator {...props} />
      case "ClipboardList":
        return <ClipboardList {...props} />
      case "Calendar":
        return <Calendar {...props} />
      case "Image":
        return <ImageIcon {...props} />
      case "Globe":
        return <Globe {...props} />
      default:
        return <Users {...props} />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-navy/10 shadow-xl hover:shadow-2xl transition-all duration-500 h-full group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-gold/5 to-transparent rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-navy/5 to-transparent rounded-full -ml-20 -mb-20 group-hover:scale-150 transition-transform duration-700"></div>

        <div className="relative z-10">
          <div className="bg-navy/5 rounded-2xl p-4 inline-block mb-4 group-hover:bg-navy/10 transition-colors duration-300">
            {getIcon()}
          </div>
          <h3 className="text-2xl font-serif font-bold text-navy mb-4 group-hover:text-purple-800 transition-colors duration-300">
            {title}
          </h3>
          <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">{description}</p>
        </div>
      </div>
    </motion.div>
  )
}
