import Image from "next/image"
import SignupForm from "@/components/signup-form"
import FeatureCard from "@/components/feature-card"
import { Sparkles, Instagram } from "lucide-react"
import FloralDivider from "@/components/floral-divider"
import AnimatedBackground from "@/components/animated-background"
import TestimonialCarousel from "@/components/testimonial-carousel"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white overflow-hidden">
      <AnimatedBackground />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 md:pt-28 md:pb-40">
        {/* Shaadiyaar Text in Top Left */}
        <div className="absolute top-4 left-4 md:top-8 md:left-8 z-20">
          <div className="flex items-center">
            <div className="h-8 w-1 bg-gradient-to-b from-gold to-navy rounded-full mr-3 hidden md:block"></div>
            <h3 className="font-serif text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-navy to-purple-700">
              Shaadiyaar
            </h3>
          </div>
        </div>

        {/* Instagram Follow Button */}
        <a
          href="https://www.instagram.com/shaadiyaar.in"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 right-4 md:top-8 md:right-8 z-20 flex items-center gap-2 bg-white/80 hover:bg-white backdrop-blur-sm px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <span className="text-sm font-medium text-navy hidden sm:inline">Follow us</span>
          <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 p-1.5 rounded-full transform group-hover:scale-110 transition-transform duration-300">
            <Instagram className="h-4 w-4 text-white" />
          </div>
        </a>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-gold/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-navy/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute top-40 right-20 w-72 h-72 bg-rose-100/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "12s" }}
        />

        <div className="container mx-auto px-4 flex flex-col items-center text-center relative z-10">
          <div className="logo-container relative w-72 h-72 mb-8 animate-fadeIn">
            <Image
              src="/logo.png"
              alt="Shaadiyaar Logo"
              fill
              priority
              className="object-contain p-4 scale-90 hover:scale-100 transition-transform duration-700"
            />
          </div>

          <h1
            className="text-5xl md:text-7xl font-serif font-bold text-navy mb-8 animate-fadeInUp"
            style={{ textShadow: "0 4px 8px rgba(0,0,0,0.05)" }}
          >
            Your Perfect Wedding Journey{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-navy to-purple-700">Begins Here</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mb-12 leading-relaxed animate-fadeInUp animation-delay-200">
            Transforming wedding dreams into breathtaking reality. Elevate your celebration with Shaadiyaar's exclusive
            planning experience.
          </p>

          <div className="flex items-center justify-center gap-3 mb-16 animate-fadeInUp animation-delay-300">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold"></div>
            <Sparkles className="text-gold h-7 w-7" />
            <span className="text-navy font-medium text-lg">Coming Soon</span>
            <Sparkles className="text-gold h-7 w-7" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold"></div>
          </div>

          <div className="animate-fadeInUp animation-delay-400 w-full max-w-md">
            <SignupForm />
          </div>
        </div>
      </section>

      <FloralDivider />

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24 md:py-32 relative">
        <div className="absolute top-1/4 left-0 w-full h-full max-h-[500px] bg-gradient-radial from-gold/5 to-transparent opacity-70"></div>

        <h2 className="text-4xl md:text-5xl font-serif font-bold text-navy text-center mb-6 animate-fadeIn">
          What Shaadiyaar Will Offer
        </h2>

        <p className="text-xl text-center text-gray-600 max-w-3xl mx-auto mb-20 animate-fadeIn animation-delay-200">
          We're building a comprehensive suite of tools to make your wedding planning journey seamless and joyful.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          <FeatureCard
            title="Vendor Management"
            description="Find and book the perfect vendors for your wedding, from venues to photographers, all vetted and reviewed by real couples."
            icon="Users"
            delay={0}
          />
          <FeatureCard
            title="Budget Planning"
            description="Keep track of your wedding expenses and stay within your budget with our smart tools and payment tracking features."
            icon="Calculator"
            delay={100}
          />
          <FeatureCard
            title="Guest List"
            description="Manage your guest list, send digital invitations, and track RSVPs all in one place with our intuitive interface."
            icon="ClipboardList"
            delay={200}
          />
          <FeatureCard
            title="Timeline"
            description="Stay organized with customized timelines and checklists for your big day, with automated reminders for important deadlines."
            icon="Calendar"
            delay={300}
          />
          <FeatureCard
            title="Inspiration Gallery"
            description="Discover wedding themes, decor ideas, and more to inspire your perfect celebration, curated by wedding experts."
            icon="Image"
            delay={400}
          />
          <FeatureCard
            title="Wedding Website"
            description="Create a beautiful wedding website to share your love story with your guests, complete with RSVP functionality."
            icon="Globe"
            delay={500}
          />
        </div>
      </section>

      <div className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/mandala-pattern.png')] bg-repeat opacity-5"></div>
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-navy/90 to-purple-900/90 rounded-3xl p-12 md:p-20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full bg-[url('/floral-pattern.png')] bg-no-repeat bg-right-top opacity-10"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">
                Ready to Begin Your Journey?
              </h2>
              <p className="text-xl text-white/80 mb-10 max-w-2xl">
                Join our waitlist today and be the first to experience the future of wedding planning with Shaadiyaar.
              </p>
              <button className="bg-white text-navy hover:bg-gold hover:text-white transition-colors duration-300 font-medium py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Join Waitlist
              </button>
            </div>
          </div>
        </div>
      </div>

      <FloralDivider flip={true} />

      {/* Testimonials Section */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-cream/50 to-white"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-navy mb-6 animate-fadeIn">
            Join Couples Who Trust Shaadiyaar
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-16 animate-fadeIn animation-delay-200">
            Hear what wedding industry experts and early testers have to say about our platform.
          </p>

          <TestimonialCarousel />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white/10 to-transparent"></div>
        <div className="absolute inset-0 bg-[url('/mandala-pattern.png')] bg-repeat opacity-5"></div>

        <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
            <div>
              <div className="mb-6 flex items-center">
                <Image
                  src="/logo.png"
                  alt="Shaadiyaar Logo"
                  width={100}
                  height={100}
                  className="object-contain invert"
                />
                <h3 className="text-2xl font-serif font-bold text-white ml-3">Shaadiyaar</h3>
              </div>
              <p className="text-white/70 mb-6">
                A comprehensive wedding planning platform designed to make your special day truly magical.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-white/70 hover:text-gold transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-white/70 hover:text-gold transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-white/70 hover:text-gold transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-6">Quick Links</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="text-white/70 hover:text-gold transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-gold transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-gold transition-colors">
                    Testimonials
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-gold transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-6">Legal</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="text-white/70 hover:text-gold transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-gold transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-gold transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-6">Subscribe</h3>
              <p className="text-white/70 mb-4">Stay updated with our latest news and offers.</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="bg-white/10 text-white placeholder:text-white/50 border-0 rounded-l-full py-3 px-4 focus:ring-2 focus:ring-gold focus:outline-none w-full"
                />
                <button className="bg-gold hover:bg-gold/90 text-white rounded-r-full px-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/50 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Shaadiyaar. All rights reserved.
            </p>
            <p className="text-white/50 text-sm">Designed with ❤️ for couples everywhere</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
