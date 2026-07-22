import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Search,
    UserCheck,
    UserX,
    Mail,
    Shield,
} from "lucide-react";

const initialUsers = [
    {
        id: 1,
        name: "Ayşe Yılmaz",
        email: "ayse@mail.com",
        role: "user",
        reservations: 4,
        status: "active",
    },
    {
        id: 2,
        name: "Mehmet Demir",
        email: "mehmet@mail.com",
        role: "user",
        reservations: 2,
        status: "active",
    },
    {
        id: 3,
        name: "Zeynep Kaya",
        email: "zeynep@mail.com",
        role: "admin",
        reservations: 0,
        status: "active",
    },
    {
        id: 4,
        name: "Emre Arslan",
        email: "emre@mail.com",
        role: "user",
        reservations: 1,
        status: "inactive",
    },
];

export default function Users() {
    const { t } = useTranslation();

    const [users, setUsers] = useState(initialUsers);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredUsers = users.filter((user) => {
        const value = searchTerm.trim().toLocaleLowerCase();

        return (
            user.name.toLocaleLowerCase().includes(value) ||
            user.email.toLocaleLowerCase().includes(value)
        );
    });

    const toggleUserStatus = (id) => {
        setUsers((currentUsers) =>
            currentUsers.map((user) =>
                user.id === id
                    ? {
                        ...user,
                        status:
                            user.status === "active"
                                ? "inactive"
                                : "active",
                    }
                    : user
            )
        );
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
                    {filteredUsers.map((user) => {
                        const isActive = user.status === "active";

                        return (
                            <div
                                key={user.id}
                                className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-orange-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-orange-500/40"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-lg font-bold text-orange-500 dark:bg-orange-950/20">
                                        {user.name.charAt(0)}
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
                    })}
                </div>

                {filteredUsers.length === 0 && (
                    <div className="p-10 text-center text-sm text-gray-500 dark:text-slate-400">
                        {t("users_page.not_found")}
                    </div>
                )}
            </div>
        </div>
    );
}