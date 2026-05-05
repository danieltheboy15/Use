import React, { useState } from "react";
import { 
  Settings, 
  Shield, 
  Bell, 
  Database, 
  Globe, 
  Code,
  Save,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Server
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/ui/button";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";

const AdminSettings: React.FC = () => {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  const configGroups = [
    {
      title: "WhatsApp Configuration",
      icon: Bell,
      settings: [
        { name: "Default Welcome Template", value: "stockpile_created", type: "text" },
        { name: "Reminder Threshold (Days)", value: "3", type: "number" },
        { name: "Max Retries for Failures", value: "3", type: "number" },
        { name: "Global Message Delay (ms)", value: "2000", type: "number" },
      ]
    },
    {
      title: "System Feature Flags",
      icon: Zap,
      settings: [
        { name: "Allow New Registrations", value: true, type: "toggle" },
        { name: "Enable Late Fees System", value: true, type: "toggle" },
        { name: "Public Search Indexing", value: false, type: "toggle" },
        { name: "Bulk Email Notifications", value: true, type: "toggle" },
      ]
    },
    {
      title: "Database & Security",
      icon: Shield,
      settings: [
        { name: "JWT Session Timeout", value: "30d", type: "text" },
        { name: "Rate Limit (Req/Min)", value: "100", type: "number" },
        { name: "Admin IP Restricted", value: false, type: "toggle" },
      ]
    }
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight mb-2">System Control</h1>
          <p className="text-gray-500 font-medium font-inter">Global parameters that define how Cartlist operates. Changes here reflect instantly across all vendors.</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="rounded-2xl bg-[#F07E48] hover:bg-[#D96D3A] font-black px-8 h-12 shadow-lg shadow-[#F07E48]/20 gap-2"
        >
          {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" /> : (success ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />)}
          {saving ? "Deploying..." : (success ? "System Updated" : "Save Changes")}
        </Button>
      </header>

      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center gap-3 font-bold text-sm"
        >
           <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
              <CheckCircle2 className="w-5 h-5" />
           </div>
           Configuration successfully propagated to all instances.
        </motion.div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-12">
        {configGroups.map((group, idx) => {
          const Icon = group.icon;
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-[40px] border border-[#F07E48]/10 shadow-sm overflow-hidden"
            >
              <div className="p-8 border-b border-[#F07E48]/5 bg-gray-50/50 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-white border border-[#F07E48]/20 flex items-center justify-center shadow-sm text-[#F07E48]">
                    <Icon className="w-6 h-6" />
                 </div>
                 <h3 className="text-lg font-black text-[#1A1A1A] tracking-tight">{group.title}</h3>
              </div>
              
              <div className="p-8 space-y-6">
                 {group.settings.map((setting, i) => (
                   <div key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <p className="font-black text-[#1A1A1A] text-sm">{setting.name}</p>
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">System Key: config.v1.{setting.name.toLowerCase().replace(/\s+/g, "_")}</p>
                      </div>
                      
                      {setting.type === "toggle" ? (
                        <button className={cn(
                          "w-14 h-8 rounded-full transition-all duration-500 p-1 relative",
                          setting.value ? "bg-[#F07E48]" : "bg-gray-200"
                        )}>
                          <div className={cn(
                            "w-6 h-6 bg-white rounded-full shadow-md transition-all duration-500",
                            setting.value ? "translate-x-6" : "translate-x-0"
                          )} />
                        </button>
                      ) : (
                        <input 
                          type={setting.type}
                          defaultValue={setting.value as any}
                          className="bg-[#FDF8F3] border border-[#F07E48]/10 rounded-xl px-4 py-2 text-sm font-bold text-[#1A1A1A] focus:ring-2 focus:ring-[#F07E48]/40 outline-none transition-all w-full md:w-32"
                        />
                      )}
                   </div>
                 ))}
              </div>
            </motion.div>
          );
        })}

        <div className="bg-rose-50 rounded-[40px] border border-rose-100 shadow-sm p-8 flex flex-col items-center justify-center text-center space-y-4">
           <div className="w-16 h-16 bg-rose-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-rose-500/30">
              <AlertTriangle className="w-8 h-8" />
           </div>
           <div>
              <h4 className="text-xl font-black text-rose-800 tracking-tight">Danger Zone</h4>
              <p className="text-rose-600 font-medium text-sm max-w-xs mt-1">Actions here are irreversible and can lead to massive data loss. Perform with extreme caution.</p>
           </div>
           <div className="flex gap-4 w-full">
              <Button variant="outline" className="flex-1 rounded-2xl h-14 border-rose-200 text-rose-700 font-bold hover:bg-rose-100">Wipe Error Logs</Button>
              <Button variant="outline" className="flex-1 rounded-2xl h-14 border-rose-200 text-rose-700 font-bold hover:bg-rose-100">Force Global Logouts</Button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
