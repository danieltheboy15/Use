import React, { useState, useEffect, useRef } from "react";
import { 
  Settings as SettingsIcon, 
  Edit, 
  ChevronDown, 
  User, 
  Bell, 
  Camera,
  Globe,
  Clock,
  CircleDollarSign
} from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/contexts/ToastContext";
import { reduceImageSize } from "@/lib/imageCompressor";

export default function Settings() {
  const { user, updateProfile, fetchWithAuth } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);

  // States for Profile Tab
  const [profileData, setProfileData] = useState({
    businessName: user?.businessName || "",
    firstName: user?.ownerName?.split(' ')[0] || "",
    lastName: user?.ownerName?.split(' ')[1] || "",
    whatsappNumber: user?.whatsappNumber || "",
    gender: user?.gender || "Female",
    language: user?.language || "English",
    timezone: user?.timezone || "+1 GMT",
    currency: user?.currency || "Naira"
  });

  // State for Notifications Tab
  const [notificationPrefs, setNotificationPrefs] = useState({
    email: user?.notifications?.stockpileUpdates?.email ?? true,
    sms: user?.notifications?.stockpileUpdates?.sms ?? true,
    push: user?.notifications?.stockpileUpdates?.push ?? true,
    inApp: user?.notifications?.stockpileUpdates?.inApp ?? true
  });

  // Sync state with user data
  useEffect(() => {
    if (user) {
      setProfileData({
        businessName: user.businessName || "",
        firstName: user.ownerName?.split(' ')[0] || "",
        lastName: user.ownerName?.split(' ')[1] || "",
        whatsappNumber: user.whatsappNumber || "",
        gender: user.gender || "Female",
        language: user.language || "English",
        timezone: user.timezone || "+1 GMT",
        currency: user.currency || "Naira"
      });
      setNotificationPrefs({
        email: user.notifications?.stockpileUpdates?.email ?? true,
        sms: user.notifications?.stockpileUpdates?.sms ?? true,
        push: user.notifications?.stockpileUpdates?.push ?? true,
        inApp: user.notifications?.stockpileUpdates?.inApp ?? true
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsUpdating(true);
    const success = await updateProfile({
      businessName: profileData.businessName,
      ownerName: `${profileData.firstName} ${profileData.lastName}`.trim(),
      whatsappNumber: profileData.whatsappNumber,
      gender: profileData.gender,
      language: profileData.language,
      timezone: profileData.timezone,
      currency: profileData.currency
    });
    setIsUpdating(false);
    if (success) {
      showToast("Profile updated successfully");
    } else {
      showToast("Failed to update profile", "error");
    }
  };

  const handleToggleNotification = async (key: keyof typeof notificationPrefs) => {
    const updatedPrefs = { ...notificationPrefs, [key]: !notificationPrefs[key] };
    setNotificationPrefs(updatedPrefs);
    
    // Auto-save notification settings
    const success = await updateProfile({
      notifications: {
        ...(user?.notifications || {
          stockpileUpdates: { email: true, sms: true, push: true, inApp: true },
          reminders: { email: true, sms: true, push: true, inApp: true },
          customerActivity: { email: true, sms: false, push: true, inApp: true },
          systemAlerts: { email: true, sms: false, push: true, inApp: true }
        }),
        stockpileUpdates: updatedPrefs
      }
    });

    if (!success) {
      // Revert if failed
      setNotificationPrefs(notificationPrefs);
      showToast("Failed to update notification settings", "error");
    }
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB max upload, but reduce to under 2MB for profile representation)
    if (file.size > 5 * 1024 * 1024) {
      showToast("File size too large. Please select an image under 5MB.", "error");
      return;
    }

    setIsUploadingPicture(true);
    try {
      // Compress the image to ensure it is under 2MB
      const compressedBase64 = await reduceImageSize(file);
      const success = await updateProfile({ profilePicture: compressedBase64 });
      if (success) {
        showToast("Profile picture updated successfully");
      } else {
        showToast("Failed to update profile picture", "error");
      }
    } catch (error) {
      console.error("Error reducing or uploading file:", error);
      showToast("Error processing profile picture", "error");
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notification", label: "Notification", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-slate-950 relative overflow-hidden transition-colors">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-orange-100/40 dark:from-orange-950/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl -z-10" />
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-orange-50/20 dark:bg-orange-950/10 rounded-full blur-2xl -z-10" />
      
      {/* Dot Grid Pattern */}
      <div className="absolute top-20 right-20 grid grid-cols-6 gap-6 -z-10 opacity-20 dark:opacity-10">
        {[...Array(36)].map((_, i) => (
          <div key={i} className="w-2 h-2 bg-cartlist-orange rounded-full" />
        ))}
      </div>

      <Header />

      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-10 relative">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-500 dark:text-slate-400 font-medium">Manage and control your profile</p>
        </div>

        {/* Tabs */}
        <div className="bg-[#F3F3F3] dark:bg-slate-900 p-1 rounded-2xl w-fit flex gap-1 mb-10 transition-colors">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === tab.id 
                  ? "bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm" 
                  : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {activeTab === "profile" ? (
            <>
              {/* Left Column: Personal Information */}
              <div className="lg:col-span-7">
                <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[32px] p-8 md:p-10 transition-colors">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Personal information</h2>
                      <p className="text-gray-400 dark:text-slate-500 text-sm font-medium">These are your personal details, they are visible to the public</p>
                    </div>
                    <Button variant="outline" className="rounded-full px-6 h-12 gap-2 border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-300 font-bold hover:bg-gray-50 dark:hover:bg-slate-800">
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                  </div>

                  <div className="flex items-center gap-6 mb-10">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl bg-orange-100 dark:bg-orange-950/20 flex items-center justify-center relative">
                        <img 
                          src={user?.profilePicture || "https://raw.githubusercontent.com/DannyYo696/svillage/29b4c24e6ca88b3ecf3856f30fceb3f29eef40bf/profile%20picture.webp"} 
                          alt="Profile" 
                          className={`w-full h-full object-cover transition-opacity ${isUploadingPicture ? 'opacity-40' : 'opacity-100'}`}
                        />
                        {isUploadingPicture && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-cartlist-orange border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingPicture}
                        className="absolute bottom-0 right-0 w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center text-cartlist-orange hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors border-2 border-white dark:border-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Camera className="w-5 h-5" />
                      </button>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">{user?.businessName || "Your Business Name"}</h3>
                      <p className="text-gray-500 dark:text-slate-400 font-medium">{user?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-slate-300">Business name</label>
                      <div className="p-4 rounded-xl bg-[#F8F9FB] dark:bg-slate-950 border border-transparent opacity-60">
                        <input 
                          type="text" 
                          value={profileData.businessName} 
                          readOnly
                          className="w-full bg-transparent outline-none text-gray-900 dark:text-white font-bold cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-slate-300">Email</label>
                      <div className="p-4 rounded-xl bg-[#F8F9FB] dark:bg-slate-950 border border-transparent opacity-60">
                        <input 
                          type="email" 
                          value={user?.email} 
                          readOnly
                          className="w-full bg-transparent outline-none text-gray-900 dark:text-white font-bold cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-slate-300">First name</label>
                      <div className="p-4 rounded-xl bg-[#F8F9FB] dark:bg-slate-950 border border-transparent focus-within:border-cartlist-orange transition-colors">
                        <input 
                          type="text" 
                          value={profileData.firstName} 
                          onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                          className="w-full bg-transparent outline-none text-gray-900 dark:text-white font-bold"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-slate-300">Last name</label>
                      <div className="p-4 rounded-xl bg-[#F8F9FB] dark:bg-slate-950 border border-transparent focus-within:border-cartlist-orange transition-colors">
                        <input 
                          type="text" 
                          value={profileData.lastName} 
                          onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                          className="w-full bg-transparent outline-none text-gray-900 dark:text-white font-bold"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-slate-300">phone number</label>
                      <div className="flex gap-2">
                        <div className="w-24 p-4 rounded-xl bg-[#F8F9FB] dark:bg-slate-950 border border-transparent flex items-center justify-between gap-2 opacity-60">
                          <span className="text-gray-900 dark:text-white font-bold">+234</span>
                          <ChevronDown className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                        </div>
                        <div className="flex-1 p-4 rounded-xl bg-[#F8F9FB] dark:bg-slate-950 border border-transparent opacity-60">
                          <input 
                            type="tel" 
                            readOnly
                            value={profileData.whatsappNumber}
                            className="w-full bg-transparent outline-none text-gray-900 dark:text-white font-bold cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-slate-300">Gender</label>
                      <Select 
                        value={profileData.gender} 
                        onValueChange={(val) => setProfileData({...profileData, gender: val})}
                      >
                        <SelectTrigger className="w-full p-8 rounded-xl bg-[#F8F9FB] dark:bg-slate-950 border-transparent font-bold text-gray-900 dark:text-white focus:ring-0">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column: General Preference */}
              <div className="lg:col-span-5">
                <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[32px] p-8 md:p-10 flex flex-col h-full transition-colors">
                  <div className="mb-10">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">General preference</h2>
                    <p className="text-gray-400 dark:text-slate-500 text-sm font-medium">These are your personal details, they are visible to the public</p>
                  </div>

                  <div className="space-y-8 flex-1">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-900 dark:text-white">Language</label>
                      <Select 
                        value={profileData.language}
                        onValueChange={(val) => setProfileData({...profileData, language: val})}
                      >
                        <SelectTrigger className="w-full h-14 rounded-xl border-gray-200 dark:border-slate-800 px-6 font-bold text-gray-900 dark:text-white focus:ring-1 focus:ring-cartlist-orange transition-colors">
                          <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-900 dark:text-white">Time zone</label>
                      <Select 
                        value={profileData.timezone}
                        onValueChange={(val) => setProfileData({...profileData, timezone: val})}
                      >
                        <SelectTrigger className="w-full h-14 rounded-xl border-gray-200 dark:border-slate-800 px-6 font-bold text-gray-900 dark:text-white focus:ring-1 focus:ring-cartlist-orange transition-colors">
                          <SelectValue placeholder="Select Time Zone" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                          <SelectItem value="gmt">GMT</SelectItem>
                          <SelectItem value="+1 GMT">+1 GMT</SelectItem>
                          <SelectItem value="+2 GMT">+2 GMT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-900 dark:text-white">Currency</label>
                      <Select 
                        value={profileData.currency}
                        onValueChange={(val) => setProfileData({...profileData, currency: val})}
                      >
                        <SelectTrigger className="w-full h-14 rounded-xl border-gray-200 dark:border-slate-800 px-6 font-bold text-gray-900 dark:text-white focus:ring-1 focus:ring-cartlist-orange transition-colors">
                          <SelectValue placeholder="Select Currency" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                          <SelectItem value="Naira">Naira</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-10">
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={isUpdating}
                      className="w-full md:w-fit px-10 h-14 rounded-2xl bg-cartlist-orange hover:bg-orange-600 text-white font-black shadow-lg shadow-orange-100 dark:shadow-none transition-all transform active:scale-95"
                    >
                      {isUpdating ? "Saving..." : "Save changes"}
                    </Button>
                  </div>
                </Card>
              </div>
            </>
          ) : (
            <div className="lg:col-span-12">
              <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[32px] p-8 md:p-10 transition-colors">
                <div className="mb-10">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Notification preferences</h2>
                  <p className="text-gray-400 dark:text-slate-500 text-sm font-medium">Manage how you receive notifications and stay up-to-date</p>
                </div>

                <div className="space-y-4">
                  {[
                    { 
                      id: "email", 
                      label: "Email notifications", 
                      desc: "Receive updates and important information.",
                      status: notificationPrefs.email
                    },
                    { 
                      id: "sms", 
                      label: "SMS alerts", 
                      desc: "Get instant updates via text messages.",
                      status: notificationPrefs.sms,
                      comingSoon: true
                    },
                    { 
                      id: "push", 
                      label: "Push notifications", 
                      desc: "Stay informed with alerts on your device.",
                      status: notificationPrefs.push
                    },
                    { 
                      id: "inApp", 
                      label: "In-app notifications", 
                      desc: "Receive updates while using the application.",
                      status: notificationPrefs.inApp
                    },
                  ].map((item) => (
                    <div 
                      key={item.id} 
                      className="p-8 rounded-[24px] bg-[#F8F9FB] dark:bg-slate-950 flex items-center justify-between group hover:bg-orange-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white">{item.label}</h3>
                          {item.comingSoon && (
                            <span className="text-[10px] font-bold bg-gray-200 dark:bg-slate-800 text-gray-500 dark:text-slate-400 px-2 py-0.5 rounded-full uppercase">Coming soon</span>
                          )}
                        </div>
                        <p className="text-gray-500 dark:text-slate-500 text-sm font-medium">{item.desc}</p>
                      </div>
                      <Switch 
                        checked={item.status} 
                        onCheckedChange={() => handleToggleNotification(item.id as any)}
                        disabled={item.comingSoon}
                        className="data-[state=checked]:bg-cartlist-orange"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Decorative Organic Shapes - subtly adjusted for dark mode */}
      <div className="absolute bottom-0 right-0 w-[800px] h-[500px] -z-10 opacity-10 dark:opacity-5 blur-3xl translate-y-1/2 translate-x-1/4">
        <div className="w-full h-full bg-gradient-to-l from-cartlist-orange to-[#8B4513] rounded-full rotate-12" />
      </div>
      <div className="absolute bottom-0 right-0 w-full h-[500px] -z-10 pointer-events-none translate-y-1/2 translate-x-1/4 rotate-45 opacity-60 dark:opacity-20 transition-opacity">
        <div className="w-[150%] h-[200px] bg-cartlist-orange rounded-full mb-10 translate-x-1/4" />
        <div className="w-[150%] h-[200px] bg-[#8B4513] rounded-full mb-10 translate-x-1/4" />
        <div className="w-[150%] h-[200px] bg-cartlist-orange rounded-full translate-x-1/4" />
      </div>
    </div>
  );
}
