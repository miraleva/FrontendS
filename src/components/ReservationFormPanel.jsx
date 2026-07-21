import React, { useEffect, useState } from "react";
import {
  X,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Baby,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  MapPin,
  Star,
  Info,
  CheckCircle2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import PhoneInput, {
  isValidPhoneNumber,
} from "react-phone-number-input";
import "react-phone-number-input/style.css";
import api from "../services/api";

function toDateOnly(value) {
  if (!value) return null;

  const match = /^\d{4}-\d{2}-\d{2}/.exec(value);
  if (match) return match[0];

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString().slice(0, 10);
}

const getPassengerErrors = (passenger) => {
  const errors = {};

  if (!passenger.firstName?.trim()) {
    errors.firstName = "Ad gereklidir.";
  }

  if (!passenger.lastName?.trim()) {
    errors.lastName = "Soyad gereklidir.";
  }

  if (passenger.nationality?.toUpperCase() === "TR") {
    if (!/^[1-9]\d{10}$/.test(passenger.identityNumber || "")) {
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
  } else if (new Date(passenger.birthDate) >= new Date()) {
    errors.birthDate = "Doğum tarihi geçmişte olmalıdır.";
  }

  if (!passenger.email?.trim()) {
    errors.email = "E-posta gereklidir.";
  } else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passenger.email)
  ) {
    errors.email =
      "Geçersiz e-posta formatı (örn: ad@example.com).";
  }

  if (!passenger.phone) {
    errors.phone = "Telefon numarası gereklidir.";
  } else if (!isValidPhoneNumber(passenger.phone)) {
    errors.phone =
      "Ülke formatına uymuyor (geçersiz uzunluk).";
  }

  return errors;
};

