import React, { useEffect, useState } from "react";
import { 
  MessageSquare, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Phone,
  Store,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Search,
  ChevronRight,
  Filter
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";
import { formatDistanceToNow } from "date-fns";

interface MessageLog {
  _id: string;
  recipientPhone: string;
  templateName: string;
  status: "sent" | "delivered" | "failed" | "read";
  error?: string;
  messageId?: string;
  createdAt: string;
  vendorId?: {
    businessName: string;
  };
  stockpileId?: {
    customerName: string;
  };
}

const AdminWhatsApp: React.FC = () => {
  const { fetchWithAuth } = useAuth();
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [view, setView] = useState<"messages" | "webhooks">("messages");
  const [retryLoading, setRetryLoading] = useState<string | null>(null);

  useEffect(() => {
    if (view === "messages") {
      fetchLogs();
    } else {
      fetchWebhookLogs();
    }
  }, [filterStatus, view]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const url = filterStatus === "all" ? "/api/admin/message-logs" : `/api/admin/message-logs?status=${filterStatus}`;
      const res = await fetchWithAuth(url);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error("Fetch logs error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWebhookLogs = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth("/api/admin/webhook-logs");
      if (res.ok) {
        const data = await res.json();
        setWebhookLogs(data);
      }
    } catch (err) {
      console.error("Fetch webhooks error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (logId: string) => {
    try {
      setRetryLoading(logId);
      const res = await fetchWithAuth(`/api/admin/message-logs/${logId}/retry`, { method: "POST" });
      if (res.ok) {
        // Refresh logs after successful retry
        fetchLogs();
      }
    } catch (err) {
      console.error("Retry failed:", err);
    } finally {
      setRetryLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight">Messaging Hub</h1>
            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200">
              Kapso API: Online
            </div>
          </div>
          <p className="text-gray-500 font-medium max-w-2xl">This is your product's lifeline. Monitor WhatsApp delivery status, debug failed deliveries, and maintain your core interaction engine.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-[#F07E48]/10 shadow-sm">
          <button
            onClick={() => setView("messages")}
            className={cn(
              "px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300",
              view === "messages" 
                ? "bg-[#1A1A1A] text-white shadow-lg" 
                : "text-gray-400 hover:text-[#1A1A1A] hover:bg-gray-50"
            )}
          >
            Outbound Traffic
          </button>
          <button
            onClick={() => setView("webhooks")}
            className={cn(
              "px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300",
              view === "webhooks" 
                ? "bg-[#1A1A1A] text-white shadow-lg" 
                : "text-gray-400 hover:text-[#1A1A1A] hover:bg-gray-50"
            )}
          >
            Inbound Webhooks
          </button>
        </div>
      </header>

      {view === "messages" && (
        <div className="flex justify-end">
          <div className="flex bg-gray-50 p-1 rounded-xl">
            {(["all", "sent", "failed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={cn(
                  "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                  filterStatus === s 
                    ? "bg-white text-[#1A1A1A] shadow-sm" 
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Real-time feed of messages */}
      <div className="grid grid-cols-1 gap-4">
        {view === "messages" ? (
          <>
            <AnimatePresence mode="popLayout">
              {logs.map((log, idx) => (
                <motion.div
                  key={log._id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    "bg-white p-6 rounded-[32px] border transition-all duration-500 group flex flex-col md:flex-row md:items-center justify-between gap-6",
                    log.status === "failed" ? "border-rose-200 shadow-lg shadow-rose-500/5 bg-rose-50/10" : "border-[#F07E48]/10 hover:shadow-xl hover:shadow-[#F07E48]/5"
                  )}
                >
                  <div className="flex items-center gap-6 flex-1 min-w-0">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-white relative shadow-sm",
                      log.status === "failed" ? "bg-rose-500 text-white" : "bg-[#F07E48] text-white"
                    )}>
                      <MessageSquare className="w-6 h-6" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-lg flex items-center justify-center shadow-md border border-gray-50">
                        {log.status === "failed" ? <AlertCircle className="w-4 h-4 text-rose-500" /> : <ShieldCheck className="w-4 h-4 text-green-500" />}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap text-left">
                        <span className="font-black text-[#1A1A1A] truncate max-w-[150px]">{log.stockpileId?.customerName || "System Message"}</span>
                        <ArrowRight className="w-3 h-3 text-gray-300" />
                        <span className="text-gray-400 font-bold text-xs">+{log.recipientPhone}</span>
                        <div className="w-1 h-1 bg-gray-300 rounded-full mx-1" />
                        <span className="text-[10px] font-black uppercase text-[#F07E48] tracking-widest">{log.templateName.replace(/_/g, " ")}</span>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] font-bold text-gray-400">
                        <div className="flex items-center gap-1.5 hover:text-[#1A1A1A] transition-colors cursor-default">
                          <Store className="w-3 h-3" />
                          <span>{log.vendorId?.businessName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 opacity-60" />
                          <span>{formatDistanceToNow(new Date(log.createdAt))} ago</span>
                        </div>
                        {log.messageId && (
                          <div className="flex items-center gap-1.5 opacity-60 font-mono text-[9px]">
                            ID: {log.messageId.substring(0, 8)}...
                          </div>
                        )}
                      </div>
                      {log.status === "failed" && log.error && (
                        <div className="mt-2 text-[11px] font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 flex items-center gap-2">
                          <AlertCircle className="w-3 h-3" />
                          <span>Meta API: {log.error}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {log.status === "failed" ? (
                      <Button 
                        onClick={() => handleRetry(log._id)}
                        disabled={retryLoading === log._id}
                        className="rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black px-6 h-12 shadow-lg shadow-rose-600/20 gap-2 border-0"
                      >
                        {retryLoading === log._id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4 shadow-sm" />}
                        Retry Interaction
                      </Button>
                    ) : (
                      <div className="px-6 py-3 bg-green-50 text-green-700 font-black text-xs uppercase tracking-widest rounded-2xl flex items-center gap-2 border border-green-100/50">
                        <CheckCircle2 className="w-4 h-4" />
                        Delivered
                      </div>
                    )}
                    <Button variant="ghost" size="icon" className="rounded-2xl w-12 h-12 border border-[#F07E48]/5 hover:bg-gray-50">
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {logs.length === 0 && !loading && (
              <div className="p-24 text-center bg-white rounded-[40px] border border-dashed border-[#F07E48]/20">
                <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-6" />
                <h4 className="text-xl font-black text-[#1A1A1A] mb-2">Silence is golden?</h4>
                <p className="text-gray-500 font-medium">No messages found in logs for the selected filter.</p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            {webhookLogs.map((log) => (
              <div key={log._id} className="bg-white p-8 rounded-[40px] border border-[#F07E48]/10 overflow-hidden text-left relative group hover:border-[#F07E48]/30 transition-all duration-300">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-[#1A1A1A] leading-none mb-1">Incoming Webhook</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{formatDistanceToNow(new Date(log.timestamp))} ago</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-gray-300">#{log._id.slice(-8)}</span>
                </div>
                <div className="bg-gray-900 rounded-3xl p-6 relative">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500/30" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500/30" />
                    <div className="w-2 h-2 rounded-full bg-green-500/30" />
                  </div>
                  <pre className="text-[10px] text-blue-400 font-mono overflow-x-auto selection:bg-blue-500/30">
                    {JSON.stringify(log.payload, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
            {webhookLogs.length === 0 && !loading && (
              <div className="p-24 text-center bg-white rounded-[40px] border border-dashed border-[#F07E48]/20">
                <RefreshCw className="w-12 h-12 text-gray-200 mx-auto mb-6 animate-spin-slow" />
                <h4 className="text-xl font-black text-[#1A1A1A] mb-2">Waiting for life...</h4>
                <p className="text-gray-500 font-medium">No webhook hits detected yet. Send 'ping' to your business number!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWhatsApp;
