import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimationFrame, useMotionValue, useTransform, useScroll, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu, X, Quote, PlusCircle, MinusCircle, Instagram, Facebook, Linkedin, Twitter } from "lucide-react";

const ProjectCard: React.FC<{ project: { img: string; mobileImg?: string }; i: number }> = ({ project, i }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Dramatic shrink as it scrolls away
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.7]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [0, -35]); // Stronger bending effect

  return (
    <div 
      ref={containerRef} 
      className="sticky top-20 md:top-24 w-full max-w-[392px] md:max-w-[1200px] h-[300px] md:h-[600px] lg:h-[680px] mb-[4vh] md:mb-[5vh] flex items-center justify-center mx-auto px-4 md:px-0"
      style={{ zIndex: i + 1 }}
    >
      <motion.div
        style={{ scale, rotateX, transformPerspective: 1200 }}
        className="relative w-full h-full rounded-[24px] md:rounded-[48px] lg:rounded-[64px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] bg-white/5 backdrop-blur-xl border border-white/10"
      >
        {/* Desktop view uses img */}
        <img 
          src={project.img} 
          alt="Showcase" 
          className="hidden md:block w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        
        {/* Mobile view uses a container div with background image */}
        <div 
          className="md:hidden w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${project.mobileImg || project.img})`
          }}
        />
      </motion.div>
    </div>
  );
};

export const Logo = ({ className = "" }: { className?: string }) => {
  const { user } = useAuth();
  return (
    <Link to={user ? "/dashboard" : "/"} className={`flex items-center ${className}`}>
      <img 
        src="https://raw.githubusercontent.com/DannyYo696/svillage/cfdfd8520f96d8d336b2d00597bb7e5bde1cde14/cl%20logo.png" 
        alt="Cartlist" 
        className="h-8 md:h-10 w-auto" 
        referrerPolicy="no-referrer"
      />
    </Link>
  );
};

const NavLink: React.FC<{ to: string; children: React.ReactNode; onClick?: () => void }> = ({ to, children, onClick }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className="text-[13px] font-normal text-gray-700 hover:text-black transition-colors font-sans"
  >
    {children}
  </Link>
);

const galleryImages = [
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1582213726893-edc10ff052b1?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop",
];

const CurvedHeroGallery = () => {
  const scrollX = useMotionValue(0);
  const [dims, setDims] = useState({ cardWidth: 240, gap: 32 });

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setDims({
        cardWidth: isMobile ? 180 : 240,
        gap: 32
      });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { cardWidth, gap } = dims;
  const totalItemsWidth = galleryImages.length * (cardWidth + gap);
  
  const items = [...galleryImages, ...galleryImages, ...galleryImages, ...galleryImages, ...galleryImages];

  useAnimationFrame((_, delta) => {
    const speed = 80; 
    let nextX = scrollX.get() - (delta / 1000) * speed;
    if (nextX <= -totalItemsWidth) {
      nextX += totalItemsWidth;
    }
    scrollX.set(nextX);
  });

  return (
    <div className="relative w-full h-[420px] md:h-[550px] overflow-hidden flex items-center justify-center [perspective:1500px] mt-4 md:mt-0">
      {/* Huge background text behind cards */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-[0.03]">
        <h1 className="text-[120px] md:text-[240px] lg:text-[400px] font-black tracking-tighter text-black font-heading whitespace-nowrap">
          CARTLIST
        </h1>
      </div>

      <motion.div 
        className="flex gap-8 absolute left-0"
        style={{ x: scrollX }}
      >
        {items.map((img, i) => (
          <IndividualCard 
            key={i} 
            img={img} 
            scrollX={scrollX} 
            offset={i * (cardWidth + gap)} 
            cardWidth={cardWidth} 
          />
        ))}
      </motion.div>
    </div>
  );
};

const IndividualCard: React.FC<{ img: string; scrollX: any; offset: number; cardWidth: number }> = ({ img, scrollX, offset, cardWidth }) => {
  const containerWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  
  const relativeX = useTransform(scrollX, (v) => {
    const center = containerWidth / 2;
    const currentX = (v as number) + offset + cardWidth / 2;
    return (currentX - center) / (containerWidth / 2);
  });

  const y = useTransform(relativeX, [-1.5, 0, 1.5], [80, 0, 80]);
  const rotateY = useTransform(relativeX, [-1, 0, 1], [45, 0, -45]);
  const rotateZ = useTransform(relativeX, [-1, 0, 1], [-8, 0, 8]);
  const opacity = useTransform(relativeX, [-2, -1.2, 0, 1.2, 2], [0, 1, 1, 1, 0]);

  return (
    <motion.div
      style={{ 
        y, 
        rotateY, 
        rotateZ, 
        opacity,
        transformStyle: "preserve-3d",
      }}
      className="w-[180px] h-[260px] md:w-[240px] md:h-[360px] rounded-[32px] md:rounded-[48px] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.2)] shrink-0 border-4 border-white/20 bg-gray-900"
    >
      <img src={img} alt="Gallery" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
    </motion.div>
  );
};

const FloatingBubble = ({ text, className, delay = 0 }: { text: string; className: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5, y: 20 }}
    whileInView={{ opacity: 1, scale: 1, y: 0 }}
    animate={{ 
      y: [0, -8, 0],
    }}
    transition={{ 
      initial: { delay, duration: 0.5 },
      animate: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: delay * 2 }
    }}
    viewport={{ once: true }}
    className={`absolute z-20 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] border border-white/20 text-gray-800 font-bold text-[13px] md:text-[15px] whitespace-nowrap ${className}`}
  >
    {text}
  </motion.div>
);

