import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { cn } from "../lib/utils";

export const Logo = ({ className = "" }: { className?: string }) => {
  const location = useLocation();
  const { theme } = useTheme();
  
  // Define dashboard route prefixes
  const dashboardPrefixes = ["/dashboard", "/stockpile", "/customers", "/settings"];
  const isDashboardRoute = dashboardPrefixes.some(p => 
    location.pathname === p || location.pathname.startsWith(p + "/")
  );

  const destination = isDashboardRoute ? "/dashboard" : "/";
  
  const defaultLogo = "https://raw.githubusercontent.com/DannyYo696/svillage/cfdfd8520f96d8d336b2d00597bb7e5bde1cde14/cl%20logo.png";
  const darkLogo = "https://res.cloudinary.com/dpsvazol5/image/upload/v1778014674/cartlist_dark_mode_dexlkz.png";
  
  const isDarkLogo = isDashboardRoute && theme === "dark";
  const logoSrc = isDarkLogo ? darkLogo : defaultLogo;

  return (
    <Link to={destination} className={`flex items-center ${className}`}>
      <img 
        src={logoSrc} 
        alt="Cartlist" 
        className={cn(
          "w-auto transition-all",
          isDarkLogo ? "h-16 md:h-20" : "h-8 md:h-10"
        )} 
        referrerPolicy="no-referrer"
      />
    </Link>
  );
};
