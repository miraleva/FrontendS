import { useState } from 'react';
import {
    Search,
    MessageSquare,
    Bot,
    User,
    Clock,
} from 'lucide-react';

const chats = [
    {
        id: 1,
        user: 'Ayşe Yılmaz',
        date: '16.07.2026 09:30',
        question: 'Kapadokya turu hakkında bilgi almak istiyorum.',
        answer:
            'Kapadokya turumuz 3 gece 4 gün sürmektedir ve konaklama dahildir.',
    },
    {
        id: 2,
        user: 'Mehmet Demir',
        date: '16.07.2026 10:15',
        question: 'Rezervasyon tarihimi değiştirebilir miyim?',
        answer:
            'Rezervasyon tarih değişikliği uygunluk durumuna göre yapılabilir.',
    },
    {
        id: 3,
        user: 'Zeynep Kaya',
        date: '16.07.2026 10:42',
        question: 'Antalya turunda otel transferi var mı?',
        answer:
            'Evet, Antalya turumuzda havaalanı ve otel transferi bulunmaktadır.',
    },
];

export default function ChatLogs() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedChat, setSelectedChat] = useState(chats[0]);

    const filteredChats = chats.filter((chat) =>
        chat.user.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Chat Logs
                </h1>

                <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                    Kullanıcı ve chatbot konuşmalarını görüntüleyin.
                </p>
            </div>

            <div className="grid min-h-[620px] overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm lg:grid-cols-[360px_1fr]">
                {/* Sohbet listesi */}
                <div className="border-r border-gray-200 dark:border-slate-800">
                    <div className="border-b border-gray-100 dark:border-slate-800 p-4">
                        <div className="relative">
                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
                            />

                            <input
                                type="text"
                                placeholder="Kullanıcı ara..."
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                                className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-3 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:border-orange-400"
                            />
                        </div>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-slate-800">
                        {filteredChats.map((chat) => (
                            <button
                                key={chat.id}
                                type="button"
                                onClick={() => setSelectedChat(chat)}
                                className={`w-full p-4 text-left transition ${selectedChat.id === chat.id
                                        ? 'bg-orange-50 dark:bg-orange-950/20'
                                        : 'hover:bg-gray-50 dark:hover:bg-slate-850/40'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300">
                                        <User size={18} />
                                    </div>

                                    <div className="min-w-0">
                                        <h2 className="font-semibold text-gray-800 dark:text-slate-200">
                                            {chat.user}
                                        </h2>

                                        <p className="mt-1 truncate text-sm text-gray-500 dark:text-slate-400">
                                            {chat.question}
                                        </p>

                                        <p className="mt-2 flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
                                            <Clock size={13} />
                                            {chat.date}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sohbet detayı */}
                <div className="flex flex-col">
                    <div className="border-b border-gray-100 dark:border-slate-800 px-6 py-5">
                        <h2 className="font-semibold text-gray-900 dark:text-white">
                            {selectedChat.user}
                        </h2>

                        <p className="mt-1 text-sm text-gray-400 dark:text-slate-500">
                            {selectedChat.date}
                        </p>
                    </div>

                    <div className="flex-1 space-y-6 bg-gray-50 dark:bg-slate-955 p-6">
                        <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-800">
                                <User size={17} />
                            </div>

                            <div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-white dark:bg-slate-900 p-4 text-sm leading-6 text-gray-700 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-800/60">
                                {selectedChat.question}
                            </div>
                        </div>

                        <div className="flex items-start justify-end gap-3">
                            <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-orange-500 p-4 text-sm leading-6 text-white shadow-sm">
                                {selectedChat.answer}
                            </div>

                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">
                                <Bot size={17} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 border-t border-gray-100 dark:border-slate-800 px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                        <MessageSquare size={17} />
                        Bu alan yalnızca görüntüleme amaçlıdır.
                    </div>
                </div>
            </div>
        </div>
    );
}