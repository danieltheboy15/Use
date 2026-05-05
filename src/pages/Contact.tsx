import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, Phone, Instagram, Facebook, Linkedin, Twitter, Send } from "lucide-react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const SocialIcon = ({ icon: Icon, href = "#" }: { icon: any; href?: string }) => (
  <a 
    href={href}
    className="w-12 h-12 flex items-center justify-center rounded-lg border border-gray-400 text-gray-700 hover:border-cartlist-orange hover:text-cartlist-orange transition-all"
  >
    <Icon size={24} />
  </a>
);

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form submitted:", formData);
    // Add logic for real integration later if needed
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow pt-24 pb-32 px-6 relative overflow-hidden">
        {/* Map Background Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ 
            backgroundImage: "url('https://res.cloudinary.com/dpsvazol5/image/upload/v1777995325/Map_Background_vvt8yv.png')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left Column: Info */}
          <div className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-[64px] md:text-[80px] font-black text-gray-900 leading-none mb-4 flex items-baseline gap-2 font-heading">
                Contact us
                <span className="w-4 h-4 bg-cartlist-orange rounded-sm inline-block translate-y-[-10px]" />
              </h1>
            </motion.div>

            <div className="mt-16">
              <p className="text-gray-500 text-[18px] mb-6 font-medium">Our socials</p>
              <div className="flex gap-4 mb-16">
                <SocialIcon icon={Instagram} />
                <SocialIcon icon={Facebook} />
                <SocialIcon icon={Linkedin} />
                <SocialIcon icon={Twitter} /> {/* Using Twitter icon as X placeholder if preferred */}
              </div>

              <p className="text-gray-500 text-[18px] mb-8 font-medium">Our contacts</p>
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-gray-900 text-[20px] md:text-[24px] font-bold">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-gray-700" />
                  </div>
                  <span>usecartlist@gmail.com</span>
                </div>
                <div className="flex items-center gap-4 text-gray-900 text-[20px] md:text-[24px] font-bold">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-gray-700" />
                  </div>
                  <span>+234 9040000000</span>
                </div>
                <div className="flex items-center gap-4 text-gray-900 text-[20px] md:text-[24px] font-bold">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <img 
                      src="https://res.cloudinary.com/dpsvazol5/image/upload/v1777995648/WhatsApp_Icon_vnmoxv.png" 
                      alt="WhatsApp" 
                      className="w-6 h-6"
                    />
                  </div>
                  <span>+234 9040000000</span>
                </div>
              </div>
            </div>
            
            {/* Orange side bracket accent from image */}
            <div className="hidden lg:block absolute left-[-40px] top-[20%] bottom-[20%] w-2 bg-cartlist-orange rounded-full opacity-0 lg:opacity-100" />
          </div>

          {/* Right Column: Form Card */}
          <div className="relative lg:translate-y-16 lg:-translate-x-24 max-w-[600px] mx-auto lg:ml-auto lg:mr-0 w-full">
            {/* Decorative Brackets from image */}
            <div className="absolute -top-8 -left-8 w-20 h-20 border-t-8 border-l-8 border-cartlist-orange opacity-80" />
            <div className="absolute -top-8 -right-8 w-20 h-20 border-t-8 border-r-8 border-cartlist-orange opacity-80" />
            <div className="absolute -bottom-8 -left-8 w-20 h-20 border-b-8 border-l-8 border-cartlist-orange opacity-80" />
            <div className="absolute -bottom-8 -right-8 w-20 h-20 border-b-8 border-r-8 border-cartlist-orange opacity-80" />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white rounded-3xl p-8 md:p-10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border border-gray-100 relative z-10"
            >
              <h2 className="text-[24px] md:text-[28px] font-bold text-gray-900 mb-8 flex justify-center">Contact form</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[13px] font-bold text-gray-900 mb-1">Name</label>
                  <Input 
                    placeholder="Enter name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="border-0 border-b border-gray-200 rounded-none px-0 py-3 h-auto focus-visible:ring-0 focus-visible:border-cartlist-orange transition-all placeholder:text-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-900 mb-1">Email</label>
                  <Input 
                    type="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="border-0 border-b border-gray-200 rounded-none px-0 py-3 h-auto focus-visible:ring-0 focus-visible:border-cartlist-orange transition-all placeholder:text-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-900 mb-1">Message</label>
                  <Textarea 
                    placeholder="Enter your message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="border-0 border-b border-gray-200 rounded-none px-0 py-3 h-28 focus-visible:ring-0 focus-visible:border-cartlist-orange transition-all placeholder:text-gray-300 resize-none"
                  />
                </div>

                <div className="pt-6">
                  <Button 
                    type="submit"
                    className="w-full py-6 rounded-xl bg-cartlist-orange hover:bg-orange-600 text-white font-bold text-[15px] shadow-lg shadow-orange-500/20"
                  >
                    Send message
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
