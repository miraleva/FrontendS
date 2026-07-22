import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Search,
    MessageSquare,
    Bot,
    User,
    Clock,
} from "lucide-react";

const chatDefinitions = [
    { id: 1, user: "Ayşe Yılmaz", date: "16.07.2026 09:30", key: "chat_1" },
    { id: 2, user: "Mehmet Demir", date: "16.07.2026 10:15", key: "chat_2" },
    { id: 3, user: "Zeynep Kaya", date: "16.07.2026 10:42", key: "chat_3" },
];

export default function ChatLogs() {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedChatId, setSelectedChatId] = useState(chatDefinitions[0].id);

    const chats = useMemo(
        () =>
            chatDefinitions.map((chat) => ({
                ...chat,
                question: t(`chat_logs_page.sample_chats.${chat.key}.question`),
                answer: t(`chat_logs_page.sample_chats.${chat.key}.answer`),
            })),
        [t]
    );

    const filteredChats = chats.filter((chat) =>
        chat.user.toLocaleLowerCase().includes(searchTerm.trim().toLocaleLowerCase())
    );

    const selectedChat =
        chats.find((chat) => chat.id === selectedChatId) || chats[0];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {t("chat_logs_page.title")}
                </h1>

                <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                    {t("chat_logs_page.description")}
                </p>
            </div>

            <div className="grid min-h-[620px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[360px_1fr]">
                <div className="border-r border-gray-200 dark:border-slate-800">
                    <div className="border-b border-gray-100 p-4 dark:border-slate-800">
                        <div className="relative">
                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
                            />

                            <input
                                type="text"
                                placeholder={t("chat_logs_page.search_placeholder")}
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                            />
                        </div>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-slate-800">
                        {filteredChats.map((chat) => (
                            <button
                                key={chat.id}
                                type="button"
                                onClick={() => setSelectedChatId(chat.id)}
                                className={`w-full p-4 text-left transition ${selectedChat.id === chat.id
                                        ? "bg-orange-50 dark:bg-orange-950/20"
                                        : "hover:bg-gray-50 dark:hover:bg-slate-800/40"
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300">
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

                <div className="flex flex-col">
                    <div className="border-b border-gray-100 px-6 py-5 dark:border-slate-800">
                        <h2 className="font-semibold text-gray-900 dark:text-white">
                            {selectedChat.user}
                        </h2>

                        <p className="mt-1 text-sm text-gray-400 dark:text-slate-500">
                            {selectedChat.date}
                        </p>
                    </div>

                    <div className="flex-1 space-y-6 bg-gray-50 p-6 dark:bg-slate-950">
                        <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white text-gray-600 shadow-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
                                <User size={17} />
                            </div>

                            <div className="max-w-[75%] rounded-2xl rounded-tl-sm border border-slate-100 bg-white p-4 text-sm leading-6 text-gray-700 shadow-sm dark:border-slate-800/60 dark:bg-slate-900 dark:text-slate-200">
                                {selectedChat.question}
                            </div>
                        </div>

                        <div className="flex items-start justify-end gap-3">
                            <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-orange-500 p-4 text-sm leading-6 text-white shadow-sm">
                                {selectedChat.answer}
                            </div>

                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
                                <Bot size={17} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 border-t border-gray-100 px-6 py-4 text-sm text-gray-500 dark:border-slate-800 dark:text-slate-400">
                        <MessageSquare size={17} />
                        {t("chat_logs_page.view_only")}
                    </div>
                </div>
            </div>
        </div>
    );
}