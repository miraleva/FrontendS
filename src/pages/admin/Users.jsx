import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    Search,
    UserCheck,
    UserX,
    Mail,
    Shield,
} from "lucide-react";
import api from "../../services/api.js";

export default function Users() {
    const { t } = useTranslation();

    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        setError("");
        const token = localStorage.getItem('token') || sessionStorage.getItem('token') || localStorage.getItem('adminToken') || "";
        api.get('/api/admin/users', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => {
                if (res.data && Array.isArray(res.data)) {
                    const formatted = res.data.map(u => ({
                        id: u.id,
                        name: u.fullName || u.name || "N/A",
                        email: u.email || "N/A",
                        role: u.role || "user",
                        reservations: u.reservationCount ?? u.reservations ?? 0,
                        status: u.status || (u.isActive ? "active" : "inactive"),
                        isActive: u.isActive !== undefined ? u.isActive : (u.status === "active"),
                        lastLoginAt: u.lastLoginAt,
                        lastLogoutAt: u.lastLogoutAt
                    }));
                    setUsers(formatted);
                } else {
                    setUsers([]);
                }
            })
            .catch(err => {
                console.error("Error fetching users:", err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    setError(t("users_page.access_denied", "Bu verileri görüntülemek için yetkiniz bulunmamaktadır. Lütfen yönetici hesabıyla giriş yapın."));
                } else {
                    setError(t("users_page.load_error", "Kullanıcı listesi alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz."));
                }
                setUsers([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [t]);

    const filteredUsers = Array.isArray(users) ? users.filter((user) => {
        const value = searchTerm.trim().toLocaleLowerCase();
        const nameToSearch = user.name || "";
        const emailToSearch = user.email || "";

        return (
            nameToSearch.toLocaleLowerCase().includes(value) ||
            emailToSearch.toLocaleLowerCase().includes(value)
        );
    }) : [];

    const toggleUserStatus = (id) => {
        setError("");
        const token = localStorage.getItem('token') || sessionStorage.getItem('token') || localStorage.getItem('adminToken') || "";
        api.put(`/api/admin/users/${id}/toggle-status`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => {
                if (res.data) {
                    const isUserActive = res.data.isActive !== undefined ? res.data.isActive : (res.data.active !== undefined ? res.data.active : (res.data.status === "active"));
                    setUsers((currentUsers) =>
                        Array.isArray(currentUsers) ? currentUsers.map((user) =>
                            user.id === id
                                ? {
                                    ...user,
                                    status: isUserActive ? "active" : "inactive",
                                    isActive: isUserActive
                                }
                                : user
                        ) : []
                    );
                }
            })
            .catch(err => {
                console.error("Error toggling user status:", err);
                setError(t("users_page.status_toggle_error", "Kullanıcı durumu güncellenemedi. Lütfen tekrar deneyin."));
            });
    };

    const formatDateTime = (timeStr) => {
        if (!timeStr) return "-";
        try {
            const date = new Date(timeStr);
            return date.toLocaleString("tr-TR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        } catch (e) {
            return timeStr;
        }
    };

    return (
        <div className="space-y-6">
            {/* Sayfa başlığı */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {t("users_page.title")}
                </h1>

                <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                    {t("users_page.description")}
                </p>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
                    {error}
                </div>
            )}

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                {/* Arama alanı */}
                <div className="border-b border-gray-100 p-5 dark:border-slate-800">
                    <div className="relative max-w-lg">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
                        />

                        <input
                            type="text"
                            placeholder={t(
                                "users_page.search_placeholder"
                            )}
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-orange-950"
                        />
                    </div>
                </div>

                {/* Kullanıcı kartları */}
                <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
                    {loading ? (
                        <div className="col-span-full py-10 text-center text-gray-400">
                            <span className="inline-block animate-pulse">{t('common.loading', 'Yükleniyor...')}</span>
                        </div>
                    ) : (
                        Array.isArray(filteredUsers) && filteredUsers.length > 0 ? (
                            filteredUsers.map((user, idx) => {
                                const isActive = user.status === "active";
                                const avatarGradients = [
                                    "from-orange-400 to-pink-500",
                                    "from-blue-400 to-indigo-500",
                                    "from-emerald-400 to-teal-500",
                                    "from-violet-400 to-purple-500"
                                ];
                                const gradientClass = avatarGradients[idx % avatarGradients.length];

                                return (
                                    <div
                                        key={user.id}
                                        className="group rounded-2xl border border-gray-200 bg-white p-5 transition-all duration-300 hover:border-orange-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-orange-500/40"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradientClass} text-lg font-bold text-white shadow-md transition-transform duration-300 group-hover:scale-105`}>
                                                {(user.name || "U").charAt(0).toUpperCase()}
                                            </div>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${isActive
                                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                        : "bg-gray-500/10 text-gray-500 dark:text-slate-400"
                                                    }`}
                                            >
                                                {isActive
                                                    ? t("users_page.status.active", "Aktif")
                                                    : t(
                                                        "users_page.status.inactive",
                                                        "İnaktif"
                                                    )}
                                            </span>
                                        </div>

                                        <h2 className="mt-4 font-bold text-gray-900 dark:text-white truncate">
                                            {user.name}
                                        </h2>

                                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-400 dark:text-slate-400 truncate">
                                            <Mail size={15} className="text-gray-350" />
                                            {user.email}
                                        </div>

                                        <div className="mt-4 space-y-2.5 rounded-xl border border-slate-100 bg-gray-50/50 p-4 dark:border-slate-800/40 dark:bg-slate-950/40">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400 dark:text-slate-500">
                                                    {t("users_page.role_label", "Rol")}
                                                </span>

                                                <span className="flex items-center gap-1 font-semibold text-gray-800 dark:text-slate-200">
                                                    <Shield size={14} className="text-orange-500" />

                                                    {user.role === "admin"
                                                        ? t(
                                                            "users_page.roles.admin",
                                                            "Yönetici"
                                                        )
                                                        : t(
                                                            "users_page.roles.user",
                                                            "Kullanıcı"
                                                        )}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400 dark:text-slate-500">
                                                    {t(
                                                        "users_page.reservation_label",
                                                        "Rezervasyon"
                                                    )}
                                                </span>

                                                <span className="rounded bg-orange-50/70 px-2 py-0.5 font-bold text-orange-600 dark:bg-orange-950/20 dark:text-orange-400">
                                                    {user.reservations}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center text-xs pt-1.5 border-t border-slate-100 dark:border-slate-800/60">
                                                <span className="text-gray-400 dark:text-slate-500">
                                                    {t("users_page.last_login", "Son Giriş")}
                                                </span>
                                                <span className="font-semibold text-gray-700 dark:text-slate-350">
                                                    {formatDateTime(user.lastLoginAt)}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-gray-400 dark:text-slate-500">
                                                    {t("users_page.last_logout", "Son Çıkış")}
                                                </span>
                                                <span className="font-semibold text-gray-700 dark:text-slate-350">
                                                    {formatDateTime(user.lastLogoutAt)}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                toggleUserStatus(user.id)
                                            }
                                            aria-label={
                                                isActive
                                                    ? t(
                                                        "users_page.make_inactive"
                                                    )
                                                    : t(
                                                        "users_page.make_active"
                                                    )
                                            }
                                            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 ${isActive
                                                    ? "bg-red-50 text-red-650 hover:bg-red-500 hover:text-white dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-900/60 dark:hover:text-white"
                                                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white dark:bg-emerald-950/20 dark:text-emerald-450 dark:hover:bg-emerald-900/60 dark:hover:text-white"
                                                }`}
                                        >
                                            {isActive ? (
                                                <>
                                                    <UserX size={17} />

                                                    {t(
                                                        "users_page.make_inactive",
                                                        "Hesabı Askıya Al"
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <UserCheck size={17} />

                                                    {t(
                                                        "users_page.make_active",
                                                        "Hesabı Aktifleştir"
                                                    )}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full py-10 text-center text-sm text-gray-500 dark:text-slate-400">
                                {t("users_page.not_found", "Kullanıcı bulunamadı.")}
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}