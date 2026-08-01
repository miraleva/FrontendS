import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    Activity,
    CheckCircle2,
    XCircle,
    Clock,
    RefreshCw,
    Search,
    AlertTriangle,
    ArrowDownRight,
    Server,
} from "lucide-react";
import api from "../../services/api.js";

export default function TourVisioErrors() {
    const { t } = useTranslation();
    const [data, setData] = useState({ averageLatencies: {}, logs: [] });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedRow, setExpandedRow] = useState(null);

    const fetchHealthData = (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);

        const token = localStorage.getItem('token') || sessionStorage.getItem('token') || localStorage.getItem('adminToken') || "";
        api.get("/api/admin/api-health", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then((res) => {
                if (res.data) {
                    setData(res.data);
                }
            })
            .catch((err) => {
                console.error("Error fetching TourVisio API health:", err);
            })
            .finally(() => {
                setLoading(false);
                setRefreshing(false);
            });
    };

    useEffect(() => {
        fetchHealthData();
        // Auto refresh every 7 seconds
        const interval = setInterval(() => {
            fetchHealthData(true);
        }, 7000);
        return () => clearInterval(interval);
    }, []);

    // Format Payload Helper (JSON Pretty Print)
    const formatPayload = (payload) => {
        if (!payload) return "-";
        try {
            const parsed = typeof payload === "string" ? JSON.parse(payload) : payload;
            return JSON.stringify(parsed, null, 2);
        } catch (e) {
            return payload;
        }
    };

    // Format Timestamp Helper
    const formatTime = (timeStr) => {
        if (!timeStr) return "-";
        try {
            const date = new Date(timeStr);
            return date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        } catch (e) {
            return timeStr;
        }
    };

    // Error Resolution Suggestion Helper
    const getErrorResolutionSuggestion = (log) => {
        if (log.success) return null;
        
        const statusCode = log.statusCode;
        const errMsg = (log.errorMessage || "").toLowerCase();
        
        if (statusCode === 401 || errMsg.includes("unauthorized") || errMsg.includes("invalid token")) {
            return "Kimlik doğrulama hatası (401). TourVisio API token'ının süresi dolmuş veya hatalı olabilir. Lütfen 'start-local.ps1' dosyasındaki TOURVISIO_USERNAME ve TOURVISIO_PASSWORD bilgilerini doğrulayın.";
        }
        if (statusCode === 403) {
            return "Yetki erişim hatası (403). Kullandığınız acente kodu (TOURVISIO_AGENCY) veya kullanıcının bu işlemi gerçekleştirmek için yetkisi bulunmuyor. Acente yetkilendirmelerini kontrol edin.";
        }
        if (statusCode === 404) {
            return "Kaynak bulunamadı hatası (404). İstek yapılan servis adresi hatalı veya sorgulanan otel/uçuş verileri TourVisio tarafında mevcut değil. URI yolunu kontrol edin.";
        }
        if (statusCode === 504 || errMsg.includes("timeout") || errMsg.includes("sockettimeoutexception")) {
            return "Zaman aşımı hatası (504/Timeout). TourVisio API sunucusu belirlenen sürede yanıt vermedi. İnternet bağlantısını kontrol edin veya 'application.properties' dosyasındaki read-timeout süresini yükseltin.";
        }
        if (errMsg.includes("connection refused") || errMsg.includes("connectexception") || errMsg.includes("unknownhostexception")) {
            return "Bağlantı hatası (Connection Refused). TourVisio dış sunucusuna erişilemiyor. İnternet bağlantınızı veya 'TOURVISIO_BASE_URL' adresinin aktifliğini kontrol edin.";
        }
        if (statusCode >= 500) {
            return "Dış sunucu hatası (500). TourVisio API sisteminde içsel bir problem oluştu. İstek parametrelerini veya JSON/XML gövdesini (Request Body) kontrol edin; geçersiz biçimlendirilmiş veriler sunucu hatasına yol açıyor olabilir.";
        }
        return "Bilinmeyen entegrasyon hatası. İstek gövdesinde gönderilen verilerle yanıt parametrelerinin (Request/Response) yapısını inceleyin.";
    };

    // Latency Color Helper
    const getLatencyColor = (ms) => {
        if (ms < 350) return "text-emerald-500";
        if (ms < 750) return "text-amber-500";
        return "text-rose-500";
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                        <Server className="text-rose-500" />
                        {t("tourvisio_errors_page.title", "TourVisio Entegrasyon Hataları")}
                    </h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                        {t("tourvisio_errors_page.description", "TourVisio XML/JSON dış servis entegrasyonu gecikme süreleri ve bağlantı hata logları.")}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => fetchHealthData()}
                    disabled={refreshing}
                    className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-rose-500 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800"
                >
                    <RefreshCw size={15} className={refreshing ? "animate-spin text-rose-500" : ""} />
                    {refreshing ? t("common.refreshing", "Güncelleniyor...") : t("common.refresh", "Yenile")}
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-400">
                    <span className="inline-block animate-pulse text-sm">{t("common.loading", "API Durumu Yükleniyor...")}</span>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Canlı Gecikme Süreleri (Latencies) */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                        {/* Otel Arama Latency */}
                        <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900/50 space-y-3">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">OTEL ARAMA LİMİTİ</span>
                            <div className="flex justify-between items-baseline">
                                <h3 className="text-2xl font-extrabold text-gray-800 dark:text-white">
                                    {data.averageLatencies.HotelSearch || 0} ms
                                </h3>
                                <span className={`text-[10px] font-bold ${getLatencyColor(data.averageLatencies.HotelSearch)}`}>
                                    {data.averageLatencies.HotelSearch < 500 ? "KARARLI" : "YAVAŞ"}
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-rose-500 rounded-full"
                                    style={{ width: `${Math.min((data.averageLatencies.HotelSearch / 1500) * 100, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Uçuş Arama Latency */}
                        <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900/50 space-y-3">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">UÇUŞ SORGULAMA</span>
                            <div className="flex justify-between items-baseline">
                                <h3 className="text-2xl font-extrabold text-gray-800 dark:text-white">
                                    {data.averageLatencies.FlightSearch || 0} ms
                                </h3>
                                <span className={`text-[10px] font-bold ${getLatencyColor(data.averageLatencies.FlightSearch)}`}>
                                    {data.averageLatencies.FlightSearch < 700 ? "KARARLI" : "YAVAŞ"}
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${Math.min((data.averageLatencies.FlightSearch / 1500) * 100, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Kimlik Doğrulama Latency */}
                        <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900/50 space-y-3">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">KİMLİK DOĞRULAMA (AUTH)</span>
                            <div className="flex justify-between items-baseline">
                                <h3 className="text-2xl font-extrabold text-gray-800 dark:text-white">
                                    {data.averageLatencies.Auth || 0} ms
                                </h3>
                                <span className={`text-[10px] font-bold ${getLatencyColor(data.averageLatencies.Auth)}`}>
                                    {data.averageLatencies.Auth < 400 ? "HIZLI" : "NORMAL"}
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-amber-500 rounded-full"
                                    style={{ width: `${Math.min((data.averageLatencies.Auth / 1000) * 100, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Detay Sorgulama Latency */}
                        <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900/50 space-y-3">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">DETAY/FİYAT KONTROLÜ</span>
                            <div className="flex justify-between items-baseline">
                                <h3 className="text-2xl font-extrabold text-gray-800 dark:text-white">
                                    {data.averageLatencies.Detail || 0} ms
                                </h3>
                                <span className={`text-[10px] font-bold ${getLatencyColor(data.averageLatencies.Detail)}`}>
                                    {data.averageLatencies.Detail < 300 ? "HIZLI" : "NORMAL"}
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full"
                                    style={{ width: `${Math.min((data.averageLatencies.Detail / 800) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Son İstekler ve Hata Logları Tablosu */}
                    <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900/50">
                        <div className="mb-4">
                            <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200">
                                Entegrasyon İstek ve Hata Geçmişi
                            </h3>
                            <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
                                TourVisio servislerine yapılan son 50 HTTP isteğinin detaylı sonuçları.
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50 font-bold uppercase tracking-wider text-gray-400 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-500">
                                        <th className="px-4 py-3">Saat</th>
                                        <th className="px-4 py-3">Hizmet Tipi</th>
                                        <th className="px-4 py-3">İstek / Endpoint</th>
                                        <th className="px-4 py-3 text-center">Gecikme</th>
                                        <th className="px-4 py-3 text-center">Durum</th>
                                        <th className="px-4 py-3 text-right">Sonuç</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-700 dark:text-slate-350">
                                    {data.logs && data.logs.length > 0 ? (
                                        data.logs.map((log, idx) => {
                                            const isExpanded = expandedRow === idx;
                                            
                                            return (
                                                <>
                                                    <tr
                                                        key={idx}
                                                        onClick={() => setExpandedRow(isExpanded ? null : idx)}
                                                        className="cursor-pointer hover:bg-gray-50/20 dark:hover:bg-slate-800/10"
                                                    >
                                                        <td className="px-4 py-3 font-semibold text-gray-400 dark:text-slate-500">
                                                            {formatTime(log.timestamp)}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                                log.endpointType === "HotelSearch"
                                                                    ? "bg-amber-500/10 text-amber-500"
                                                                    : log.endpointType === "FlightSearch"
                                                                    ? "bg-blue-500/10 text-blue-500"
                                                                    : log.endpointType === "Auth"
                                                                    ? "bg-purple-500/10 text-purple-500"
                                                                    : "bg-gray-500/10 text-gray-500"
                                                            }`}>
                                                                {log.endpointType}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 font-mono text-[10px] text-gray-600 dark:text-slate-400 max-w-[200px] truncate">
                                                            <span className="font-bold text-gray-800 dark:text-slate-300 mr-1.5">{log.method}</span>
                                                            {log.uri}
                                                        </td>
                                                        <td className={`px-4 py-3 text-center font-bold ${getLatencyColor(log.latencyMs)}`}>
                                                            {log.latencyMs} ms
                                                        </td>
                                                        <td className="px-4 py-3 text-center font-semibold">
                                                            <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                                                log.success ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                                                            }`}>
                                                                {log.statusCode} {log.statusText}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex justify-end items-center gap-2">
                                                                {log.success ? (
                                                                    <CheckCircle2 size={15} className="text-emerald-500" />
                                                                ) : (
                                                                    <XCircle size={15} className="text-rose-500" />
                                                                )}
                                                                <span className="text-[10px] text-gray-400 dark:text-slate-500 font-bold hover:underline">
                                                                    {isExpanded ? t("common.hide", "Gizle") : t("common.detail", "Detay")}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    {/* Expandable Log Details Row */}
                                                    {isExpanded && (
                                                        <tr className="bg-gray-50/50 dark:bg-slate-900/40">
                                                            <td colSpan="6" className="px-6 py-4">
                                                                <div className="space-y-4">
                                                                    {/* 1. Error Message Section (only if unsuccessful) */}
                                                                    {!log.success && (
                                                                        <div className="space-y-3">
                                                                            <div className="space-y-2 border-l-2 border-rose-500 pl-4">
                                                                                <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                                                                    <AlertTriangle size={14} />
                                                                                    Entegrasyon Hata Ayrıntısı
                                                                                </h4>
                                                                                <p className="font-mono text-[10px] text-gray-700 dark:text-slate-350 whitespace-pre-wrap leading-relaxed">
                                                                                    {log.errorMessage || "Detaylı hata mesajı bulunmuyor."}
                                                                                </p>
                                                                            </div>

                                                                            <div className="space-y-2 border-l-2 border-amber-500 bg-amber-500/5 p-3.5 rounded-r-xl pl-4">
                                                                                <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                                                                                    <CheckCircle2 size={14} className="text-amber-500" />
                                                                                    Önerilen Çözüm Adımı
                                                                                </h4>
                                                                                <p className="text-[10.5px] text-gray-700 dark:text-slate-300 leading-relaxed font-semibold">
                                                                                    {getErrorResolutionSuggestion(log)}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* 2. Payloads Section */}
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        {/* Request Payload */}
                                                                        <div className="space-y-2">
                                                                            <h4 className="text-xs font-bold text-gray-600 dark:text-slate-400">
                                                                                İstek Gövdesi (Request Body)
                                                                            </h4>
                                                                            <div className="relative">
                                                                                <pre className="font-mono text-[10px] text-slate-200 bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto max-h-72 leading-relaxed">
                                                                                    {formatPayload(log.requestPayload)}
                                                                                </pre>
                                                                            </div>
                                                                        </div>

                                                                        {/* Response Payload */}
                                                                        <div className="space-y-2">
                                                                            <h4 className="text-xs font-bold text-gray-600 dark:text-slate-400">
                                                                                Yanıt Gövdesi (Response Body)
                                                                            </h4>
                                                                            <div className="relative">
                                                                                <pre className="font-mono text-[10px] text-slate-200 bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto max-h-72 leading-relaxed">
                                                                                    {formatPayload(log.responsePayload)}
                                                                                </pre>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-8 text-gray-400">
                                                Entegrasyon çağrısı henüz kaydedilmedi.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
