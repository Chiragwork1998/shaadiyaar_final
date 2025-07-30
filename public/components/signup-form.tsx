"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { saveSignup } from "@/app/actions"
import { Loader2, Heart, AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { motion } from "framer-motion"

export default function SignupForm() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formError, setFormError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    if (!email || !name) {
      toast({
        title: "Please fill in all fields",
        variant: "destructive",
      })
      setFormError("Please fill in all fields")
      return
    }

    setIsSubmitting(true)
    console.log("Form submission started for:", { name, email })

    try {
      const result = await saveSignup(name, email)
      console.log("Form submission result:", result)

      if (result.success) {
        setIsSuccess(true)
        setEmail("")
        setName("")

        if (result.webhookSuccess) {
          toast({
            title: "Thank you for signing up!",
            description: "We'll notify you when Shaadiyaar launches.",
            variant: "default",
          })
        } else {
          // Webhook failed but local save worked
          toast({
            title: "Thank you for signing up!",
            description: "Your information was saved. We'll notify you when Shaadiyaar launches.",
            variant: "default",
          })
          console.log("Note: Webhook submission failed but data was saved locally")
        }
      } else {
        // Both webhook and local save failed
        setFormError("Something went wrong. Please try again.")
        toast({
          title: "Something went wrong",
          description: result.message || "Please try again later.",
          variant: "destructive",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        })
      }
    } catch (error) {
      console.error("Form submission error:", error)
      setFormError("Something went wrong. Please try again.")
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-navy/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-transparent to-gold/5 pointer-events-none"></div>

        <h3 className="text-2xl font-serif font-bold text-navy mb-6">Be the first to know when we launch</h3>

        {isSuccess ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-navy mb-2">Thank You!</h4>
            <p className="text-gray-600">Your signup has been received. We'll notify you when Shaadiyaar launches.</p>
            <Button className="mt-6 bg-navy hover:bg-navy/90 text-white" onClick={() => setIsSuccess(false)}>
              Sign up another
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="group">
              <Input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-2 border-navy/20 focus:border-gold bg-white/70 backdrop-blur-sm rounded-xl py-6 px-4 text-lg transition-all duration-300 focus:ring-2 focus:ring-gold/30 focus:outline-none"
                disabled={isSubmitting}
              />
            </div>

            <div className="group">
              <Input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-2 border-navy/20 focus:border-gold bg-white/70 backdrop-blur-sm rounded-xl py-6 px-4 text-lg transition-all duration-300 focus:ring-2 focus:ring-gold/30 focus:outline-none"
                disabled={isSubmitting}
              />
            </div>

            {/* Honeypot field to catch bots */}
            <div className="hidden">
              <input type="text" name="bot_field" tabIndex={-1} autoComplete="off" />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-navy to-purple-800 hover:from-navy/90 hover:to-purple-700 text-white text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing Up...
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-5 w-5" />
                  Join the Waitlist
                </>
              )}
            </Button>

            <p className="text-center text-sm text-gray-500 mt-4">
              By signing up, you agree to our{" "}
              <a href="#" className="text-navy hover:text-gold underline transition-colors">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-navy hover:text-gold underline transition-colors">
                Privacy Policy
              </a>
            </p>
          </form>
        )}
      </div>
    </motion.div>
  )
}
