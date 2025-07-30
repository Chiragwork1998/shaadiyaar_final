import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Instagram, Loader2, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

// Animated Background Component
const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 5 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.color = `rgba(30, 58, 138, ${Math.random() * 0.2})`;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas!.width) this.x = 0;
        if (this.x < 0) this.x = canvas!.width;
        if (this.y > canvas!.height) this.y = 0;
        if (this.y < 0) this.y = canvas!.height;
      }

      draw() {
        ctx!.fillStyle = this.color;
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    const particlesArray: Particle[] = [];
    const numberOfParticles = Math.min(50, window.innerWidth / 20);

    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-0" />;
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate('/');
    } catch (error: any) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-b from-[#fffcf0] to-white overflow-hidden">
      <AnimatedBackground />

      {/* Hero Section */}
      <section className="relative h-full flex flex-col">
        {/* Shaadiyaar Text in Top Left */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
          <div className="flex items-center">
            <div className="h-6 w-1 bg-gradient-to-b from-[#d4af37] to-[#1e3a8a] rounded-full mr-2 hidden md:block"></div>
            <h3 className="font-serif text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1e3a8a] to-purple-700">
              Shaadiyaar
            </h3>
          </div>
        </div>

        {/* Instagram Follow Button */}
        <a
          href="https://www.instagram.com/shaadiyaar.in"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 right-4 md:top-6 md:right-6 z-20 flex items-center gap-2 bg-white/80 hover:bg-white backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <span className="text-sm font-medium text-[#1e3a8a] hidden sm:inline">Follow us</span>
          <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 p-1 rounded-full transform group-hover:scale-110 transition-transform duration-300">
            <Instagram className="h-3 w-3 text-white" />
          </div>
        </a>

        {/* Decorative Elements */}
        <div className="absolute top-16 left-8 w-48 h-48 bg-[#d4af37]/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-16 right-8 w-64 h-64 bg-[#1e3a8a]/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute top-32 right-16 w-56 h-56 bg-rose-100/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "12s" }}
        />

        <div className="container mx-auto px-4 flex flex-col items-center text-center relative z-10 h-full justify-center py-8">
          <motion.div 
            className="logo-container relative w-32 h-32 md:w-40 md:h-40 mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <img
              src="/shaadiyaar_logo.png"
              alt="Shaadiyaar Logo"
              className="w-full h-full object-contain p-2 scale-90 hover:scale-100 transition-transform duration-700"
              onError={(e) => {
                const target = e.currentTarget;
                const fallback = target.nextElementSibling as HTMLElement;
                target.style.display = 'none';
                if (fallback) fallback.style.display = 'block';
              }}
            />
            <div className="hidden w-full h-full flex items-center justify-center text-6xl font-bold text-[#1e3a8a]">S</div>
          </motion.div>

          <motion.h1
            className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-[#1e3a8a] mb-4"
            style={{ textShadow: "0 4px 8px rgba(0,0,0,0.05)" }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Your Perfect Wedding Journey{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1e3a8a] to-purple-700">Begins Here</span>
          </motion.h1>

          <motion.p 
            className="text-base md:text-lg text-gray-700 max-w-2xl mb-6 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Transforming wedding dreams into breathtaking reality. Elevate your celebration with Shaadiyaar's exclusive
            planning experience.
          </motion.p>

          {/* Admin Login Form */}
          <motion.div
            className="w-full max-w-sm mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-[#1e3a8a]/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-transparent to-[#d4af37]/5 pointer-events-none"></div>

              <h3 className="text-xl font-serif font-bold text-[#1e3a8a] mb-4 text-center">Admin Login</h3>

              <form onSubmit={handleLogin} className="space-y-4 relative z-10">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="group">
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border-2 border-[#1e3a8a]/20 focus:border-[#d4af37] bg-white/70 backdrop-blur-sm rounded-xl py-3 px-4 text-base transition-all duration-300 focus:ring-2 focus:ring-[#d4af37]/30 focus:outline-none"
                    disabled={loading}
                  />
                </div>

                <div className="group">
                  <input
                    type="password"
                    placeholder="Your Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full border-2 border-[#1e3a8a]/20 focus:border-[#d4af37] bg-white/70 backdrop-blur-sm rounded-xl py-3 px-4 text-base transition-all duration-300 focus:ring-2 focus:ring-[#d4af37]/30 focus:outline-none"
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#1e3a8a] to-purple-800 hover:from-[#1e3a8a]/90 hover:to-purple-700 text-white text-base py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Heart className="mr-2 h-4 w-4" />
                      Access Dashboard
                    </div>
                  )}
                </button>

                <p className="text-center text-xs text-gray-500 mt-3">
                  Secure admin access to your wedding planning platform
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Login;