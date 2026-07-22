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
                        isActive: u.isActive !== undefined ? u.isActive : (u.status === "active")
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
                    setUsers((currentUsers) =>
                        Array.isArray(currentUsers) ? currentUsers.map((user) =>
                            user.id === id
                                ? {
                                    ...user,
                                    status: res.data.isActive ? "active" : "inactive",
                                    isActive: res.data.isActive
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
                            filteredUsers.map((user) => {
                                const isActive = user.status === "active";

                                return (
                                    <div
                                        key={user.id}
                                        className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-orange-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-orange-500/40"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-lg font-bold text-orange-500 dark:bg-orange-950/20">
                                                {(user.name || "U").charAt(0)}
                                            </div>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${isActive
                                                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                                                        : "bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400"
                                                    }`}
                                            >
                                                {isActive
                                                    ? t("users_page.status.active")
                                                    : t(
                                                        "users_page.status.inactive"
                                                    )}
                                            </span>
                                        </div>

                                        <h2 className="mt-4 font-semibold text-gray-900 dark:text-white">
                                            {user.name}
                                        </h2>

                                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                                            <Mail size={15} />

                                            {user.email}
                                        </div>

                                        <div className="mt-4 space-y-2 rounded-xl border border-slate-100 bg-gray-50 p-3 dark:border-slate-800/40 dark:bg-slate-800/50">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500 dark:text-slate-400">
                                                    {t("users_page.role_label")}
                                                </span>

                                                <span className="flex items-center gap-1 font-medium text-gray-800 dark:text-slate-200">
                                                    <Shield size={14} />

                                                    {user.role === "admin"
                                                        ? t(
                                                            "users_page.roles.admin"
                                                        )
                                                        : t(
                                                            "users_page.roles.user"
                                                        )}
                                                </span>
                                            </div>

                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500 dark:text-slate-400">
                                                    {t(
                                                        "users_page.reservation_label"
                                                    )}
                                                </span>

                                                <span className="font-medium text-gray-800 dark:text-slate-200">
                                                    {user.reservations}
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
                                            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${isActive
                                                    ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/40"
                                                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
                                                }`}
                                        >
                                            {isActive ? (
                                                <>
                                                    <UserX size={17} />

                                                    {t(
                                                        "users_page.make_inactive"
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <UserCheck size={17} />

                                                    {t(
                                                        "users_page.make_active"
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