export default function ReservationFormPanel({
  hotel = {},
  bookingDetails = {},
  onClose,
  onBack,
  guests = [],
  setGuests,
  termsAccepted = false,
  setTermsAccepted,
}) {
  const { t } = useTranslation();

  const safeHotel = hotel || {};

  const [expandedGuestId, setExpandedGuestId] =
    useState("adult-0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [reservationResult, setReservationResult] =
    useState(null);

  useEffect(() => {
    if (typeof setGuests !== "function") return;

    try {
      const passengersList =
        bookingDetails?.passengers ||
        bookingDetails?.editData?.passengers;

      if (
        bookingDetails?.editMode &&
        Array.isArray(passengersList) &&
        passengersList.length > 0
      ) {
        const mappedGuests = passengersList.map(
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
            firstName: passenger.firstName || "",
            lastName: passenger.lastName || "",
            identityNumber:
              passenger.identityNumber ||
              passenger.tcNo ||
              "",
            email: passenger.email || "",
            phone:
              passenger.phoneNumber ||
              passenger.phone ||
              "",
            birthDate: passenger.birthDate || "",
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
                ? passenger.age.toString()
                : "",
          })
        );

        setGuests(mappedGuests);
        setExpandedGuestId(mappedGuests[0]?.id || "adult-0");
        return;
      }

      if (!guests || guests.length === 0) {
        const adultCount =
          parseInt(bookingDetails?.adultCount, 10) || 1;
        const childCount =
          parseInt(bookingDetails?.childCount, 10) || 0;
        const childAges =
          bookingDetails?.childAges || [];

        const initialGuests = [];

        for (let index = 0; index < adultCount; index++) {
          initialGuests.push({
            id: `adult-${index}`,
            type: "ADULT",
            firstName: "",
            lastName: "",
            identityNumber: "",
            email: "",
            phone: "",
            birthDate: "",
            gender: "MR",
            nationality: "TR",
          });
        }

        for (let index = 0; index < childCount; index++) {
          initialGuests.push({
            id: `child-${index}`,
            type: "CHILD",
            firstName: "",
            lastName: "",
            identityNumber: "",
            email: "",
            phone: "",
            birthDate: "",
            gender: "CHD",
            nationality: "TR",
            age:
              childAges[index] !== undefined
                ? childAges[index].toString()
                : "",
          });
        }

        setGuests(initialGuests);

        api
          .get("/api/reservations/prefill")
          .then((response) => {
            const data = response.data;
            if (!data) return;

            setGuests((previousGuests) => {
              if (
                !previousGuests ||
                previousGuests.length === 0
              ) {
                return previousGuests;
              }

              const updatedGuests = [...previousGuests];

              updatedGuests[0] = {
                ...updatedGuests[0],
                firstName:
                  data.firstName ||
                  updatedGuests[0].firstName,
                lastName:
                  data.lastName ||
                  updatedGuests[0].lastName,
                email:
                  data.email ||
                  updatedGuests[0].email,
                phone:
                  data.phoneNumber ||
                  updatedGuests[0].phone,
              };

              return updatedGuests;
            });
          })
          .catch(() => {
            // Prefill isteği başarısız olursa form boş kalır.
          });
      }
    } catch (error) {
      console.error(
        "ReservationFormPanel useEffect hatası:",
        error
      );
    }
  }, [
    bookingDetails?.editMode,
    bookingDetails?.reservationId,
    bookingDetails?.passengers,
    bookingDetails?.editData?.passengers,
    bookingDetails?.adultCount,
    bookingDetails?.childCount,
    hotel,
    guests,
    setGuests,
  ]);

  const handleGuestChange = (index, field, value) => {
    if (typeof setGuests !== "function") return;

    setGuests((previousGuests) => {
      const updatedGuests = [...(previousGuests || [])];

      updatedGuests[index] = {
        ...updatedGuests[index],
        [field]: value,
      };

      return updatedGuests;
    });
  };

  const locationParts = [
    safeHotel?.city,
    safeHotel?.town,
    safeHotel?.village,
    safeHotel?.region,
  ].filter(Boolean);

  const uniqueLocationParts = [
    ...new Set(locationParts),
  ];

  const locationText =
    uniqueLocationParts.length > 0
      ? uniqueLocationParts.join(", ")
      : "";

  const formattedPrice =
    safeHotel?.price != null &&
      !Number.isNaN(Number(safeHotel.price))
      ? new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: safeHotel.currency || "TRY",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(safeHotel.price))
      : `${safeHotel?.price || 0} ${safeHotel?.currency || "TRY"
      }`;

  const roomPriceValue =
    safeHotel?.price != null &&
      !Number.isNaN(Number(safeHotel.price))
      ? Number(safeHotel.price) * 0.92
      : null;

  const taxValue =
    safeHotel?.price != null &&
      !Number.isNaN(Number(safeHotel.price))
      ? Number(safeHotel.price) * 0.08
      : null;

  const formatSubPrice = (value) => {
    if (value === null) return "-";

    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: safeHotel?.currency || "TRY",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const adultCount =
    parseInt(bookingDetails?.adultCount, 10) || 1;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!termsAccepted) {
      alert(
        "Lütfen şartlar ve koşulları kabul ediniz."
      );
      return;
    }

    for (
      let index = 0;
      index < (guests || []).length;
      index++
    ) {
      const guest = guests[index];
      const errors = getPassengerErrors(guest);
      const errorKeys = Object.keys(errors);

      if (errorKeys.length > 0) {
        const guestName =
          guest.firstName && guest.lastName
            ? `${guest.firstName} ${guest.lastName}`
            : `${index + 1}. Yolcu`;

        alert(
          `${guestName} bilgilerinde hata var: ${errors[errorKeys[0]]
          }`
        );
        return;
      }
    }

    const payload = {
      type: "HOTEL",
      itemName:
        safeHotel?.name ||
        safeHotel?.hotelId ||
        "Otel Rezervasyonu",
      destination:
        locationText ||
        safeHotel?.city ||
        safeHotel?.region ||
        "-",
      startDate: toDateOnly(bookingDetails?.checkIn),
      endDate: toDateOnly(bookingDetails?.checkOut),
      totalPrice: Number(safeHotel?.price) || 0,
      currency: safeHotel?.currency || "TRY",
      passengers: (guests || []).map((guest) => ({
        firstName: guest.firstName || "",
        lastName: guest.lastName || "",
        email: guest.email || "",
        phoneNumber: guest.phone || "",
        identityNumber: guest.identityNumber || "",
        birthDate: guest.birthDate || null,
        gender:
          guest.gender ||
          (guest.type === "CHILD" ? "CHD" : "MR"),
        nationality: guest.nationality || "TR",
      })),
    };

    setSubmitError("");
    setIsSubmitting(true);

    try {
      let response;

      if (
        bookingDetails?.editMode &&
        bookingDetails?.reservationId
      ) {
        response = await api.put(
          `/api/reservations/${bookingDetails.reservationId}`,
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
        "Reservation process failed",
        error
      );
      setSubmitError(
        t("reservation_confirm_error")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hotel) return null;

  if (reservationResult) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col items-center justify-center overflow-y-auto rounded-2xl bg-slate-50 p-8 text-center font-sans shadow-2xl dark:bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-black/10 p-2 text-slate-600 transition-colors hover:bg-black/20 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20"
          >
            <X size={20} />
          </button>

          <CheckCircle2
            size={48}
            className="mb-4 text-emerald-500"
          />

          <p className="mb-6 max-w-sm font-medium text-slate-800 dark:text-slate-200">
            {bookingDetails?.editMode
              ? "Rezervasyon başarıyla güncellendi."
              : t("reservation_confirm_success", {
                number:
                  reservationResult.reservationNumber ||
                  reservationResult.id,
              })}
          </p>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-blue-500 px-6 py-3 font-bold text-white shadow-md transition-all hover:bg-blue-600"
          >
            {t("reservation_ok")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="relative flex h-full w-full max-w-2xl flex-col overflow-hidden bg-slate-50 font-sans shadow-2xl dark:bg-slate-900">
        <div className="relative h-48 flex-shrink-0 bg-slate-800 md:h-64">
          {safeHotel?.thumbnailFull ||
            safeHotel?.thumbnail ? (
            <img
              src={
                safeHotel.thumbnailFull ||
                safeHotel.thumbnail
              }
              alt={
                safeHotel.name ||
                safeHotel.hotelId ||
                "Hotel"
              }
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display =
                  "none";
              }}
            />
          ) : null}

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-black/60 p-2 pr-4 text-sm font-semibold text-white transition-colors hover:bg-black/80"
            >
              <ArrowLeft size={18} />
              Geri
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80"
          >
            <X size={20} />
          </button>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-12">
            <div className="mb-1 text-xs font-bold uppercase tracking-widest text-amber-400 drop-shadow-md">
              {bookingDetails?.editMode
                ? "Rezervasyon Düzenleme"
                : "Rezervasyon Detayları"}
            </div>

            <h2 className="text-2xl font-bold leading-tight text-white drop-shadow-md md:text-3xl">
              {safeHotel?.name ||
                safeHotel?.hotelId ||
                "Otel Rezervasyonu"}
            </h2>

            <div className="mt-2 flex items-center gap-2">
              {safeHotel?.stars && (
                <span className="flex flex-shrink-0 items-center text-sm text-amber-400">
                  {safeHotel.stars}
                  <Star
                    size={14}
                    className="ml-1 fill-amber-400"
                  />
                </span>
              )}

              {locationText && (
                <span className="flex items-center gap-1 text-sm text-white/90">
                  <span className="text-white/40">
                    •
                  </span>
                  <MapPin
                    size={14}
                    className="ml-1 opacity-80"
                  />
                  {locationText}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl space-y-6 p-6">
            <form
              id="reservation-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="space-y-4">
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Konuk Bilgileri
                </h3>

                {(guests || []).map(
                  (guest, index) => {
                    const isExpanded =
                      expandedGuestId === guest.id;

                    const guestTitle =
                      guest.type === "ADULT"
                        ? `${index + 1}. Yetişkin`
                        : `${index - adultCount + 1
                        }. Çocuk`;

                    const errors =
                      getPassengerErrors(guest);

                    return (
                      <div
                        key={guest.id || index}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 dark:border-slate-800 dark:bg-slate-800"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedGuestId(
                              isExpanded
                                ? null
                                : guest.id
                            )
                          }
                          className="flex w-full items-center justify-between bg-white px-5 py-4 transition-colors hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700"
                        >
                          <div className="flex items-center gap-3">
                            {guest.type ===
                              "ADULT" ? (
                              <User
                                size={18}
                                className="text-blue-500"
                              />
                            ) : (
                              <Baby
                                size={18}
                                className="text-amber-500"
                              />
                            )}

                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                              {guestTitle}
                            </span>

                            {index === 0 && (
                              <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] uppercase tracking-wider text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                İletişim
                              </span>
                            )}

                            {!isExpanded &&
                              (guest.firstName ||
                                guest.lastName) && (
                                <span className="ml-2 border-l border-slate-200 pl-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                                  {guest.firstName}{" "}
                                  {guest.lastName}
                                </span>
                              )}
                          </div>

                          <div className="text-slate-400 dark:text-slate-500">
                            {isExpanded ? (
                              <ChevronUp size={20} />
                            ) : (
                              <ChevronDown
                                size={20}
                              />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="space-y-4 border-t border-slate-100 bg-slate-50/50 p-5 dark:border-slate-700 dark:bg-slate-800/40">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                                  Ad
                                </label>
                                <input
                                  required
                                  type="text"
                                  value={
                                    guest.firstName ||
                                    ""
                                  }
                                  onChange={(event) =>
                                    handleGuestChange(
                                      index,
                                      "firstName",
                                      event.target.value
                                    )
                                  }
                                  className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:outline-none dark:bg-slate-900 dark:text-white ${errors.firstName
                                      ? "border-red-500 ring-1 ring-red-500"
                                      : "border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 dark:border-slate-700"
                                    }`}
                                />
                                {errors.firstName && (
                                  <span className="mt-1 block text-[10px] font-medium text-red-500">
                                    {
                                      errors.firstName
                                    }
                                  </span>
                                )}
                              </div>

                              <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                                  Soyad
                                </label>
                                <input
                                  required
                                  type="text"
                                  value={
                                    guest.lastName || ""
                                  }
                                  onChange={(event) =>
                                    handleGuestChange(
                                      index,
                                      "lastName",
                                      event.target.value
                                    )
                                  }
                                  className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:outline-none dark:bg-slate-900 dark:text-white ${errors.lastName
                                      ? "border-red-500 ring-1 ring-red-500"
                                      : "border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 dark:border-slate-700"
                                    }`}
                                />
                                {errors.lastName && (
                                  <span className="mt-1 block text-[10px] font-medium text-red-500">
                                    {
                                      errors.lastName
                                    }
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                                  Cinsiyet
                                </label>
                                <select
                                  required
                                  value={
                                    guest.gender ||
                                    (guest.type ===
                                      "CHILD"
                                      ? "CHD"
                                      : "MR")
                                  }
                                  onChange={(event) =>
                                    handleGuestChange(
                                      index,
                                      "gender",
                                      event.target.value
                                    )
                                  }
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                >
                                  <option value="MR">
                                    Bay (Mr.)
                                  </option>
                                  <option value="MRS">
                                    Bayan (Mrs.)
                                  </option>
                                  <option value="CHD">
                                    Çocuk (Child)
                                  </option>
                                </select>
                              </div>

                              <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                                  Doğum Tarihi
                                </label>
                                <input
                                  required
                                  type="date"
                                  max={new Date()
                                    .toISOString()
                                    .split("T")[0]}
                                  value={
                                    guest.birthDate ||
                                    ""
                                  }
                                  onChange={(event) =>
                                    handleGuestChange(
                                      index,
                                      "birthDate",
                                      event.target.value
                                    )
                                  }
                                  className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:outline-none dark:bg-slate-900 dark:text-white ${errors.birthDate
                                      ? "border-red-500 ring-1 ring-red-500"
                                      : "border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 dark:border-slate-700"
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
                                <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                                  Uyruk
                                </label>
                                <input
                                  required
                                  type="text"
                                  value={
                                    guest.nationality ||
                                    ""
                                  }
                                  onChange={(event) =>
                                    handleGuestChange(
                                      index,
                                      "nationality",
                                      event.target.value
                                    )
                                  }
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                />
                              </div>

                              <div>
                                <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                  <ShieldCheck
                                    size={12}
                                  />
                                  TC Kimlik No / Pasaport
                                </label>
                                <input
                                  required
                                  type="text"
                                  value={
                                    guest.identityNumber ||
                                    ""
                                  }
                                  onChange={(event) =>
                                    handleGuestChange(
                                      index,
                                      "identityNumber",
                                      event.target.value
                                    )
                                  }
                                  className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:outline-none dark:bg-slate-900 dark:text-white ${errors.identityNumber
                                      ? "border-red-500 ring-1 ring-red-500"
                                      : "border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 dark:border-slate-700"
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

                            {guest.type === "CHILD" && (
                              <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                                  Yaş
                                </label>
                                <input
                                  required
                                  type="number"
                                  min="0"
                                  max="17"
                                  value={guest.age || ""}
                                  onChange={(event) =>
                                    handleGuestChange(
                                      index,
                                      "age",
                                      event.target.value
                                    )
                                  }
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                />
                              </div>
                            )}

                            {index === 0 && (
                              <div className="grid grid-cols-1 gap-4 border-t border-slate-200/60 pt-4 dark:border-slate-700 md:grid-cols-2">
                                <div>
                                  <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    <Mail size={12} />
                                    E-posta
                                  </label>
                                  <input
                                    required
                                    type="email"
                                    value={
                                      guest.email || ""
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      handleGuestChange(
                                        index,
                                        "email",
                                        event.target
                                          .value
                                      )
                                    }
                                    className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:outline-none dark:bg-slate-900 dark:text-white ${errors.email
                                        ? "border-red-500 ring-1 ring-red-500"
                                        : "border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 dark:border-slate-700"
                                      }`}
                                  />
                                  {errors.email && (
                                    <span className="mt-1 block text-[10px] font-medium text-red-500">
                                      {errors.email}
                                    </span>
                                  )}
                                </div>

                                <div>
                                  <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    <Phone size={12} />
                                    Telefon
                                  </label>
                                  <PhoneInput
                                    international
                                    defaultCountry="TR"
                                    value={
                                      guest.phone || ""
                                    }
                                    onChange={(value) =>
                                      handleGuestChange(
                                        index,
                                        "phone",
                                        value || ""
                                      )
                                    }
                                    className={`flex w-full items-center rounded-lg border bg-white px-3 py-1.5 text-sm transition-colors dark:bg-slate-900 ${errors.phone
                                        ? "border-red-500 ring-1 ring-red-500"
                                        : "border-slate-200 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/50 dark:border-slate-700"
                                      }`}
                                    numberInputProps={{
                                      required: true,
                                      className:
                                        "ml-2 w-full border-0 bg-transparent py-1 text-slate-800 outline-none focus:ring-0 dark:text-white",
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
                  }
                )}
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/30">
                <Info
                  size={20}
                  className="mt-0.5 flex-shrink-0 text-blue-500"
                />
                <div>
                  <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300">
                    İptal Politikası
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-blue-700 dark:text-slate-300">
                    {safeHotel?.isRefundable === true
                      ? "Bu rezervasyon ücretsiz iptal edilebilir."
                      : safeHotel?.isRefundable ===
                        false
                        ? "Bu rezervasyon iade edilemez."
                        : "İptal koşulları rezervasyon onayı sonrası bildirilecektir."}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-800">
                <h3 className="mb-4 border-b border-slate-100 pb-2 text-sm font-bold uppercase tracking-wider text-slate-800 dark:border-slate-700 dark:text-slate-200">
                  Fiyat Özeti
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>
                      Oda Fiyatı (
                      {bookingDetails?.guests ||
                        "1 Oda"}
                      )
                    </span>
                    <span className="font-medium">
                      {formatSubPrice(
                        roomPriceValue
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>Vergiler ve Harçlar</span>
                    <span className="font-medium">
                      {formatSubPrice(taxValue)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-end justify-between border-t border-slate-100 pt-3 dark:border-slate-700">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Toplam
                    </span>
                    <span className="text-xl font-extrabold text-[#3B82F6] dark:text-blue-400">
                      {formattedPrice}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  checked={Boolean(termsAccepted)}
                  onChange={(event) =>
                    setTermsAccepted?.(
                      event.target.checked
                    )
                  }
                  className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-300 bg-slate-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
                />

                <label
                  htmlFor="terms"
                  className="cursor-pointer select-none text-xs leading-relaxed text-slate-600 dark:text-slate-400"
                >
                  <span className="text-blue-600 hover:underline dark:text-blue-400">
                    Satış Sözleşmesini
                  </span>{" "}
                  ve{" "}
                  <span className="text-blue-600 hover:underline dark:text-blue-400">
                    İptal/İade Koşullarını
                  </span>{" "}
                  okudum, anladım ve kabul ediyorum.
                </label>
              </div>
            </form>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 bg-white p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] dark:border-slate-800 dark:bg-slate-900 md:flex-row md:p-6">
          <div className="flex w-full flex-col text-center md:w-auto md:text-left">
            <span className="mb-0.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Toplam Tutar
            </span>

            <span className="text-2xl font-extrabold leading-none text-[#3B82F6] dark:text-blue-400">
              {formattedPrice}
            </span>

            {submitError && (
              <span className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                {submitError}
              </span>
            )}
          </div>

          <button
            type="submit"
            form="reservation-form"
            disabled={!termsAccepted || isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-3.5 font-bold text-white shadow-md transition-all hover:bg-blue-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700 md:w-auto md:min-w-[240px]"
          >
            <ShieldCheck size={18} />
            {isSubmitting
              ? t("reservation_submitting")
              : bookingDetails?.editMode
                ? "Güncellemeyi Onayla"
                : "Rezervasyonu Onayla"}
          </button>
        </div>
      </div>
    </div>
  );
}