import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Linkedin, Twitter } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="pt-24 pb-0 bg-[#0A0D14] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-20">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          {/* Company Links */}
          <div>
            <h3 className="text-[16px] md:text-[18px] font-bold mb-6">Company</h3>
            <ul className="flex flex-col md:flex-row gap-4 md:gap-8 text-gray-400 font-medium text-[14px] md:text-[16px]">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/#about" className="hover:text-white transition-colors">About us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact us</Link></li>
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
  );
};
