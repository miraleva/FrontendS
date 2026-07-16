import { useState } from 'react';
import {
    Search,
    UserCheck,
    UserX,
    Mail,
    Shield,
} from 'lucide-react';

const initialUsers = [
    {
        id: 1,
        name: 'Ayşe Yılmaz',
        email: 'ayse@mail.com',
        role: 'Kullanıcı',
        reservations: 4,
        status: 'Aktif',
    },
    {
        id: 2,
        name: 'Mehmet Demir',
        email: 'mehmet@mail.com',
        role: 'Kullanıcı',
        reservations: 2,
        status: 'Aktif',
    },
    {
        id: 3,
        name: 'Zeynep Kaya',
        email: 'zeynep@mail.com',
        role: 'Admin',
        reservations: 0,
        status: 'Aktif',
    },
    {
        id: 4,
        name: 'Emre Arslan',
        email: 'emre@mail.com',
        role: 'Kullanıcı',
        reservations: 1,
        status: 'Pasif',
    },
];

export default function Users() {
    const [users, setUsers] = useState(initialUsers);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = users.filter((user) => {
        const value = searchTerm.toLowerCase();

        return (
            user.name.toLowerCase().includes(value) ||
            user.email.toLowerCase().includes(value)
        );
    });

    const toggleUserStatus = (id) => {
        setUsers((currentUsers) =>
            currentUsers.map((user) =>
                user.id === id
                    ? {
                        ...user,
                        status:
                            user.status === 'Aktif' ? 'Pasif' : 'Aktif',
                    }
                    : user
            )
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Users
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                    Sisteme kayıtlı kullanıcıları görüntüleyin ve yönetin.
                </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 p-5">
                    <div className="relative max-w-lg">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            placeholder="Kullanıcı adı veya e-posta ara..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        />
                    </div>
                </div>

                <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
                    {filteredUsers.map((user) => (
                        <div
                            key={user.id}
                            className="rounded-2xl border border-gray-200 p-5 transition hover:border-orange-200 hover:shadow-sm"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-lg font-bold text-orange-500">
                                    {user.name.charAt(0)}
                                </div>

                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${user.status === 'Aktif'
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'bg-gray-100 text-gray-500'
                                        }`}
                                >
                                    {user.status}
                                </span>
                            </div>

                            <h2 className="mt-4 font-semibold text-gray-900">
                                {user.name}
                            </h2>

                            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                                <Mail size={15} />
                                {user.email}
                            </div>

                            <div className="mt-4 space-y-2 rounded-xl bg-gray-50 p-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Rol</span>

                                    <span className="flex items-center gap-1 font-medium text-gray-800">
                                        <Shield size={14} />
                                        {user.role}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">
                                        Rezervasyon
                                    </span>

                                    <span className="font-medium text-gray-800">
                                        {user.reservations}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => toggleUserStatus(user.id)}
                                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${user.status === 'Aktif'
                                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                    }`}
                            >
                                {user.status === 'Aktif' ? (
                                    <>
                                        <UserX size={17} />
                                        Kullanıcıyı Pasif Yap
                                    </>
                                ) : (
                                    <>
                                        <UserCheck size={17} />
                                        Kullanıcıyı Aktif Yap
                                    </>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}