const TestimonialCard: React.FC<{ quote: string; author: string; img: string }> = ({ quote, author, img }) => (
  <div
    className="bg-[#0A0D14] rounded-[32px] md:rounded-[48px] p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-10 w-[320px] md:w-[700px] h-[500px] md:h-[380px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] shrink-0 select-none"
  >
    <div className="flex-1 order-2 md:order-1 flex flex-col justify-center text-left">
      <Quote className="w-8 h-8 text-[#F07E48] mb-4 fill-[#F07E48]/20" />
      <p className="text-white text-[14px] md:text-[18px] font-medium leading-relaxed mb-6 line-clamp-6 md:line-clamp-none">
        {quote}
      </p>
      <div className="text-gray-400 text-[12px] md:text-[14px] font-bold uppercase tracking-wider">
        {author}
      </div>
    </div>
    <div className="w-[160px] h-[160px] md:w-[220px] md:h-full rounded-[24px] overflow-hidden order-1 md:order-2 shrink-0">
      <img 
        src={img} 
        alt={author} 
        className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-500"
        referrerPolicy="no-referrer"
      />
    </div>
  </div>
);

const FAQItem: React.FC<{ question: string; answer: string; isOpen: boolean; onClick: () => void }> = ({ question, answer, isOpen, onClick }) => (
  <div className="border-b border-gray-100 py-6">
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between text-left group transition-all"
    >
      <span className="text-[16px] md:text-[18px] font-bold text-gray-900 group-hover:text-[#F07E48] transition-colors">
        {question}
      </span>
      {isOpen ? (
        <MinusCircle className="w-6 h-6 text-[#F07E48] shrink-0" />
      ) : (
        <PlusCircle className="w-6 h-6 text-green-500 shrink-0" />
      )}
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <p className="pt-4 text-gray-500 text-[14px] md:text-[16px] leading-[1.6] max-w-2xl">
            {answer}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default function Landing() {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const faqs = [
    {
      question: "Does my customer need to sign up?",
      answer: "No, they don't need to sign up. you just log in their purchase and log their stock and then you can manage their stockpile and any time."
    },
    {
      question: "Do i need to change how i collect payment?",
      answer: "No, you can continue using your existing payment methods. Cartlist helps you manage the stockpile data, not the payment processing itself."
    },
    {
      question: "Is it available on mobile?",
      answer: "Yes! Cartlist is fully responsive and works perfectly on all mobile devices and tablets, allowing you to manage your business on the go."
    },
    {
      question: "How does the WhatsApp Bot work?",
      answer: "Our WhatsApp bot connects directly to your record system. Customers can send simple commands to track their orders or check availability, providing instant support without your manual intervention."
    },
    {
      question: "How does billing work?",
      answer: "We offer transparent, simple billing plans. You can choose a tier that fits your volume of stockpile management needs, with no hidden fees."
    },
    {
      question: "How do I change my account email?",
      answer: "You can change your account email easily through the profile settings in your dashboard. Simply enter the new email and verify it to update your login credentials."
    }
  ];
  
  const navLinks = [
    { label: "About", to: "#" },
    { label: "Contact", to: "#" },
  ];
  
  return (
    <div className="min-h-screen bg-[#FDF8F3] selection:bg-orange-100 selection:text-cartlist-orange overflow-hidden font-sans flex flex-col">
      {/* Navigation - Ultra Compact */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'md:bg-white bg-[#FDF8F3]/80 backdrop-blur-lg shadow-sm' : 'bg-[#FDF8F3]/60 backdrop-blur-md'} border-b border-black/5`}>
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Mobile Logo */}
          <div className="md:hidden flex-1">
            <Logo className="scale-110 origin-left" />
          </div>

          {/* Desktop: Grouped and Centered */}
          <div className="hidden md:flex flex-1 justify-center items-center gap-12 lg:gap-20">
            <div className="flex items-center gap-8 lg:gap-12">
              {navLinks.map((link) => (
                <NavLink key={link.label} to={link.to}>{link.label}</NavLink>
              ))}
            </div>
            
            <Logo />
            
            <div className="flex items-center gap-6 lg:gap-12">
              <Link to="/login" className="text-[13px] font-normal text-cartlist-orange hover:text-orange-600 transition-colors font-sans">
                Login
              </Link>
              <Link to="/register">
                <Button className="h-[34px] px-5 rounded-full bg-[#F07E48] hover:bg-orange-600 text-white font-normal text-[13px] shadow-sm transition-transform active:scale-95 border-0 font-sans">
                  Sign up
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Mobile Menu Trigger & Right side spacer for desktop balance */}
          <div className="flex items-center justify-end md:flex-1 md:hidden">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="group p-2 relative w-10 h-10 flex flex-col justify-center items-center rounded-full hover:bg-black/[0.03] transition-all active:scale-90"
            >
              <div className="flex flex-col gap-1.5 items-end">
                <motion.span 
                  animate={isMenuOpen ? { rotate: 45, y: 6, width: "1.5rem" } : { rotate: 0, y: 0, width: "1.5rem" }}
                  className="h-0.5 bg-gray-900 rounded-full origin-center"
                />
                <motion.span 
                  animate={isMenuOpen ? { opacity: 0, x: 10 } : { opacity: 1, x: 0 }}
                  className="w-4 h-0.5 bg-gray-900 rounded-full"
                />
                <motion.span 
                  animate={isMenuOpen ? { rotate: -45, y: -6, width: "1.5rem" } : { rotate: 0, y: 0, width: "1.25rem" }}
                  className="h-0.5 bg-gray-900 rounded-full origin-center"
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-black/10 backdrop-blur-md md:hidden"
            />
            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%", opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.5 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] z-[70] bg-white md:hidden flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.1)]"
            >
              <div className="p-8 flex flex-col h-full">
                <div className="flex justify-between items-center mb-16">
                  <Logo />
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2.5 text-gray-900 bg-gray-100/50 hover:bg-gray-100 rounded-full transition-all active:scale-90"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="flex flex-col gap-8">
                  {[
                    ...navLinks, 
                    { label: "Login", to: "/login" }, 
                    { label: "Sign up", to: "/register" }
                  ].map((link, i) => (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
                    >
                      <Link 
                        to={link.to}
                        onClick={() => setIsMenuOpen(false)}
                        className={`text-[40px] font-bold font-sans tracking-tight leading-none group flex items-center justify-between ${
                          link.label === "Login" || link.label === "Sign up" 
                          ? "text-cartlist-orange" 
                          : "text-black"
                        }`}
                      >
                        <span>{link.label}</span>
                        <motion.span 
                          initial={{ scale: 0 }}
                          whileHover={{ scale: 1 }}
                          className="w-3 h-3 bg-current rounded-full" 
                        />
                      </Link>
                    </motion.div>
                  ))}
                </div>

                
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section - Very Compact */}
      <section className="relative pt-24 pb-12 flex flex-col items-center justify-center">
        <div className="w-full relative z-10 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            {/* Extremely compact heading */}
            <h1 className="text-[48px] md:text-[64px] lg:text-[76px] font-black tracking-[-0.05em] leading-[1.1] text-[#1A1A1A] mb-4 flex flex-col items-center gap-2 font-heading">
              <span>Every order</span>
              <span className="flex items-center gap-2">
                in <span className="text-cartlist-orange">check</span>
              </span>
            </h1>

            {/* Arc-scrolling Gallery */}
            <CurvedHeroGallery />

            <div className="max-w-xl mx-auto flex flex-col items-center gap-3 px-4">
              <p className="text-[14px] md:text-[15px] mt-7 text-gray-500 font-medium leading-[1.4] max-w-sm mx-auto">
                Track your stockpile orders, stay organized, and manage everything in one place.
              </p>

              <Link to="/register">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="h-[48px] px-10 rounded-[16px] bg-[#F07E48] hover:bg-orange-600 text-white text-[15px] font-medium-black shadow-lg shadow-orange-300/20 border-0">
                    Get started
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Project Showcase Section */}
      <section className="px-6 flex flex-col items-center py-20 lg:py-32 bg-[#FDF8F3] relative z-20">
        <h2 className="text-[20px] md:text-[24px] lg:text-[28px] font-black leading-[1.1] text-[#1A1A1A] max-w-2xl mx-auto text-center mb-12 font-semibold tracking-tight">
          With Cartlist, we want you to feel less stress in managing your customers heavy stockpile in one place
        </h2>
        {[
          { 
            img: "https://res.cloudinary.com/dpsvazol5/image/upload/v1777936742/Component_9_lhgyen.png",
            mobileImg: "https://res.cloudinary.com/dpsvazol5/image/upload/v1777990019/Group_40_liwu2r.png"
          },
          { 
            img: "https://res.cloudinary.com/dpsvazol5/image/upload/v1777967539/Group_30_rase2l.png",
            mobileImg: "https://res.cloudinary.com/dpsvazol5/image/upload/v1777990685/Group_41_dpnsv3.png"
          },
          { 
            img: "https://res.cloudinary.com/dpsvazol5/image/upload/v1777967656/Group_29_nvtlcp.png",
            mobileImg: "https://res.cloudinary.com/dpsvazol5/image/upload/v1777990796/Group_42_qzqyed.png"
          },
          { 
            img: "https://res.cloudinary.com/dpsvazol5/image/upload/v1777967872/Group_32_nmrbpa.png",
            mobileImg: "https://res.cloudinary.com/dpsvazol5/image/upload/v1777990891/Group_43_jxw33e.png"
          },
          { 
            img: "https://res.cloudinary.com/dpsvazol5/image/upload/v1777967870/Group_33_kwnhof.png",
            mobileImg: "https://res.cloudinary.com/dpsvazol5/image/upload/v1777990957/Group_44_cbjkh8.png"
          }
        ].map((project, i) => (
          <ProjectCard key={i} project={project} i={i} />
        ))}
      </section>

      {/* Pricing Section */}
      <section className="bg-[#0A0D14] pt-32 pb-0 px-6 relative overflow-hidden">
        {/* Background Decorative Accent */}
        <div className="absolute -bottom-48 -right-48 w-[600px] h-[600px] bg-[#F07E48]/10 rounded-full blur-[120px]" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[32px] md:text-[48px] font-semibold text-white text-center mb-20 font-heading"
          >
            Pricing we offer
          </motion.h2>

          <div className="relative border-t border-b border-white/10">
            {/* Horizontal Grid Markers */}
            <div className="absolute -top-3 -left-3 text-white/20 select-none">+</div>
            <div className="absolute -top-3 -right-3 text-white/20 select-none">+</div>
            <div className="absolute -bottom-3 -left-3 text-white/20 select-none">+</div>
            <div className="absolute -bottom-3 -right-3 text-white/20 select-none">+</div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 lg:divide-x divide-white/10 border-l border-r border-white/10">
              {[
                {
                  name: "Free Plan",
                  price: null,
                  features: ["Realtime activity log", "Email alert", "WhatsApp copy", "15 Capped logged customers"],
                  button: "Start free plan"
                },
                {
                  name: "Starter Plan",
                  price: "3,500",
                  features: ["Realtime activity log", "Email alert", "24/7 support", "WhatsApp Alert", "50 Capped logged customers"],
                  button: "Start starter plan"
                },
                {
                  name: "Pro Plan",
                  price: "5,000",
                  features: ["Realtime activity log", "Email alert", "24/7 support", "WhatsApp Alert", "100 Capped logged customers"],
                  button: "Start pro plan"
                },
                {
                  name: "Enterprise Plan",
                  price: "10,000",
                  features: ["Realtime activity log", "Email alert", "24/7 support", "WhatsApp Alert", "Data analysis report", "Custom logged based on user"],
                  button: "Start ent plan"
                }
              ].map((plan, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ 
                    initial: { delay: i * 0.1, duration: 0.6 },
                    whileHover: { duration: 0 } 
                  }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    backgroundColor: "rgba(80, 41, 16, 1)",
                    borderColor: "rgba(240, 126, 72, 1)",
                    scale: 1.02,
                    zIndex: 20
                  }}
                  className="p-8 md:p-10 flex flex-col h-full group border border-transparent rounded-[32px] md:rounded-none relative"
                >
                  <h3 className="text-white text-[22px] md:text-[24px] font-bold mb-8 font-heading whitespace-nowrap">{plan.name}</h3>
                  
                  <div className="mb-10 min-h-[60px] flex items-baseline gap-1">
                    {plan.price ? (
                      <>
                        <span className="text-[#F07E48] text-[32px] md:text-[36px] font-bold leading-none tracking-tighter">N{plan.price}/</span>
                        <span className="text-gray-500 group-hover:text-white/60 text-[13px] font-medium uppercase tracking-wider">Month</span>
                      </>
                    ) : (
                      <div className="h-10" />
                    )}
                  </div>

                  <div className="mb-12 flex-grow">
                    <p className="text-white text-[16px] font-bold mb-6">What is in for you</p>
                    <ul className="space-y-4">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-white/70 group-hover:text-white transition-colors">
                          <span className="text-[#F07E48] group-hover:text-white font-bold text-lg leading-none">•</span>
                          <span className="text-[14px] font-medium leading-normal">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button className="w-full py-5 rounded-full border border-white/20 text-white font-bold text-[16px] group-hover:bg-white group-hover:text-[#502910] group-hover:border-white transition-all duration-300">
                    {plan.button}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-[#0A0D14] pt-40 pb-32 px-6 relative overflow-hidden">
        {/* Decorative Swirl Patterns */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
          <svg className="w-full h-full" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100 200 C 50 50, 400 150, 500 400" stroke="#F07E48" strokeWidth="60" strokeLinecap="round" fill="none" />
            <path d="M400 600 C 600 400, 900 600, 1100 300" stroke="#F07E48" strokeWidth="80" strokeLinecap="round" fill="none" />
            <path d="M1200 100 C 1300 300, 1500 200, 1600 500" stroke="#F07E48" strokeWidth="50" strokeLinecap="round" fill="none" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[40px] md:text-[64px] font-black text-white text-center mb-40 font-semibold"
          >
            How it works
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-4 lg:gap-8">
            {[
              {
                number: "1",
                title: "account",
                rotate: -12,
                desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
              },
              {
                number: "2",
                title: "Log",
                rotate: 8,
                desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
              },
              {
                number: "3",
                title: "Notify",
                rotate: -6,
                desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
              },
              {
                number: "4",
                title: "Notify",
                rotate: 15,
                desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 150, rotate: step.rotate * 2, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                transition={{ 
                  delay: i * 0.1, 
                  duration: 1.2, 
                  type: "spring",
                  bounce: 0.4
                }}
                viewport={{ once: true }}
                className="bg-[#16191F] p-8 md:p-10 rounded-[32px] border border-white/5 flex flex-col h-full shadow-2xl relative"
                style={{ originY: 0 }}
              >
                <div className="mb-6">
                  <span className="text-[100px] md:text-[120px] font-black leading-none tracking-tighter bg-gradient-to-b from-white to-white/10 bg-clip-text text-transparent">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-white text-[28px] font-bold mb-4 font-heading">{step.title}</h3>
                <p className="text-gray-400 text-[14px] leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp Integration Section */}
      <section className="bg-white py-12 px-6 relative overflow-hidden border-t border-black/5">
        {/* Background Pattern Overlay - Light version */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.6]"
          style={{ 
            backgroundImage: "url('https://res.cloudinary.com/dpsvazol5/image/upload/v1777942695/WhatsApp_Pattern_light_z3z5zu.png')",
            backgroundRepeat: "repeat",
            backgroundSize: "600px"
          }}
        />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#16191F] rounded-[48px] p-8 md:p-12 lg:p-16 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 border border-white/5 h-auto lg:h-[652px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)]"
          >
            {/* Content Left */}
            <div className="flex-1 w-full z-10 text-left lg:text-left flex flex-col justify-start lg:justify-center h-full lg:pt-32">
              {/* Heading and Logo wrapped for mobile header feel */}
              <div className="flex items-start justify-between w-full lg:block mb-8 lg:mb-6">
                <h2 className="text-[25px] md:text-[32px] lg:text-[40px] font-black text-white leading-[1.1] font-heading max-w-[240px] md:max-w-none">
                  Prefer to manage via WhatsApp?
                </h2>
                
                {/* Mobile version of the 3D WhatsApp Logo - Positioned to the right of title */}
                <motion.div
                  animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="lg:hidden relative w-24 h-24 md:w-32 md:h-32 -mt-2 shrink-0"
                >
                  <img 
                    src="https://res.cloudinary.com/dpsvazol5/image/upload/v1777942132/image_26_ladnnn.png"
                    alt="WhatsApp 3D" 
                    className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(34,197,94,0.4)]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-green-500/15 blur-2xl rounded-full -z-10" />
                </motion.div>
              </div>
              
              <div className="mb-16 lg:mb-0">
                <Link to="#">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-block"
                  >
                    <Button className="h-[48px] px-10 rounded-full bg-[#F07E48] hover:bg-orange-600 text-white font-bold text-[16px] border-0 shadow-[0_10px_20px_-5px_rgba(240,126,72,0.3)]">
                      Try our bot
                    </Button>
                  </motion.div>
                </Link>
              </div>

              {/* Desktop version of the 3D WhatsApp Logo */}
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [-3, 3, -3]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="hidden lg:block mt-20 relative w-full h-auto lg:w-[704px] lg:h-[354px] lg:-ml-40"
              >
                <img 
                   src="https://res.cloudinary.com/dpsvazol5/image/upload/v1777942132/image_26_ladnnn.png"
                  alt="WhatsApp 3D" 
                  className="w-full h-full object-contain object-left filter drop-shadow-[0_20px_40px_rgba(34,197,94,0.3)]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-green-500/10 blur-3xl rounded-full -z-10" />
              </motion.div>
            </div>

            {/* Phone Mockup Right */}
            <div className="flex-1 relative z-10 flex justify-center lg:justify-end items-center h-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 50 }}
                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 1, type: "spring", bounce: 0.3 }}
                viewport={{ once: true }}
                className="relative lg:absolute lg:-bottom-20 lg:right-0"
              >
                <img 
                  src="https://res.cloudinary.com/dpsvazol5/image/upload/v1777941703/Frame_1000004091_tdod1z.png"
                  alt="WhatsApp Phone Mockup"
                  className="w-[280px] md:w-[380px] lg:w-[420px] h-auto drop-shadow-[0_40px_80px_rgba(0,0,0,0.8)]"
                  referrerPolicy="no-referrer"
                />

                {/* Floating Bubbles */}
                <FloatingBubble 
                  text="Track Order 🚚" 
                  className="top-[40%] -left-12 md:-left-20" 
                  delay={0.3}
                />
                <FloatingBubble 
                  text="Cancel Order 📦" 
                  className="top-[15%] -right-8 md:-right-12" 
                  delay={0.6}
                />
                <FloatingBubble 
                  text="Other Issues 💬" 
                  className="bottom-[35%] -right-4 md:-right-8" 
                  delay={0.9}
                />
                
                {/* Visual Glow behind phone */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[80%] bg-green-500/20 blur-[120px] -z-10" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="bg-white py-24 px-6 relative overflow-hidden">
        {/* Visual Glows matching mockup */}
        <div className="absolute top-0 left-0 w-[40%] h-[300px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-0 right-0 w-[30%] h-[200px] bg-orange-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        {/* Background Pattern Overlay - Continued from previous section */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.6]"
          style={{ 
            backgroundImage: "url('https://res.cloudinary.com/dpsvazol5/image/upload/v1777942695/WhatsApp_Pattern_light_z3z5zu.png')",
            backgroundRepeat: "repeat",
            backgroundSize: "600px"
          }}
        />

        <div className="max-w-7xl mx-auto relative z-10 text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-[18px] md:text-[22px] font-bold text-gray-800 mb-4">Don't take our word for it</p>
            <h2 className="text-[16px] md:text-[22px] lg:text-[24px] font-bold text-black leading-[1.1] font-heading">
              Hear from what our <span className="text-[#F07E48]">vendor</span> says
            </h2>
          </motion.div>
        </div>

        <div className="max-w-[100vw] relative z-10 overflow-hidden py-10">
          <div className="flex gap-8 md:gap-12 animate-marquee-testimonial w-max px-6">
            {[
              {
                author: "Miks's collection",
                quote: "Cartlist has simplified how we handle custom orders. We no longer lose track of stockpile requests, and our customers appreciate the transparency. It's an essential tool for any growing vendor in today's market.",
                img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=800"
              },
              {
                author: "Luna's series",
                quote: "The WhatsApp integration is pure magic. I can manage my entire shop's stockpile communication without ever leaving the app. It's saved us hours of administrative work every single week.",
                img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800"
              },
              {
                author: "Kini's Store",
                quote: "Finally, a platform that understands vendors. The interface is intuitive, and the notifications keep me on top of every single order. My customers are happier because I'm more organized.",
                img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800"
              },
              {
                author: "The Luxe Brand",
                quote: "The professional look Cartlist gives our brand is invaluable. It elevates our customer service and makes the difficult task of managing stockpiles feel effortless and standardized.",
                img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800"
              }
            ].concat([
              {
                author: "Miks's collection",
                quote: "Cartlist has simplified how we handle custom orders. We no longer lose track of stockpile requests, and our customers appreciate the transparency. It's an essential tool for any growing vendor in today's market.",
                img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=800"
              },
              {
                author: "Luna's series",
                quote: "The WhatsApp integration is pure magic. I can manage my entire shop's stockpile communication without ever leaving the app. It's saved us hours of administrative work every single week.",
                img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800"
              },
              {
                author: "Kini's Store",
                quote: "Finally, a platform that understands vendors. The interface is intuitive, and the notifications keep me on top of every single order. My customers are happier because I'm more organized.",
                img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800"
              },
              {
                author: "The Luxe Brand",
                quote: "The professional look Cartlist gives our brand is invaluable. It elevates our customer service and makes the difficult task of managing stockpiles feel effortless and standardized.",
                img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800"
              }
            ]).map((testimonial, i) => (
              <TestimonialCard 
                key={i}
                author={testimonial.author}
                quote={testimonial.quote}
                img={testimonial.img}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-24 px-6 relative overflow-hidden">
        {/* Repeating the background pattern for consistency */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.4]"
          style={{ 
            backgroundImage: "url('https://res.cloudinary.com/dpsvazol5/image/upload/v1777942695/WhatsApp_Pattern_light_z3z5zu.png')",
            backgroundRepeat: "repeat",
            backgroundSize: "600px"
          }}
        />

        <div className="max-w-3xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-[32px] md:text-[48px] font-black text-gray-900 mb-4 font-heading">
              Frequently asked questions
            </h2>
            <p className="text-gray-500 text-[16px] md:text-[18px]">
              Everything you need to know about the product and billing.
            </p>
          </div>

          <div className="mb-20">
            {faqs.map((faq, i) => (
              <FAQItem 
                key={i}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFaqIndex === i}
                onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
              />
            ))}
          </div>

          {/* Contact Box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#F9FAFB] rounded-[24px] p-8 text-center"
          >
            {/* Avatar Stack */}
            <div className="flex justify-center -space-x-3 mb-6">
              {[
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&h=100&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&h=100&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&h=100&auto=format&fit=crop"
              ].map((img, i) => (
                <img 
                  key={i}
                  src={img} 
                  alt="Team" 
                  className="w-12 h-12 rounded-full border-[3px] border-white object-cover"
                  referrerPolicy="no-referrer"
                />
              ))}
            </div>
            <h3 className="text-[18px] md:text-[20px] font-bold text-gray-900 mb-2">Still have questions?</h3>
            <p className="text-gray-500 text-[14px] md:text-[16px] mb-8">
              Can't find the answer you're looking for? Please chat to our friendly team.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Button className="h-[48px] px-8 rounded-full bg-white hover:bg-gray-50 text-gray-900 font-bold text-[15px] border border-gray-200 shadow-sm">
                Get in touch
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <footer className="pt-24 pb-0 bg-[#0A0D14] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-20">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            

            {/* Company Links */}
            <div>
              <h3 className="text-[16px] md:text-[18px] font-bold mb-6">Company</h3>
              <ul className="flex flex-col md:flex-row gap-4 md:gap-8 text-gray-400 font-medium text-[14px] md:text-[16px]">
                <li><Link to="#" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">About us</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Contact us</Link></li>
              </ul>
            </div>

            {/* Socials Icons Horizontally */}
            <div>
              <h3 className="text-[16px] md:text-[18px] font-bold mb-6">Socials</h3>
              <div className="flex gap-6">
                {[
                  { name: "Instagram", to: "#", icon: Instagram },
                  { name: "Facebook", to: "#", icon: Facebook },
                  { name: "LinkedIn", to: "#", icon: Linkedin },
                  { name: "X", to: "#", icon: Twitter }
                ].map((social) => (
                  <Link 
                    key={social.name}
                    to={social.to}
                    className="text-gray-400 hover:text-white transition-all transform hover:scale-110"
                    aria-label={social.name}
                  >
                    <social.icon className="w-6 h-6" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Large Brand Image */}
        <div className="w-full mt-12 select-none pointer-events-none">
          <img 
            src="https://res.cloudinary.com/dpsvazol5/image/upload/v1777945310/Frame_1618868206_anma4o.png" 
            alt="CARTLIST" 
            className="w-full h-auto object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </footer>

      <style>{`
        @keyframes marquee-testimonial {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 24px)); }
        }
        .animate-marquee-testimonial {
          animation: marquee-testimonial 60s linear infinite;
        }
        .animate-marquee-testimonial:hover {
          animation-play-state: paused;
        }
        
        @keyframes marquee-slow {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 8px)); }
        }
        .animate-marquee-slow {
          animation: marquee-slow 40s linear infinite;
        }
        .animate-marquee-slow:hover {
          animation-play-state: paused;
        }
        
        /* Simulating curved path by adjusting vertical position as it scrolls */
        /* This is a simple approximation where cards follow a wave */
        
      `}</style>
    </div>
  );
}
