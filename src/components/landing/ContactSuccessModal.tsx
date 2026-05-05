import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, X, Sparkles, Send, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactSuccessModal: React.FC<ContactSuccessModalProps> = ({ 
  isOpen, 
  onClose
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden p-10 text-center"
          >
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="absolute top-6 right-6 rounded-full hover:bg-orange-50 z-10"
            >
              <X className="w-5 h-5" />
            </Button>

            <div className="relative mb-8 pt-4">
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                className="w-24 h-24 bg-cartlist-orange/10 rounded-full flex items-center justify-center mx-auto"
              >
                <div className="w-16 h-16 bg-cartlist-orange rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <Send className="w-8 h-8 text-white translate-x-0.5 -translate-y-0.5" />
                </div>
              </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-3xl sm:text-4xl font-black mb-4 text-gray-900 font-heading">
                Message Sent!
              </h2>
              <p className="text-lg text-gray-500 mb-8 leading-relaxed max-w-sm mx-auto">
                Thank you for reaching out! We've received your message and we'll get back to you shortly.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              
              
              
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
