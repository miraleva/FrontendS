import { useState } from "react";

export default function Index() {
    const [searchQuery, setSearchQuery] = useState("");
    const username = "User";

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
            style={{
                background: `linear-gradient(135deg, #8ecae6 0%, #ffb8038c 100%)`,
            }}
        >
            {/* Main Container */}
            <div className="w-full max-w-2xl">
                {/* Welcome Section */}
                <div className="mb-12 text-center md:mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                        Good Morning, {username}
                    </h1>
                    <p className="text-white/70 text-base md:text-lg">
                        How can we help you today?
                    </p>
                </div>

                {/* Action Badges */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 md:mb-16">
                    <button
                        className="px-6 py-3 rounded-full font-bold text-white transition-all transform hover:scale-105 shadow-lg"
                        style={{
                            backgroundColor: "#ffb8038c",
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#ffb80354")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "#ffb8038c")
                        }
                    >
                        Plane ticket
                    </button>
                    <button
                        className="px-6 py-3 rounded-full font-bold text-white transition-all transform hover:scale-105 shadow-lg"
                        style={{
                            backgroundColor: "#ffb8038c",
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#ffb80354")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "#ffb8038c")
                        }
                    >
                        Hotel reservation
                    </button>
                </div>

                {/* Glassmorphic Chat Container */}
                <div
                    className="relative rounded-3xl shadow-2xl backdrop-blur-xl border"
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        borderColor: "rgba(255, 255, 255, 0.2)",
                    }}
                >
                    {/* Input Section */}
                    <div className="p-6 md:p-8">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="How can I help?"
                            className="w-full px-6 py-4 rounded-full text-center text-black placeholder-black/30 focus:outline-none transition-colors"
                            style={{
                                backgroundColor: "rgba(255, 255, 255, 0.4)",
                                borderColor: "rgba(255, 255, 255, 0.1)",
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.4)";
                            }}
                        />
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="border-t px-6 md:px-8 py-6 md:py-8" style={{
                        borderColor: "rgba(255, 255, 255, 0.1)",
                    }}>
                        <p className="text-white/60 text-sm font-medium mb-4">
                            Popular queries
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                "Book a flight to Bali",
                                "Find luxury hotels",
                                "Travel itinerary",
                                "Visa information",
                            ].map((query, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSearchQuery(query)}
                                    className="p-3 rounded-lg text-left text-white/70 hover:text-white text-sm transition-all hover:bg-white/10"
                                    style={{
                                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                                    }}
                                >
                                    <span className="font-medium">{query}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-12 text-center text-white/50 text-sm">
                    <p>Powered by premium travel assistant</p>
                </div>
            </div>
        </div>
    );
}
