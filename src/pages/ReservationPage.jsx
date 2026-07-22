import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    PanelLeftOpen,
    ArrowLeft,
    CheckCircle2,
    User,
    Baby,
    Mail,
    Phone,
    ShieldCheck,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import PhoneInput, {
    isValidPhoneNumber,
} from "react-phone-number-input";
import { validatePhoneNumberLength } from "libphonenumber-js/max";
import "react-phone-number-input/style.css";

import ChatSidebar from "../components/ChatSidebar";
import api from "../services/api";
import { useTheme } from "../components/ThemeContext";

function formatPrice(price) {
    const num = Number(price);

    if (Number.isNaN(num)) {
        return price;
    }

    return Math.round(num).toLocaleString("tr-TR");
}

function formatFlightDateTime(value) {
    if (!value) return value;

    const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        ...(isDateOnly
            ? {}
            : {
                hour: "2-digit",
                minute: "2-digit",
            }),
    });
}

function formatBaggage(baggage, t) {
    if (
        !baggage ||
        baggage === "0kg" ||
        baggage === "0 kg"
    ) {
        return t
            ? t("baggage_not_included")
            : "Baggage not included";
    }

    return baggage;
}

function toDateOnly(value) {
    if (!value) return null;

    const match = /^\d{4}-\d{2}-\d{2}/.exec(value);

    if (match) {
        return match[0];
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toISOString().slice(0, 10);
}

function getPassengerErrors(passenger, index = 0) {
    const errors = {};
    const isPrimaryContact = index === 0;

    if (!passenger.firstName?.trim()) {
        errors.firstName = "Ad gereklidir.";
    }

    if (!passenger.lastName?.trim()) {
        errors.lastName = "Soyad gereklidir.";
    }

    if (passenger.nationality?.toUpperCase() === "TR") {
        if (
            !/^[1-9]\d{10}$/.test(
                passenger.identityNumber || ""
            )
        ) {
            errors.identityNumber =
                "Geçersiz T.C. Kimlik No (11 hane olmalı ve 0 ile başlamamalı).";
        }
    } else if (
        !passenger.identityNumber?.trim() ||
        passenger.identityNumber.trim().length < 5
    ) {
        errors.identityNumber =
            "Geçersiz Pasaport No (en az 5 karakter).";
    }

    if (!passenger.birthDate) {
        errors.birthDate = "Doğum tarihi gereklidir.";
    } else {
        const birthDate = new Date(passenger.birthDate);
        if (birthDate >= new Date()) {
            errors.birthDate = "Doğum tarihi geçmişte olmalıdır.";
        } else if (isPrimaryContact) {
            const eighteenYearsAgo = new Date();
            eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
            if (birthDate > eighteenYearsAgo) {
                errors.birthDate = "Rezervasyonu yapan kişi 18 yaşından büyük olmalıdır.";
            }
        }
    }

    if (isPrimaryContact) {
        if (!passenger.email?.trim()) {
            errors.email = "E-posta gereklidir.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passenger.email)) {
            errors.email = "Geçersiz e-posta formatı (örn: ad@example.com).";
        }

        if (!passenger.phone) {
            errors.phone = "Telefon numarası gereklidir.";
        } else if (!isValidPhoneNumber(passenger.phone)) {
            errors.phone = "Ülke formatına uymuyor (geçersiz uzunluk).";
        }
    }

    return errors;
}

export default function ReservationPage() {
    const { t, i18n } = useTranslation();
    const { theme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    const [isSidebarOpen, setIsSidebarOpen] =
        useState(true);
    const [passengers, setPassengers] = useState([]);
    const [expandedGuestId, setExpandedGuestId] =
        useState("adult-0");
    const [isSubmitting, setIsSubmitting] =
        useState(false);
    const [submitError, setSubmitError] =
        useState("");
    const [reservationResult, setReservationResult] =
        useState(null);

    const videoRef = useRef(null);

    const selectedItem = location.state?.selectedItem;
    const bookingDetails =
        location.state?.bookingDetails || {};
    const sessionId = location.state?.sessionId;

    const editData =
        location.state?.reservationData;
    const isEditMode =
        location.state?.editMode || false;

    const normalizedEditType =
        editData?.type?.toUpperCase();

    const activeItem = selectedItem || editData;

    const isFlight = selectedItem
        ? selectedItem.airline !== undefined
        : normalizedEditType === "FLIGHT";

    const adultCount = isEditMode
        ? Math.max(
            1,
            (editData?.passengers || []).filter(
                (passenger) =>
                    passenger.type !== "CHILD" && passenger.type !== "INFANT"
            ).length ||
            editData?.passengers?.length ||
            1
        )
        : isFlight
            ? parseInt(
                bookingDetails?.passengerCount,
                10
            ) || 1
            : parseInt(
                bookingDetails?.adultCount,
                10
            ) || 1;

    const childCount = isEditMode
        ? (editData?.passengers || []).filter(
            (passenger) =>
                passenger.type === "CHILD"
        ).length
        : isFlight
            ? 0
            : parseInt(
                bookingDetails?.childCount,
                10
            ) || 0;

    const childAges = useMemo(
        () =>
            isFlight
                ? []
                : bookingDetails?.childAges || [],
        [isFlight, bookingDetails?.childAges]
    );

    // Bebekler için de yolcu formu alanı açılmalı — aksi hâlde "2 yetişkin 1 bebek"
    // ile arama yapılıp rezervasyona geçildiğinde bebek sessizce yolcu listesinden
    // düşüyordu (TourVisio'ya giden arama isteğinde bebek yetişkin sayısına
    // eklenirken, kullanıcıya gösterilen rezervasyon formu bunu hiç bilmiyordu).
    const infantCount = isEditMode
        ? (editData?.passengers || []).filter(
            (passenger) =>
                passenger.type === "INFANT"
        ).length
        : isFlight
            ? 0
            : parseInt(
                bookingDetails?.infantCount,
                10
            ) || 0;

    const infantAges = useMemo(
        () =>
            isFlight
                ? []
                : bookingDetails?.infantAges || [],
        [isFlight, bookingDetails?.infantAges]
    );

    useEffect(() => {
        if (!videoRef.current) return;

        videoRef.current.load();
        videoRef.current
            .play()
            .catch((error) =>
                console.log(
                    "Video oynatılamadı:",
                    error
                )
            );
    }, [theme]);

    useEffect(() => {
        if (
            isEditMode &&
            Array.isArray(editData?.passengers) &&
            editData.passengers.length > 0
        ) {
            const mappedPassengers =
                editData.passengers.map(
                    (passenger, index) => ({
                        id:
                            passenger.id ||
                            (passenger.type === "CHILD"
                                ? `child-${index}`
                                : `adult-${index}`),
                        type:
                            passenger.type ||
                            (passenger.age !== undefined
                                ? "CHILD"
                                : "ADULT"),
                        firstName:
                            passenger.firstName || "",
                        lastName:
                            passenger.lastName || "",
                        identityNumber:
                            passenger.identityNumber || "",
                        email: passenger.email || "",
                        phone:
                            passenger.phoneNumber ||
                            passenger.phone ||
                            "",
                        phoneCountry:
                            passenger.phoneCountry ||
                            passenger.country ||
                            "TR",
                        birthDate:
                            passenger.birthDate || "",
                        gender:
                            passenger.gender ||
                            (passenger.type === "CHILD"
                                ? "CHD"
                                : "MR"),
                        nationality:
                            passenger.nationality || "TR",
                        age:
                            passenger.age !== undefined &&
                                passenger.age !== null
                                ? String(passenger.age)
                                : "",
                    })
                );

            setPassengers(mappedPassengers);
            setExpandedGuestId(
                mappedPassengers[0]?.id || "adult-0"
            );
            return;
        }

        if (!selectedItem) {
            setPassengers([]);
            return;
        }

        const initialPassengers = [];

        for (
            let index = 0;
            index < adultCount;
            index++
        ) {
            initialPassengers.push({
                id: `adult-${index}`,
                type: "ADULT",
                firstName: "",
                lastName: "",
                identityNumber: "",
                email: "",
                phone: "",
                phoneCountry: "TR",
                birthDate: "",
                gender: "MR",
                nationality: "TR",
            });
        }

        for (
            let index = 0;
            index < childCount;
            index++
        ) {
            initialPassengers.push({
                id: `child-${index}`,
                type: "CHILD",
                firstName: "",
                lastName: "",
                identityNumber: "",
                email: "",
                phone: "",
                phoneCountry: "TR",
                birthDate: "",
                gender: "CHD",
                nationality: "TR",
                age:
                    childAges[index] !== undefined
                        ? String(childAges[index])
                        : "",
            });
        }

        for (
            let index = 0;
            index < infantCount;
            index++
        ) {
            initialPassengers.push({
                id: `infant-${index}`,
                type: "INFANT",
                firstName: "",
                lastName: "",
                identityNumber: "",
                email: "",
                phone: "",
                phoneCountry: "TR",
                birthDate: "",
                gender: "CHD",
                nationality: "TR",
                age:
                    infantAges[index] !== undefined
                        ? String(infantAges[index])
                        : "",
            });
        }

        setPassengers(initialPassengers);
        setExpandedGuestId(
            initialPassengers[0]?.id || "adult-0"
        );
    }, [
        selectedItem,
        isEditMode,
        editData,
        adultCount,
        childCount,
        childAges,
        infantCount,
        infantAges,
    ]);

    useEffect(() => {
        if (isEditMode || passengers.length === 0) {
            return;
        }

        const fetchPrefill = async () => {
            try {
                const response = await api.get(
                    "/api/reservations/prefill"
                );

                const data = response.data;

                if (!data) return;

                setPassengers((previousPassengers) => {
                    if (
                        !previousPassengers ||
                        previousPassengers.length === 0
                    ) {
                        return previousPassengers;
                    }

                    const updated = [
                        ...previousPassengers,
                    ];

                    updated[0] = {
                        ...updated[0],
                        firstName:
                            updated[0].firstName ||
                            data.firstName ||
                            "",
                        lastName:
                            updated[0].lastName ||
                            data.lastName ||
                            "",
                        email:
                            updated[0].email ||
                            data.email ||
                            "",
                        phone:
                            updated[0].phone ||
                            data.phoneNumber ||
                            "",
                    };

                    return updated;
                });
            } catch {
                // Prefill başarısız olursa form boş kalır.
            }
        };

        fetchPrefill();
    }, [isEditMode, passengers.length]);

    const handleBack = () => {
        if (isEditMode) {
            navigate("/appointments");
            return;
        }

        navigate(
            sessionId
                ? `/chat?sessionId=${sessionId}`
                : "/chat"
        );
    };

    const handlePassengerChange = (
        index,
        field,
        value
    ) => {
        setPassengers((previousPassengers) => {
            const updated = [...previousPassengers];

            updated[index] = {
                ...updated[index],
                [field]: value,
            };

            return updated;
        });
    };

    const isPassengerFormValid =
        passengers.length > 0 &&
        passengers.every((passenger, passengerIndex) => {
            const errors =
                getPassengerErrors(passenger, passengerIndex);

            return Object.keys(errors).length === 0;
        });

    const handleConfirm = async (event) => {
        event?.preventDefault();

        if (
            (!selectedItem && !isEditMode) ||
            !isPassengerFormValid ||
            isSubmitting
        ) {
            return;
        }

        setSubmitError("");

        const startDate = selectedItem
            ? isFlight
                ? toDateOnly(
                    selectedItem.departureTime
                )
                : toDateOnly(
                    bookingDetails?.checkIn
                )
            : toDateOnly(editData?.startDate);

        const endDate = selectedItem
            ? isFlight
                ? toDateOnly(
                    selectedItem.returnDepartureTime
                ) || startDate
                : toDateOnly(
                    bookingDetails?.checkOut
                )
            : toDateOnly(editData?.endDate) ||
            startDate;

        const payload = {
            sessionId: sessionId || null,
            type: isFlight ? "FLIGHT" : "HOTEL",
            itemName: selectedItem
                ? isFlight
                    ? selectedItem.airline
                    : selectedItem.name ||
                    selectedItem.hotelId ||
                    "-"
                : editData?.itemName ||
                editData?.title ||
                "-",
            destination: selectedItem
                ? isFlight
                    ? bookingDetails?.arrivalCity ||
                    "-"
                    : bookingDetails?.city ||
                    selectedItem.region ||
                    "-"
                : editData?.destination || "-",
            startDate,
            endDate,
            totalPrice: selectedItem
                ? Number(selectedItem.price) || 0
                : Number(editData?.totalPrice) || 0,
            currency:
                selectedItem?.currency ||
                editData?.currency ||
                "TRY",
            passengers: passengers.map(
                (passenger, passengerIndex) => ({
                    firstName:
                        passenger.firstName?.trim() || "",
                    lastName:
                        passenger.lastName?.trim() || "",
                    email:
                        passengerIndex === 0 ? passenger.email?.trim() || "" : "",
                    phoneNumber:
                        passengerIndex === 0 ? passenger.phone?.trim() || "" : "",
                    identityNumber:
                        passenger.identityNumber?.trim() || "",
                    birthDate:
                        passenger.birthDate || null,
                    gender:
                        passenger.gender ||
                        (passenger.type === "CHILD"
                            ? "CHD"
                            : "MR"),
                    nationality:
                        passenger.nationality || "TR",
                })
            ),
        };

        setIsSubmitting(true);

        try {
            let response;

            if (isEditMode && editData?.id) {
                response = await api.put(
                    `/api/reservations/${editData.id}`,
                    payload
                );
            } else {
                response = await api.post(
                    "/api/reservations",
                    payload
                );
            }

            setReservationResult(response.data);
        } catch (error) {
            console.error(
                "Reservation request failed",
                error
            );

            setSubmitError(
                t("reservation_confirm_error")
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative flex h-screen w-full overflow-hidden bg-transparent font-sans">
            <video
                ref={videoRef}
                src={
                    theme === "dark"
                        ? "/videos/darkmode_bg.mp4"
                        : "/videos/chatbot_bg.mp4"
                }
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="pointer-events-none fixed inset-0 z-0 h-full w-full object-cover"
            />

            <div className="pointer-events-none fixed inset-0 z-10 bg-white/20 dark:bg-slate-950/60" />

            <ChatSidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />

            <div className="relative z-20 flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-transparent">
                {!isSidebarOpen && (
                    <button
                        type="button"
                        onClick={() =>
                            setIsSidebarOpen(true)
                        }
                        className="fixed left-4 top-4 z-40 cursor-pointer rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-md transition-all hover:bg-slate-50 hover:text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        title={t(
                            "reservation_expand_sidebar"
                        )}
                    >
                        <PanelLeftOpen size={18} />
                    </button>
                )}

                <div className="z-20 flex flex-1 items-start justify-center overflow-y-auto px-4 py-8 md:py-12">
                    <div className="mt-4 w-full max-w-[672px] md:mt-6">
                        <div className="rounded-[20px] border border-slate-200 bg-white/95 p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900/95 md:p-10">
                            <h1 className="mb-6 text-[28px] font-bold leading-tight text-slate-900 dark:text-white">
                                {isEditMode
                                    ? t(
                                        "reservation_edit_title",
                                        "Rezervasyon Düzenle"
                                    )
                                    : t("reservation_title")}
                            </h1>

                            {!activeItem ? (
                                <div className="py-8 text-center">
                                    <p className="mb-6 font-medium text-slate-800 dark:text-slate-200">
                                        {t("reservation_no_item")}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="mx-auto flex items-center justify-center gap-2 rounded-[12px] bg-[#3B82F6] px-6 py-3 text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-[#2563EB]"
                                    >
                                        <ArrowLeft size={16} />
                                        {isEditMode
                                            ? "Geçmiş Randevulara Dön"
                                            : t(
                                                "reservation_back_to_chat"
                                            )}
                                    </button>
                                </div>
                            ) : reservationResult ? (
                                <div className="py-8 text-center">
                                    <CheckCircle2
                                        size={48}
                                        className="mx-auto mb-4 text-emerald-500"
                                    />

                                    <p className="mb-4 font-medium text-slate-800 dark:text-slate-200">
                                        {isEditMode
                                            ? "Rezervasyon başarıyla güncellendi."
                                            : t(
                                                "reservation_confirm_success",
                                                {
                                                    number:
                                                        reservationResult.reservationNumber ||
                                                        reservationResult.id,
                                                }
                                            )}
                                    </p>

                                    <p className="mb-6 rounded-xl border border-blue-200 bg-blue-50/80 p-4 text-xs md:text-sm font-medium text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-200">
                                        Rezervasyon detaylarınız ve biletiniz{" "}
                                        <strong className="font-bold text-blue-600 dark:text-blue-400">
                                            {passengers[0]?.email || reservationResult?.passengers?.[0]?.email || "e-posta"}
                                        </strong>{" "}
                                        adresine e-posta olarak gönderilmiştir.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="mx-auto flex items-center justify-center gap-2 rounded-[12px] bg-[#3B82F6] px-6 py-3 text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-[#2563EB]"
                                    >
                                        <ArrowLeft size={16} />
                                        {isEditMode
                                            ? "Geçmiş Randevulara Dön"
                                            : t(
                                                "reservation_back_to_chat"
                                            )}
                                    </button>
                                </div>
                            ) : (
                                <form
                                    onSubmit={handleConfirm}
                                    className="space-y-4"
                                >
                                    {isFlight ? (
                                        <div className="rounded-[16px] border border-slate-200 bg-white/50 p-6 dark:border-slate-800 dark:bg-slate-900/40">
                                            <div className="mb-4 flex items-center justify-between gap-4">
                                                <span className="text-xl font-bold text-[#1E232C] dark:text-white">
                                                    ✈️{" "}
                                                    {selectedItem?.airline ||
                                                        editData?.itemName}
                                                </span>

                                                <span className="text-xl font-bold text-[#3B82F6] dark:text-blue-400">
                                                    {formatPrice(
                                                        selectedItem?.price ??
                                                        editData?.totalPrice
                                                    )}{" "}
                                                    {selectedItem?.currency ||
                                                        editData?.currency ||
                                                        "TRY"}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 text-sm font-medium text-slate-800 dark:text-slate-200 md:grid-cols-2">
                                                <div>
                                                    <span className="mb-1 block text-xs uppercase text-slate-500 dark:text-slate-400">
                                                        {t(
                                                            "reservation_departure"
                                                        )}
                                                    </span>
                                                    {formatFlightDateTime(
                                                        selectedItem?.departureTime ||
                                                        editData?.startDate
                                                    )}
                                                </div>

                                                <div>
                                                    <span className="mb-1 block text-xs uppercase text-slate-500 dark:text-slate-400">
                                                        {t(
                                                            "reservation_arrival"
                                                        )}
                                                    </span>
                                                    {formatFlightDateTime(
                                                        selectedItem?.arrivalTime ||
                                                        editData?.endDate
                                                    )}
                                                </div>

                                                {selectedItem?.transfers && (
                                                    <div>
                                                        <span className="mb-1 block text-xs uppercase text-slate-500 dark:text-slate-400">
                                                            {t(
                                                                "reservation_transfers"
                                                            )}
                                                        </span>
                                                        {
                                                            selectedItem.transfers
                                                        }
                                                    </div>
                                                )}

                                                {selectedItem?.baggage && (
                                                    <div>
                                                        <span className="mb-1 block text-xs uppercase text-slate-500 dark:text-slate-400">
                                                            {t(
                                                                "reservation_baggage"
                                                            )}
                                                        </span>
                                                        {formatBaggage(
                                                            selectedItem.baggage,
                                                            t
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {selectedItem?.returnDepartureTime && (
                                                <div className="mt-4 grid grid-cols-1 gap-4 border-t border-dashed border-slate-300 pt-4 text-sm font-medium text-slate-800 dark:border-slate-800 dark:text-slate-200 md:grid-cols-2">
                                                    <div className="col-span-full font-bold">
                                                        ↩{" "}
                                                        {selectedItem.returnAirline ||
                                                            selectedItem.airline}
                                                    </div>

                                                    <div>
                                                        <span className="mb-1 block text-xs uppercase text-slate-500 dark:text-slate-400">
                                                            {t(
                                                                "reservation_return_departure"
                                                            )}
                                                        </span>
                                                        {formatFlightDateTime(
                                                            selectedItem.returnDepartureTime
                                                        )}
                                                    </div>

                                                    <div>
                                                        <span className="mb-1 block text-xs uppercase text-slate-500 dark:text-slate-400">
                                                            {t(
                                                                "reservation_return_arrival"
                                                            )}
                                                        </span>
                                                        {formatFlightDateTime(
                                                            selectedItem.returnArrivalTime
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="rounded-[16px] border border-slate-200 bg-white/50 p-6 dark:border-slate-800 dark:bg-slate-900/40">
                                            <div className="mb-4 flex items-start justify-between gap-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xl font-bold text-[#1E232C] dark:text-white">
                                                        🏨{" "}
                                                        {selectedItem?.name ||
                                                            selectedItem?.hotelId ||
                                                            editData?.itemName ||
                                                            editData?.title}
                                                    </span>

                                                    <span className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                                        {selectedItem?.region ||
                                                            editData?.destination}
                                                        {selectedItem?.stars
                                                            ? ` • ${selectedItem.stars}★`
                                                            : ""}
                                                    </span>
                                                </div>

                                                <span className="text-xl font-bold text-[#3B82F6] dark:text-blue-400">
                                                    {formatPrice(
                                                        selectedItem?.price ??
                                                        editData?.totalPrice
                                                    )}{" "}
                                                    {selectedItem?.currency ||
                                                        editData?.currency ||
                                                        "TRY"}
                                                </span>
                                            </div>

                                            {selectedItem && (
                                                <div className="border-t border-slate-200 pt-4 text-sm font-medium text-slate-800 dark:border-slate-800 dark:text-slate-200">
                                                    <span className="mb-1 block text-xs uppercase text-slate-500 dark:text-slate-400">
                                                        {t(
                                                            "reservation_board_pension"
                                                        )}
                                                    </span>

                                                    {selectedItem.boardType ||
                                                        selectedItem.pensionType ||
                                                        t("reservation_na")}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                                            {t(
                                                "reservation_passenger_info"
                                            )}
                                        </h2>
                                        {passengers.map((passenger, index) => {
                                            const isExpanded =
                                                expandedGuestId === passenger.id;

                                            const guestTitle = `${index + 1}. ${t(
                                                "reservation_person",
                                                "Kişi"
                                            )}`;

                                            const errors =
                                                getPassengerErrors(passenger, index);

                                            return (
                                                <div
                                                    key={passenger.id || index}
                                                    className="overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm transition-all duration-200 dark:border-slate-700/80 dark:bg-slate-800"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setExpandedGuestId(
                                                                isExpanded
                                                                    ? null
                                                                    : passenger.id
                                                            )
                                                        }
                                                        className="flex w-full items-center justify-between bg-white px-5 py-4 transition-colors hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/80"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {passenger.type === "ADULT" ? (
                                                                <User
                                                                    size={18}
                                                                    className="text-blue-500 dark:text-slate-200"
                                                                />
                                                            ) : (
                                                                <Baby
                                                                    size={18}
                                                                    className="text-amber-500 dark:text-amber-300"
                                                                />
                                                            )}

                                                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                                {guestTitle}
                                                            </span>

                                                            {index === 0 && (
                                                                <span className="ml-2 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                                                    İletişim
                                                                </span>
                                                            )}

                                                            {!isExpanded &&
                                                                (passenger.firstName ||
                                                                    passenger.lastName) && (
                                                                    <span className="ml-2 border-l border-slate-200 pl-4 text-sm font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400">
                                                                        {passenger.firstName}{" "}
                                                                        {passenger.lastName}
                                                                    </span>
                                                                )}
                                                        </div>

                                                        <div className="text-slate-400 dark:text-slate-400">
                                                            {isExpanded ? (
                                                                <ChevronUp size={20} />
                                                            ) : (
                                                                <ChevronDown size={20} />
                                                            )}
                                                        </div>
                                                    </button>

                                                    {isExpanded && (
                                                        <div className="space-y-4 border-t border-slate-200/80 bg-slate-50/70 p-5 dark:border-slate-700/60 dark:bg-slate-900/60">
                                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                                <div>
                                                                    <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                                                                        {t("reservation_first_name")}
                                                                    </label>
                                                                    <input
                                                                        required
                                                                        type="text"
                                                                        value={passenger.firstName || ""}
                                                                        onChange={(event) =>
                                                                            handlePassengerChange(
                                                                                index,
                                                                                "firstName",
                                                                                event.target.value
                                                                            )
                                                                        }
                                                                        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none dark:bg-slate-900 dark:text-white dark:placeholder-slate-400 ${errors.firstName
                                                                            ? "border-red-500 ring-1 ring-red-500 dark:border-red-500 dark:ring-red-400/50"
                                                                            : "border-slate-300 focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/50 dark:border-slate-700"
                                                                            }`}
                                                                    />
                                                                    {errors.firstName && (
                                                                        <span className="mt-1 block text-[10px] font-medium text-red-600 dark:text-red-400">
                                                                            {errors.firstName}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <div>
                                                                    <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                                                                        {t("reservation_last_name")}
                                                                    </label>
                                                                    <input
                                                                        required
                                                                        type="text"
                                                                        value={passenger.lastName || ""}
                                                                        onChange={(event) => {
                                                                            const cleanValue = event.target.value.replace(
                                                                                /[^A-Za-zÇĞİÖŞÜçğıöşü\s'-]/g,
                                                                                ""
                                                                            );
                                                                            handlePassengerChange(
                                                                                index,
                                                                                "lastName",
                                                                                cleanValue
                                                                            );
                                                                        }}
                                                                        onInput={(event) => {
                                                                            event.currentTarget.value = event.currentTarget.value.replace(
                                                                                /[^A-Za-zÇĞİÖŞÜçğıöşü\s'-]/g,
                                                                                ""
                                                                            );
                                                                        }}
                                                                        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none dark:bg-slate-900 dark:text-white dark:placeholder-slate-400 ${errors.lastName
                                                                            ? "border-red-500 ring-1 ring-red-500 dark:border-red-500 dark:ring-red-400/50"
                                                                            : "border-slate-300 focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/50 dark:border-slate-700"
                                                                            }`}
                                                                    />
                                                                    {errors.lastName && (
                                                                        <span className="mt-1 block text-[10px] font-medium text-red-600 dark:text-red-400">
                                                                            {errors.lastName}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                                    <div>
                                                                        <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200">
                                                                            {t("reservation_gender", "Cinsiyet")}
                                                                        </label>
                                                                        <select
                                                                            required
                                                                            value={
                                                                                passenger.gender || "MR"
                                                                            }
                                                                            onChange={(
                                                                                event
                                                                            ) =>
                                                                                handlePassengerChange(
                                                                                    index,
                                                                                    "gender",
                                                                                    event.target
                                                                                        .value
                                                                                )
                                                                            }
                                                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                                                        >
                                                                            <option value="MR">
                                                                                {i18n.language?.startsWith("tr") ? "Erkek" : "Mr"}
                                                                            </option>
                                                                            <option value="MRS">
                                                                                {i18n.language?.startsWith("tr") ? "Kadın" : "Mrs"}
                                                                            </option>
                                                                        </select>
                                                                    </div>

                                                                    <div>
                                                                        <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                                                                            Doğum Tarihi
                                                                        </label>
                                                                        <input
                                                                            required
                                                                            type="date"
                                                                            max={new Date()
                                                                                .toISOString()
                                                                                .split("T")[0]}
                                                                            value={
                                                                                passenger.birthDate ||
                                                                                ""
                                                                            }
                                                                            onChange={(
                                                                                event
                                                                            ) =>
                                                                                handlePassengerChange(
                                                                                    index,
                                                                                    "birthDate",
                                                                                    event.target
                                                                                        .value
                                                                                )
                                                                            }
                                                                            className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:outline-none dark:bg-slate-900 dark:text-white ${errors.birthDate
                                                                                ? "border-red-500 ring-1 ring-red-500"
                                                                                : "border-slate-300 focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/50 dark:border-slate-800"
                                                                                }`}
                                                                        />
                                                                        {errors.birthDate && (
                                                                            <span className="mt-1 block text-[10px] font-medium text-red-500">
                                                                                {
                                                                                    errors.birthDate
                                                                                }
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                                    <div>
                                                                        <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                                                                            Uyruk
                                                                        </label>
                                                                        <select
                                                                            required
                                                                            value={passenger.nationality || "TR"}
                                                                            onChange={(event) => {
                                                                                const newNat = event.target.value;
                                                                                handlePassengerChange(index, "nationality", newNat);
                                                                                handlePassengerChange(index, "identityNumber", "");
                                                                            }}
                                                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                                                        >
                                                                            <option value="TR">Türkiye (TR)</option>
                                                                            <option value="DE">Almanya (DE)</option>
                                                                            <option value="RU">Rusya (RU)</option>
                                                                            <option value="US">ABD (US)</option>
                                                                            <option value="GB">İngiltere (GB)</option>
                                                                            <option value="FR">Fransa (FR)</option>
                                                                            <option value="AZ">Azerbaycan (AZ)</option>
                                                                            <option value="OTHER">Diğer (OTHER)</option>
                                                                        </select>
                                                                    </div>

                                                                    <div>
                                                                        <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                                                                            <ShieldCheck
                                                                                size={12}
                                                                            />
                                                                            {passenger.nationality === "TR"
                                                                                ? "T.C. Kimlik Numarası"
                                                                                : "Pasaport Numarası"}
                                                                        </label>
                                                                        <input
                                                                            required
                                                                            type="text"
                                                                            inputMode={
                                                                                passenger.nationality === "TR"
                                                                                    ? "numeric"
                                                                                    : "text"
                                                                            }
                                                                            value={
                                                                                passenger.identityNumber ||
                                                                                ""
                                                                            }
                                                                            onChange={(event) => {
                                                                                const rawValue =
                                                                                    event.target.value;
                                                                                const cleanValue = passenger.nationality === "TR"
                                                                                    ? rawValue.replace(/\D/g, "").slice(0, 11)
                                                                                    : rawValue.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 20);

                                                                                handlePassengerChange(index, "identityNumber", cleanValue);
                                                                            }}
                                                                            placeholder={
                                                                                passenger.nationality === "TR"
                                                                                    ? "11 haneli T.C. kimlik numarası"
                                                                                    : "Pasaport numarası"
                                                                            }
                                                                            className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:outline-none dark:bg-slate-900 dark:text-white ${errors.identityNumber
                                                                                ? "border-red-500 ring-1 ring-red-500"
                                                                                : "border-slate-300 focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/50 dark:border-slate-800"
                                                                                }`}
                                                                        />
                                                                        {errors.identityNumber && (
                                                                            <span className="mt-1 block text-[10px] font-medium text-red-500">
                                                                                {
                                                                                    errors.identityNumber
                                                                                }
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {index === 0 && (
                                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                                    <div>
                                                                        <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                                                                            <Mail size={12} />
                                                                            {t(
                                                                                "reservation_email"
                                                                            )}
                                                                        </label>
                                                                        <input
                                                                            required
                                                                            type="email"
                                                                            value={
                                                                                passenger.email ||
                                                                                ""
                                                                            }
                                                                            onChange={(
                                                                                event
                                                                            ) =>
                                                                                handlePassengerChange(
                                                                                    index,
                                                                                    "email",
                                                                                    event.target
                                                                                        .value
                                                                                )
                                                                            }
                                                                            className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:outline-none dark:bg-slate-900 dark:text-white ${errors.email
                                                                                ? "border-red-500 ring-1 ring-red-500"
                                                                                : "border-slate-300 focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/50 dark:border-slate-800"
                                                                                }`}
                                                                        />
                                                                        {errors.email && (
                                                                            <span className="mt-1 block text-[10px] font-medium text-red-500">
                                                                                {errors.email}
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    <div>
                                                                        <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                                                                            <Phone size={12} />
                                                                            {t(
                                                                                "reservation_phone"
                                                                            )}
                                                                        </label>

                                                                        <PhoneInput
                                                                            international
                                                                            limitMaxLength
                                                                            defaultCountry="TR"
                                                                            onCountryChange={(country) => {
                                                                                handlePassengerChange(
                                                                                    index,
                                                                                    "phoneCountry",
                                                                                    country || "TR"
                                                                                );

                                                                                // Ülke değiştiğinde eski ülkeye ait numarayı temizler.
                                                                                handlePassengerChange(
                                                                                    index,
                                                                                    "phone",
                                                                                    ""
                                                                                );
                                                                            }}
                                                                            value={
                                                                                passenger.phone ||
                                                                                ""
                                                                            }
                                                                            onChange={(value) => {
                                                                                const nextPhone =
                                                                                    value || "";

                                                                                if (!nextPhone) {
                                                                                    handlePassengerChange(
                                                                                        index,
                                                                                        "phone",
                                                                                        ""
                                                                                    );
                                                                                    return;
                                                                                }

                                                                                const lengthError =
                                                                                    validatePhoneNumberLength(
                                                                                        nextPhone
                                                                                    );

                                                                                // Eksik numara yazılabilir; yalnızca fazla rakam engellenir.
                                                                                if (
                                                                                    lengthError !==
                                                                                    "TOO_LONG"
                                                                                ) {
                                                                                    handlePassengerChange(
                                                                                        index,
                                                                                        "phone",
                                                                                        nextPhone
                                                                                    );
                                                                                }
                                                                            }}
                                                                            className={`flex w-full items-center rounded-lg border bg-white px-3 py-1.5 text-sm transition-colors dark:bg-slate-900 ${errors.phone
                                                                                ? "border-red-500 ring-1 ring-red-500"
                                                                                : "border-slate-300 focus-within:border-[#3B82F6] focus-within:ring-2 focus-within:ring-[#3B82F6]/50 dark:border-slate-800"
                                                                                }`}
                                                                            numberInputProps={{
                                                                                required: index === 0,
                                                                                inputMode: "tel",
                                                                                autoComplete:
                                                                                    index === 0
                                                                                        ? "tel"
                                                                                        : "off",
                                                                                className:
                                                                                    "ml-2 w-full border-0 bg-transparent py-1 text-slate-800 outline-none focus:ring-0 dark:text-slate-100",
                                                                            }}
                                                                        />

                                                                        {errors.phone && (
                                                                            <span className="mt-1 block text-[10px] font-medium text-red-500">
                                                                                {errors.phone}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                    </div>

                                    {submitError && (
                                <p className="text-right text-sm font-medium text-red-600 dark:text-red-400">
                                    {submitError}
                                </p>
                            )}

                            <div className="mt-8 flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    disabled={isSubmitting}
                                    className="rounded-[12px] border border-slate-300 px-6 py-3 text-[14px] font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    {t("reservation_cancel")}
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        !isPassengerFormValid ||
                                        isSubmitting
                                    }
                                    className="rounded-[12px] bg-[#3B82F6] px-6 py-3 text-[14px] font-semibold text-white shadow-md transition-colors duration-200 hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:bg-slate-400 dark:disabled:bg-slate-700"
                                >
                                    {isSubmitting
                                        ? t(
                                            "reservation_submitting"
                                        )
                                        : isEditMode
                                            ? t(
                                                "reservation_update_confirm",
                                                "Güncelle"
                                            )
                                            : t(
                                                "reservation_confirm_proceed"
                                            )}
                                </button>
                            </div>
                        </form>
                            )}
                    </div>
                </div>
            </div>
        </div>
        </div >
    );
}