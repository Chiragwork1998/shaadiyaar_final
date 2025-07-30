"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"

const testimonials = [
  {
    quote:
      "Shaadiyaar is revolutionizing how couples plan their weddings. The platform's intuitive design and comprehensive features make it a game-changer in the wedding industry.",
    author: "Priya Sharma",
    role: "Wedding Planner",
    avatar: "/avatar-1.jpg",
  },
  {
    quote:
      "As someone who recently got engaged, I'm excited about Shaadiyaar's launch. The sneak peek I got shows it will make wedding planning so much easier and more enjoyable.",
    author: "Rahul Patel",
    role: "Early Tester",
    avatar: "/avatar-2.jpg",
  },
  {
    quote:
      "The vendor management system that Shaadiyaar is developing will transform how wedding professionals connect with couples. This is the platform the industry has been waiting for.",
    author: "Ananya Desai",
    role: "Event Manager",
    avatar: "/avatar-3.jpg",
  },
]

export default function TestimonialCarousel() {
  const [current, setCurrent] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  const next = () => {
    setCurrent((current + 1) % testimonials.length)
  }

  const prev = () => {
    setCurrent((current - 1 + testimonials.length) % testimonials.length)
  }

  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(next, 5000)
    return () => clearInterval(interval)
  }, [current, autoplay])

  return (
    <div className="relative max-w-4xl mx-auto">
      <div
        className="absolute top-1/2 -left-4 md:-left-12 transform -translate-y-1/2 z-10"
        onClick={() => {
          prev()
          setAutoplay(false)
        }}
      >
        <button className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-navy hover:text-white transition-colors duration-300">
          <ChevronLeft className="h-6 w-6" />
        </button>
      </div>

      <div
        className="absolute top-1/2 -right-4 md:-right-12 transform -translate-y-1/2 z-10"
        onClick={() => {
          next()
          setAutoplay(false)
        }}
      >
        <button className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-navy hover:text-white transition-colors duration-300">
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white/80 backdrop-blur-sm shadow-xl border border-navy/10 p-8 md:p-12">
        <Quote className="h-16 w-16 text-gold/20 mb-6" />

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p className="text-xl md:text-2xl text-gray-700 italic mb-8">"{testimonials[current].quote}"</p>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gold mb-4">
                <img
                  src={testimonials[current].avatar || "/placeholder.svg"}
                  alt={testimonials[current].author}
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="text-lg font-bold text-navy">{testimonials[current].author}</h4>
              <p className="text-gray-500">{testimonials[current].role}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrent(index)
                setAutoplay(false)
              }}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                index === current ? "bg-gold" : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
