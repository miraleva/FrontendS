import { useState } from "react";

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        country: "",
        gender: "",
        dateOfBirth: "",
        email: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = () => {
        setIsEditing(false);
        // Handle save logic here
    };

    const handleLogOut = () => {
        console.log("Logging out...");
    };

    const handleDeleteAccount = () => {
        if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            console.log("Deleting account...");
        }
    };

    return (
        // 1. Kapsayıcıyı 'relative' yaptık ki video ve içerik üst üste binebilsin
        <div className="relative min-h-screen overflow-hidden flex items-center justify-center py-12 px-4">

            {/* 2. ARKA PLAN VİDEOSU */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover z-0"
            >
                {/* video-linki-buraya kısmına kendi video yolunu (örn: "/background.mp4") yazmalısın */}
                <source src="/videos/chatbot_bg.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Karartma Katmanı (Opsiyonel): Videonun form elementlerini okunmaz kılmasını engeller */}
            <div className="absolute top-0 left-0 w-full h-full bg-black/20 z-10" />

            {/* 3. İÇERİK KATMANI (z-20 ile videonun üstüne çıkardık) */}
            <div className="w-full max-w-2xl z-20">
                {/* Profile Card - Tasarımdaki cam efektini (Glassmorphism) yakalamak için bg-white yerine şeffaflık ekledik */}
                <div className="bg-white/20 backdrop-blur-x1 rounded-2xl shadow-xl p-8 md:p-10 border border-white/20">
                    {/* Header Section */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white text-2xl font-bold shadow-md">

                            </div>

                            {/* Name & Username */}
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Irmak Özbay</h1>
                                <p className="text-gray-500 text-sm">@irmakozbay</p>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <button
                            onClick={() => {
                                if (isEditing) handleSave();
                                else setIsEditing(true);
                            }}
                            className="px-6 py-2 bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold rounded-lg transition-colors duration-200"
                        >
                            {isEditing ? "Save" : "Edit"}
                        </button>
                    </div>

                    {/* Form Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                placeholder="First Name"
                                disabled={!isEditing}
                                className="w-full px-4 py-3 rounded-lg bg-gray-100/80 text-gray-700 placeholder-gray-400 border-2 border-transparent focus:outline-none focus:border-amber-400 transition-colors disabled:bg-gray-50/50 disabled:text-gray-400"
                            />
                        </div>

                        {/* Last Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                placeholder="Last Name"
                                disabled={!isEditing}
                                className="w-full px-4 py-3 rounded-lg bg-gray-100/80 text-gray-700 placeholder-gray-400 border-2 border-transparent focus:outline-none focus:border-amber-400 transition-colors disabled:bg-gray-50/50 disabled:text-gray-400"
                            />
                        </div>

                        {/* Country */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                            <input
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                placeholder="Country"
                                disabled={!isEditing}
                                className="w-full px-4 py-3 rounded-lg bg-gray-100/80 text-gray-700 placeholder-gray-400 border-2 border-transparent focus:outline-none focus:border-amber-400 transition-colors disabled:bg-gray-50/50 disabled:text-gray-400"
                            />
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                            <input
                                type="text"
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                placeholder="Gender"
                                disabled={!isEditing}
                                className="w-full px-4 py-3 rounded-lg bg-gray-100/80 text-gray-700 placeholder-gray-400 border-2 border-transparent focus:outline-none focus:border-amber-400 transition-colors disabled:bg-gray-50/50 disabled:text-gray-400"
                            />
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                            <input
                                type="text"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleInputChange}
                                placeholder="MM.DD.YY"
                                disabled={!isEditing}
                                className="w-full px-4 py-3 rounded-lg bg-gray-100/80 text-gray-700 placeholder-gray-400 border-2 border-transparent focus:outline-none focus:border-amber-400 transition-colors disabled:bg-gray-50/50 disabled:text-gray-400"
                            />
                        </div>

                        {/* Mail Address */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mail Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="email"
                                disabled={!isEditing}
                                className="w-full px-4 py-3 rounded-lg bg-gray-100/80 text-gray-700 placeholder-gray-400 border-2 border-transparent focus:outline-none focus:border-amber-400 transition-colors disabled:bg-gray-50/50 disabled:text-gray-400"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-end">
                        <button
                            onClick={handleLogOut}
                            className="px-6 py-2 bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold rounded-lg transition-colors duration-200"
                        >
                            Log Out
                        </button>
                        <button
                            onClick={handleDeleteAccount}
                            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors duration-200"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}