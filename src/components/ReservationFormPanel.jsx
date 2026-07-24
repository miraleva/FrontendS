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
import { validatePhoneNumberLength } from "libphonenumber-js/max";
import "react-phone-number-input/style.css";
import api from "../services/api";
import ReservationPreviewModal from "./ReservationPreviewModal";

function toDateOnly(value) {
  if (!value) return null;

  const match = /^\d{4}-\d{2}-\d{2}/.exec(value);
  if (match) return match[0];

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString().slice(0, 10);
}

const getPassengerErrors = (passenger, index = 0, t) => {
  const errors = {};
  const isPrimaryContact = index === 0;

  if (!passenger.firstName?.trim()) {
    errors.firstName = t("err_first_name_req", "Ad gereklidir.");
  }

  if (!passenger.lastName?.trim()) {
    errors.lastName = t("err_last_name_req", "Soyad gereklidir.");
  }

  if (passenger.nationality?.toUpperCase() === "TR") {
    if (!/^[1-9]\d{10}$/.test(passenger.identityNumber || "")) {
      errors.identityNumber = t(
        "err_invalid_tc",
        "Geçersiz T.C. Kimlik No (11 hane olmalı ve 0 ile başlamamalı)."
      );
    }
  } else if (
    !passenger.identityNumber?.trim() ||
    passenger.identityNumber.trim().length < 5
  ) {
    errors.identityNumber = t(
      "err_invalid_passport",
      "Geçersiz Pasaport No (en az 5 karakter)."
    );
  }

  if (!passenger.birthDate) {
    errors.birthDate = t("err_birthdate_req", "Doğum tarihi gereklidir.");
  } else {
    const birthDate = new Date(passenger.birthDate);

    if (birthDate >= new Date()) {
      errors.birthDate = t(
        "err_birthdate_past",
        "Doğum tarihi geçmişte olmalıdır."
      );
    } else if (isPrimaryContact) {
      const eighteenYearsAgo = new Date();
      eighteenYearsAgo.setFullYear(
        eighteenYearsAgo.getFullYear() - 18
      );

      if (birthDate > eighteenYearsAgo) {
        errors.birthDate = t(
          "err_adult_req",
          "Rezervasyonu yapan kişi 18 yaşından büyük olmalıdır."
        );
      }
    }
  }

  if (isPrimaryContact) {
    if (!passenger.email?.trim()) {
      errors.email = t("err_email_req", "E-posta gereklidir.");
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passenger.email)
    ) {
      errors.email = t(
        "err_invalid_email",
        "Geçersiz e-posta formatı (örn: ad@example.com)."
      );
    }

    if (!passenger.phone) {
      errors.phone = t("err_phone_req", "Telefon numarası gereklidir.");
    } else if (!isValidPhoneNumber(passenger.phone)) {
      errors.phone = t(
        "err_invalid_phone",
        "Ülke formatına uymuyor (geçersiz uzunluk)."
      );
    }
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
  chatSessionId,
}) {
  const { t, i18n } = useTranslation();

  const safeHotel = hotel || {};

  const [expandedGuestId, setExpandedGuestId] =
    useState("adult-0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [reservationResult, setReservationResult] =
    useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

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
              passenger.gender === "CHD"
                ? "MR"
                : (passenger.gender || "MR"),
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
            gender: "MR",
            nationality: "TR",
            age:
              childAges[index] !== undefined
                ? childAges[index].toString()
                : "",
          });
        }

        const infantCount =
          parseInt(bookingDetails?.infantCount, 10) || 0;
        const infantAges =
          bookingDetails?.infantAges || [];

        for (let index = 0; index < infantCount; index++) {
          initialGuests.push({
            id: `infant-${index}`,
            type: "INFANT",
            firstName: "",
            lastName: "",
            identityNumber: "",
            email: "",
            phone: "",
            birthDate: "",
            gender: "MR",
            nationality: "TR",
            age:
              infantAges[index] !== undefined
                ? infantAges[index].toString()
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
    bookingDetails?.infantCount,
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

  const validateReservationForm = () => {
    if (!termsAccepted) {
      alert(
        t(
          "acceptTermsWarning",
          "Lütfen şartlar ve koşulları kabul ediniz."
        )
      );
      return false;
    }

    for (
      let index = 0;
      index < (guests || []).length;
      index++
    ) {
      const guest = guests[index];
      const errors = getPassengerErrors(guest, index);
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
        return false;
      }
    }

    return true;
  };

  const handleOpenPreview = (event) => {
    event?.preventDefault();

    if (isSubmitting || !validateReservationForm()) {
      return;
    }

    setSubmitError("");
    setShowPreview(true);
  };

  const handleSubmit = async () => {
    if (isSubmitting || !validateReservationForm()) {
      return;
    }

    const primaryGuest = guests?.[0] || {};

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
      chatSessionId: chatSessionId || null,
      imageUrl: safeHotel?.thumbnailFull || safeHotel?.thumbnail || "",
      passengers: (guests || []).map((guest, index) => {
        const today = new Date();
        const birthDate = guest.birthDate
          ? new Date(guest.birthDate)
          : null;

        let age = null;

        if (birthDate) {
          age =
            today.getFullYear() - birthDate.getFullYear();

          const monthDifference =
            today.getMonth() - birthDate.getMonth();

          if (
            monthDifference < 0 ||
            (monthDifference === 0 &&
              today.getDate() < birthDate.getDate())
          ) {
            age--;
          }
        }

        const isChildOrInfant =
          guest.type === "CHILD" ||
          guest.type === "INFANT" ||
          (age !== null && age < 18);

        return {
          firstName: guest.firstName || "",
          lastName: guest.lastName || "",
          email:
            guest.email ||
            (index > 0 ? primaryGuest.email : "") ||
            "",
          phoneNumber:
            guest.phone ||
            (index > 0 ? primaryGuest.phone : "") ||
            "",
          identityNumber: guest.identityNumber || "",
          birthDate: guest.birthDate || null,
          gender: isChildOrInfant
            ? "CHD"
            : (guest.gender || "MR"),
          nationality: guest.nationality || "TR",
        };
      }),
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
      setShowPreview(false);
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
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
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
    <>
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-slate-50 font-sans dark:bg-slate-900">
          <div className="relative h-52 flex-shrink-0 overflow-hidden bg-slate-800 md:h-64">
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
                {t("res_form_back", "Geri")}
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
                  ? t("res_form_edit_title", "Rezervasyon Düzenleme")
                  : t("res_form_title", "Rezervasyon Detayları")}
              </div>

              <h2 className="text-2xl font-bold leading-tight text-white drop-shadow-md md:text-3xl">
                {safeHotel?.name ||
                  safeHotel?.hotelId ||
                  t("res_form_hotel_res", "Otel Rezervasyonu")}
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

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth">
            <div className="mx-auto w-full max-w-3xl space-y-7 px-5 py-6 pb-10 sm:px-6 lg:px-8">
              <form
                id="reservation-form"
                onSubmit={handleOpenPreview}
                className="space-y-7"
              >
                <div className="space-y-5">
                  <h3 className="mb-3 text-sm font-extrabold uppercase tracking-[0.14em] text-slate-800 dark:text-slate-200">
                    {t("res_form_passenger_info", "Konuk Bilgileri")}
                  </h3>

                  {(guests || []).map(
                    (guest, index) => {
                      const isExpanded =
                        expandedGuestId === guest.id;

                      const guestTitle =
                        guest.type === "ADULT"
                          ? `${index + 1}. ${t(
                            "unit_adult",
                            "Yetişkin"
                          )}`
                          : guest.type === "INFANT"
                            ? `${index - adultCount + 1}. ${t(
                              "unit_infant",
                              "Bebek"
                            )}`
                            : `${index - adultCount + 1}. ${t(
                              "unit_child",
                              "Çocuk"
                            )}`;

                      const errors =
                        getPassengerErrors(guest, index, t);

                      return (
                        <div
                          key={guest.id || index}
                          className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all duration-200 dark:border-slate-700 dark:bg-slate-800"
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
                            className="flex w-full items-center justify-between bg-white px-6 py-6 text-left transition-colors hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700"
                          >
                            <div className="flex items-center gap-3">
                              {guest.type ===
                                "ADULT" ? (
                                <User
                                  size={20}
                                  className="text-blue-500"
                                />
                              ) : (
                                <Baby
                                  size={20}
                                  className="text-amber-500"
                                />
                              )}

                              <span className="text-base font-bold text-slate-800 dark:text-slate-200">
                                {guestTitle}
                              </span>

                              {index === 0 && (
                                <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] uppercase tracking-wider text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                  {t("res_form_contact", "İletişim")}
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
                            <div className="space-y-5 border-t border-slate-100 bg-slate-50/70 p-5 sm:p-6 dark:border-slate-700 dark:bg-slate-800/40">
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                                <div>
                                  <label className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-400">
                                    {t("res_form_first_name", "Ad")}
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
                                    className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 shadow-sm transition-colors focus:outline-none dark:bg-slate-900 dark:text-white ${errors.firstName
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
                                  <label className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-400">
                                    {t("res_form_last_name", "Soyad")}
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
                                    className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 shadow-sm transition-colors focus:outline-none dark:bg-slate-900 dark:text-white ${errors.lastName
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

                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                                <div>
                                  <label className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-400">
                                    {t("res_form_gender", "Cinsiyet")}
                                  </label>
                                  <select
                                    required
                                    value={guest.gender || "MR"}
                                    onChange={(event) =>
                                      handleGuestChange(
                                        index,
                                        "gender",
                                        event.target.value
                                      )
                                    }
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 shadow-sm transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                  >
                                    <option value="MR">
                                      {i18n.language?.startsWith("tr")
                                        ? "Erkek"
                                        : "Mr"}
                                    </option>
                                    <option value="MRS">
                                      {i18n.language?.startsWith("tr")
                                        ? "Kadın"
                                        : "Mrs"}
                                    </option>
                                  </select>
                                </div>

                                <div>
                                  <label className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-400">
                                    {t("res_form_birth_date", "Doğum Tarihi")}
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
                                    className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 shadow-sm transition-colors focus:outline-none dark:bg-slate-900 dark:text-white ${errors.birthDate
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

                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                                <div>
                                  <label className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-400">
                                    {t("res_form_nationality", "Uyruk")}
                                  </label>

                                  <select
                                    required
                                    value={guest.nationality || "TR"}
                                    onChange={(event) => {
                                      handleGuestChange(
                                        index,
                                        "nationality",
                                        event.target.value
                                      );

                                      handleGuestChange(
                                        index,
                                        "identityNumber",
                                        ""
                                      );
                                    }}
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 shadow-sm transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                  >
                                    <option value="TR">{t("country_tr", "Türkiye (TR)")}</option>
                                    <option value="DE">{t("country_de", "Almanya (DE)")}</option>
                                    <option value="GB">{t("country_gb", "Birleşik Krallık (GB)")}</option>
                                    <option value="US">{t("country_us", "Amerika Birleşik Devletleri (US)")}</option>
                                    <option value="FR">{t("country_fr", "Fransa (FR)")}</option>
                                    <option value="NL">{t("country_nl", "Hollanda (NL)")}</option>
                                    <option value="IT">{t("country_it", "İtalya (IT)")}</option>
                                    <option value="ES">{t("country_es", "İspanya (ES)")}</option>
                                    <option value="AU">{t("country_au", "Avustralya (AU)")}</option>
                                    <option value="CA">{t("country_ca", "Kanada (CA)")}</option>
                                    <option value="OTHER">{t("country_other", "Diğer")}</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                                    <ShieldCheck
                                      size={12}
                                    />
                                    {guest.nationality === "TR"
                                      ? t("res_form_tc_no", "T.C. Kimlik Numarası")
                                      : t("res_form_passport", "Pasaport Numarası")}
                                  </label>
                                  <input
                                    required
                                    type="text"
                                    inputMode={
                                      guest.nationality === "TR"
                                        ? "numeric"
                                        : "text"
                                    }
                                    maxLength={
                                      guest.nationality === "TR"
                                        ? 11
                                        : 15
                                    }
                                    value={
                                      guest.identityNumber ||
                                      ""
                                    }
                                    onChange={(event) => {
                                      const rawValue =
                                        event.target.value;

                                      const cleanValue =
                                        guest.nationality === "TR"
                                          ? rawValue
                                            .replace(/\D/g, "")
                                            .slice(0, 11)
                                          : rawValue
                                            .replace(/[^A-Za-z0-9]/g, "")
                                            .toUpperCase()
                                            .slice(0, 15);

                                      handleGuestChange(
                                        index,
                                        "identityNumber",
                                        cleanValue
                                      );
                                    }}
                                    placeholder={
                                      guest.nationality === "TR"
                                        ? t("res_form_tc_placeholder", "11 haneli T.C. kimlik numarası")
                                        : t("res_form_passport_placeholder", "En fazla 15 harf veya rakam")
                                    }
                                    className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 shadow-sm transition-colors focus:outline-none dark:bg-slate-900 dark:text-white ${errors.identityNumber
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
                                  <label className="mb-1.5 block text-xs font-bold text-slate-600 dark:text-slate-400">
                                    {t("res_form_age", "Yaş")}
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
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 shadow-sm transition-colors focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                  />
                                </div>
                              )}

                              {index === 0 && (
                                <div className="grid grid-cols-1 gap-4 border-t border-slate-200/60 pt-4 dark:border-slate-700 md:grid-cols-2">
                                  <div>
                                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                                      <Mail size={12} />
                                      {t("res_form_email", "E-posta")}
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
                                      className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 shadow-sm transition-colors focus:outline-none dark:bg-slate-900 dark:text-white ${errors.email
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
                                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                                      <Phone size={12} />
                                      {t("res_form_phone", "Telefon")}
                                    </label>
                                    <PhoneInput
                                      international
                                      limitMaxLength
                                      defaultCountry="TR"
                                      value={
                                        guest.phone || ""
                                      }
                                      onChange={(value) => {
                                        const nextPhone =
                                          value || "";

                                        if (!nextPhone) {
                                          handleGuestChange(
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

                                        if (
                                          lengthError !== "TOO_LONG"
                                        ) {
                                          handleGuestChange(
                                            index,
                                            "phone",
                                            nextPhone
                                          );
                                        }
                                      }}
                                      className={`flex min-h-11 w-full items-center rounded-xl border bg-white px-3.5 py-1.5 text-sm shadow-sm transition-colors dark:bg-slate-900 ${errors.phone
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

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] dark:border-slate-700 dark:bg-slate-800 sm:p-6">
                  <h3 className="mb-4 border-b border-slate-100 pb-2 text-sm font-bold uppercase tracking-wider text-slate-800 dark:border-slate-700 dark:text-slate-200">
                    {t("res_form_price_summary", "Fiyat Özeti")}
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span>
                        {t("res_form_room_price", "Oda Fiyatı")}
                      </span>
                      <span className="font-medium">
                        {formatSubPrice(
                          roomPriceValue
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span>{t("res_form_taxes_fees", "Vergiler ve Harçlar")}</span>
                      <span className="font-medium">
                        {formatSubPrice(taxValue)}
                      </span>
                    </div>

                    <div className="mt-3 flex items-end justify-between border-t border-slate-100 pt-3 dark:border-slate-700">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {t("res_form_total", "Toplam")}
                      </span>
                      <span className="text-xl font-extrabold text-[#3B82F6] dark:text-blue-400">
                        {formattedPrice}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
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
                    className="select-none text-xs leading-relaxed text-slate-600 dark:text-slate-400"
                  >
                    <button
                      type="button"
                      onClick={() => setTermsModalOpen(true)}
                      className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {t(
                        "res_form_sales_contract",
                        "Satış Sözleşmesini"
                      )}
                    </button>{" "}
                    {t("res_form_terms_read_part1", "ve")}{" "}
                    <button
                      type="button"
                      onClick={() => setTermsModalOpen(true)}
                      className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {t(
                        "res_form_cancel_terms",
                        "İptal/İade Koşullarını"
                      )}
                    </button>{" "}
                    {t(
                      "res_form_terms_read_part2",
                      "okudum, anladım ve kabul ediyorum."
                    )}
                  </label>
                </div>
              </form>
            </div>
          </div>

          <div className="sticky bottom-0 z-20 flex flex-col items-stretch justify-between gap-4 border-t border-slate-200 bg-white/95 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 shadow-[0_-12px_32px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 sm:px-6 md:flex-row md:items-center">
            <div className="flex w-full flex-col text-left md:w-auto">
              <span className="mb-0.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {t("res_form_total_amount", "Toplam Tutar")}
              </span>

              <span className="mt-1 text-2xl font-extrabold leading-none text-[#3B82F6] dark:text-blue-400">
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
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-3.5 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-600 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none dark:disabled:bg-slate-700 md:w-auto md:min-w-[250px]"
            >
              <ShieldCheck size={18} />
              {bookingDetails?.editMode
                ? t("res_form_preview_update", "Güncellemeyi Önizle")
                : t("res_form_preview_res", "Rezervasyonu Önizle")}
            </button>
          </div>
        </div>


      {termsModalOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setTermsModalOpen(false)}
        >
          <div
            className="relative max-h-[80vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 dark:border-slate-700">
              <h2 className="pr-4 text-sm font-bold leading-snug text-white">
                {t(
                  "termsModalTitle",
                  "Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi"
                )}
              </h2>

              <button
                type="button"
                onClick={() => setTermsModalOpen(false)}
                className="flex-shrink-0 rounded-full p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                aria-label={t("close", "Kapat")}
              >
                <X size={20} />
              </button>
            </div>

            <div
              className="overflow-y-auto p-6"
              style={{ maxHeight: "calc(80vh - 130px)" }}
            >
              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {t("termsModalContent", "")}
              </pre>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => {
                  setTermsAccepted?.(true);
                  setTermsModalOpen(false);
                }}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 active:scale-[0.98]"
              >
                {t(
                  "res_form_terms_read_part2",
                  "Okudum, anladım ve kabul ediyorum."
                )}
              </button>

              <button
                type="button"
                onClick={() => setTermsModalOpen(false)}
                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                {t("close", "Kapat")}
              </button>
            </div>
          </div>
        </div>
      )}

      <ReservationPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onConfirm={handleSubmit}
        passengers={guests}
        selectedItem={safeHotel}
        bookingDetails={bookingDetails}
        editData={bookingDetails?.editData}
        isEditMode={Boolean(bookingDetails?.editMode)}
        isFlight={false}
        isSubmitting={isSubmitting}
      />
    </>
  );
}