import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Plus,
    MapPin,
    Users,
    Calendar,
    Pencil,
    Trash2,
    X,
} from "lucide-react";

const initialTours = [
    {
        id: 1,
        nameKey: "cappadocia",
        location: "Nevşehir",
        date: "18.07.2026",
        price: "6.250 TL",
        capacity: 30,
        status: "active",
    },
    {
        id: 2,
        nameKey: "antalya",
        location: "Antalya",
        date: "21.07.2026",
        price: "7.500 TL",
        capacity: 25,
        status: "active",
    },
    {
        id: 3,
        nameKey: "blacksea",
        location: "Trabzon",
        date: "23.07.2026",
        price: "7.600 TL",
        capacity: 20,
        status: "active",
    },
    {
        id: 4,
        nameKey: "istanbul",
        location: "İstanbul",
        date: "27.07.2026",
        price: "4.200 TL",
        capacity: 35,
        status: "inactive",
    },
];

const emptyTourForm = {
    name: "",
    location: "",
    date: "",
    price: "",
    capacity: "",
    status: "active",
};

export default function Tours() {
    const { t, i18n } = useTranslation();

    const [tours, setTours] = useState(initialTours);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tourForm, setTourForm] = useState(emptyTourForm);
    const [editingTourId, setEditingTourId] = useState(null);
    const [formError, setFormError] = useState("");

    const getLocale = () => {
        const language = i18n.resolvedLanguage || i18n.language || "tr";

        const localeMap = {
            tr: "tr-TR",
            en: "en-US",
            de: "de-DE",
            ru: "ru-RU",
        };

        return localeMap[language] || "tr-TR";
    };

    const getTourName = (tour) => {
        if (tour.name) {
            return tour.name;
        }

        return t(`tours_page.names.${tour.nameKey}`);
    };

    const formatDateForDisplay = (dateValue) => {
        if (!dateValue) {
            return "-";
        }

        const [year, month, day] = dateValue.split("-");

        return `${day}.${month}.${year}`;
    };

    const formatDateForInput = (dateValue) => {
        if (!dateValue) {
            return "";
        }

        if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
            return dateValue;
        }

        const parts = dateValue.split(".");

        if (parts.length !== 3) {
            return "";
        }

        const [day, month, year] = parts;

        return `${year}-${month}-${day}`;
    };

    const parsePrice = (priceValue) => {
        if (priceValue === null || priceValue === undefined) {
            return "";
        }

        const cleanedValue = String(priceValue).replace(/[^\d]/g, "");

        return cleanedValue;
    };

    const formatPrice = (priceValue) => {
        const numericPrice = Number(priceValue);

        if (Number.isNaN(numericPrice)) {
            return `${priceValue} TL`;
        }

        return `${new Intl.NumberFormat(getLocale(), {
            maximumFractionDigits: 0,
        }).format(numericPrice)} TL`;
    };

    const openAddModal = () => {
        setEditingTourId(null);
        setTourForm(emptyTourForm);
        setFormError("");
        setIsModalOpen(true);
    };

    const openEditModal = (tour) => {
        setEditingTourId(tour.id);
        setTourForm({
            name: getTourName(tour),
            location: tour.location || "",
            date: formatDateForInput(tour.date),
            price: parsePrice(tour.price),
            capacity: String(tour.capacity ?? ""),
            status: tour.status || "active",
        });
        setFormError("");
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTourId(null);
        setTourForm(emptyTourForm);
        setFormError("");
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setTourForm((currentTour) => ({
            ...currentTour,
            [name]: value,
        }));

        if (formError) {
            setFormError("");
        }
    };

    const saveTour = (event) => {
        event.preventDefault();

        const tourName = tourForm.name.trim();
        const location = tourForm.location.trim();
        const price = Number(tourForm.price);
        const capacity = Number(tourForm.capacity);

        if (
            !tourName ||
            !location ||
            !tourForm.date ||
            !tourForm.price ||
            !tourForm.capacity
        ) {
            setFormError(t("tours_page.form.required_error"));
            return;
        }

        if (
            !Number.isFinite(price) ||
            !Number.isFinite(capacity) ||
            price <= 0 ||
            capacity <= 0
        ) {
            setFormError(t("tours_page.form.positive_number_error"));
            return;
        }

        const savedTour = {
            name: tourName,
            location,
            date: formatDateForDisplay(tourForm.date),
            price: formatPrice(price),
            capacity,
            status: tourForm.status,
        };

        if (editingTourId !== null) {
            setTours((currentTours) =>
                currentTours.map((tour) =>
                    tour.id === editingTourId
                        ? {
                            ...tour,
                            ...savedTour,
                            nameKey: undefined,
                        }
                        : tour
                )
            );
        } else {
            setTours((currentTours) => [
                {
                    id: Date.now(),
                    ...savedTour,
                },
                ...currentTours,
            ]);
        }

        closeModal();
    };

    const deleteTour = (id) => {
        const shouldDelete = window.confirm(
            t("tours_page.delete_confirmation")
        );

        if (!shouldDelete) {
            return;
        }

        setTours((currentTours) =>
            currentTours.filter((tour) => tour.id !== id)
        );
    };

    const isEditing = editingTourId !== null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {t("tours_page.title")}
                    </h1>

                    <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                        {t("tours_page.description")}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openAddModal}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600"
                >
                    <Plus size={18} />
                    {t("tours_page.add_new")}
                </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {tours.map((tour) => {
                    const isActive = tour.status === "active";

                    return (
                        <div
                            key={tour.id}
                            className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
                        >
                            <div className="flex h-36 items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50 dark:from-slate-800 dark:to-slate-900">
                                <MapPin
                                    size={42}
                                    className="text-orange-400 dark:text-orange-500"
                                />
                            </div>

                            <div className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {getTourName(tour)}
                                        </h2>

                                        <p className="mt-1 flex items-center gap-1 text-sm text-gray-500 dark:text-slate-400">
                                            <MapPin size={15} />
                                            {tour.location}
                                        </p>
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${isActive
                                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                                                : "bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400"
                                            }`}
                                    >
                                        {isActive
                                            ? t("tours_page.status.active")
                                            : t("tours_page.status.inactive")}
                                    </span>
                                </div>

                                <div className="mt-5 grid grid-cols-2 gap-3">
                                    <div className="rounded-xl border border-slate-100 bg-gray-50 p-3 dark:border-slate-800/40 dark:bg-slate-800/50">
                                        <p className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
                                            <Calendar size={14} />
                                            {t("tours_page.date")}
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-slate-200">
                                            {tour.date}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-slate-100 bg-gray-50 p-3 dark:border-slate-800/40 dark:bg-slate-800/50">
                                        <p className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
                                            <Users size={14} />
                                            {t("tours_page.capacity")}
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-slate-200">
                                            {t("tours_page.person_count", {
                                                count: tour.capacity,
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-400 dark:text-slate-500">
                                            {t("tours_page.per_person")}
                                        </p>

                                        <p className="text-xl font-bold text-orange-500">
                                            {tour.price}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(tour)}
                                            className="rounded-xl border border-gray-200 p-2.5 text-gray-500 transition-colors hover:bg-gray-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                                            aria-label={t("tours_page.edit")}
                                            title={t("tours_page.edit")}
                                        >
                                            <Pencil size={17} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => deleteTour(tour.id)}
                                            className="rounded-xl border border-red-200 p-2.5 text-red-500 transition-colors hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/20"
                                            aria-label={t("tours_page.delete")}
                                            title={t("tours_page.delete")}
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {tours.length === 0 && (
                <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                    {t("tours_page.not_found")}
                </div>
            )}

            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                    onMouseDown={closeModal}
                >
                    <div
                        className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 dark:border-slate-800">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {isEditing
                                        ? t("tours_page.form.edit_title")
                                        : t("tours_page.form.title")}
                                </h2>

                                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                                    {isEditing
                                        ? t("tours_page.form.edit_description")
                                        : t("tours_page.form.description")}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                aria-label={t("tours_page.form.close")}
                            >
                                <X size={21} />
                            </button>
                        </div>

                        <form onSubmit={saveTour} className="space-y-5 p-6">
                            {formError && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
                                    {formError}
                                </div>
                            )}

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="tour-name"
                                        className="mb-2 block text-sm font-semibold text-gray-700 dark:text-slate-300"
                                    >
                                        {t("tours_page.form.name")}
                                    </label>

                                    <input
                                        id="tour-name"
                                        name="name"
                                        type="text"
                                        value={tourForm.name}
                                        onChange={handleInputChange}
                                        placeholder={t(
                                            "tours_page.form.name_placeholder"
                                        )}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-orange-950"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="tour-location"
                                        className="mb-2 block text-sm font-semibold text-gray-700 dark:text-slate-300"
                                    >
                                        {t("tours_page.form.location")}
                                    </label>

                                    <input
                                        id="tour-location"
                                        name="location"
                                        type="text"
                                        value={tourForm.location}
                                        onChange={handleInputChange}
                                        placeholder={t(
                                            "tours_page.form.location_placeholder"
                                        )}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-orange-950"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="tour-date"
                                        className="mb-2 block text-sm font-semibold text-gray-700 dark:text-slate-300"
                                    >
                                        {t("tours_page.form.date")}
                                    </label>

                                    <input
                                        id="tour-date"
                                        name="date"
                                        type="date"
                                        value={tourForm.date}
                                        onChange={handleInputChange}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-orange-950"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="tour-price"
                                        className="mb-2 block text-sm font-semibold text-gray-700 dark:text-slate-300"
                                    >
                                        {t("tours_page.form.price")}
                                    </label>

                                    <input
                                        id="tour-price"
                                        name="price"
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={tourForm.price}
                                        onChange={handleInputChange}
                                        placeholder={t(
                                            "tours_page.form.price_placeholder"
                                        )}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-orange-950"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="tour-capacity"
                                        className="mb-2 block text-sm font-semibold text-gray-700 dark:text-slate-300"
                                    >
                                        {t("tours_page.form.capacity")}
                                    </label>

                                    <input
                                        id="tour-capacity"
                                        name="capacity"
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={tourForm.capacity}
                                        onChange={handleInputChange}
                                        placeholder={t(
                                            "tours_page.form.capacity_placeholder"
                                        )}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-orange-950"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="tour-status"
                                        className="mb-2 block text-sm font-semibold text-gray-700 dark:text-slate-300"
                                    >
                                        {t("tours_page.form.status")}
                                    </label>

                                    <select
                                        id="tour-status"
                                        name="status"
                                        value={tourForm.status}
                                        onChange={handleInputChange}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-orange-950"
                                    >
                                        <option value="active">
                                            {t("tours_page.status.active")}
                                        </option>

                                        <option value="inactive">
                                            {t("tours_page.status.inactive")}
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    {t("tours_page.form.cancel")}
                                </button>

                                <button
                                    type="submit"
                                    className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                                >
                                    {isEditing ? (
                                        <Pencil size={18} />
                                    ) : (
                                        <Plus size={18} />
                                    )}

                                    {isEditing
                                        ? t("tours_page.form.update")
                                        : t("tours_page.form.save")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}