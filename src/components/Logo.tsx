import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

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
