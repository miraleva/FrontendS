const fs = require("fs");
const path = require("path");

const localesDir = path.join(
  "c:\\Users\\Almira\\Desktop\\FrontendS\\src\\locales"
);

const newTranslations = {
  en: {
    res_form_back: "Back",
    res_form_edit_title: "Edit Reservation",
    res_form_title: "Reservation Details",
    res_form_hotel_res: "Hotel Reservation",
    res_form_passenger_info: "Guest Information",
    res_form_contact: "Contact",
    res_form_first_name: "First Name",
    res_form_last_name: "Last Name",
    res_form_gender: "Gender",
    res_form_birth_date: "Birth Date",
    res_form_nationality: "Nationality",
    res_form_tc_no: "TR Identity No",
    res_form_passport: "Passport No",
    res_form_tc_placeholder: "11-digit TR ID",
    res_form_passport_placeholder: "Max 15 characters",
    res_form_age: "Age",
    res_form_email: "Email",
    res_form_phone: "Phone",
    res_form_total_amount: "Total Amount",
    res_form_preview_update: "Preview Update",
    res_form_preview_res: "Preview Reservation"
  },
  de: {
    res_form_back: "Zurück",
    res_form_edit_title: "Reservierung bearbeiten",
    res_form_title: "Reservierungsdetails",
    res_form_hotel_res: "Hotelreservierung",
    res_form_passenger_info: "Gäste-Informationen",
    res_form_contact: "Kontakt",
    res_form_first_name: "Vorname",
    res_form_last_name: "Nachname",
    res_form_gender: "Geschlecht",
    res_form_birth_date: "Geburtsdatum",
    res_form_nationality: "Nationalität",
    res_form_tc_no: "TR-Identitätsnr.",
    res_form_passport: "Passnummer",
    res_form_tc_placeholder: "11-stellige TR-ID",
    res_form_passport_placeholder: "Max. 15 Zeichen",
    res_form_age: "Alter",
    res_form_email: "E-Mail",
    res_form_phone: "Telefon",
    res_form_total_amount: "Gesamtbetrag",
    res_form_preview_update: "Aktualisierung vorschauen",
    res_form_preview_res: "Reservierung vorschauen"
  },
  ru: {
    res_form_back: "Назад",
    res_form_edit_title: "Редактировать бронирование",
    res_form_title: "Детали бронирования",
    res_form_hotel_res: "Бронирование отеля",
    res_form_passenger_info: "Информация о госте",
    res_form_contact: "Контакт",
    res_form_first_name: "Имя",
    res_form_last_name: "Фамилия",
    res_form_gender: "Пол",
    res_form_birth_date: "Дата рождения",
    res_form_nationality: "Национальность",
    res_form_tc_no: "TR ИНН",
    res_form_passport: "Номер паспорта",
    res_form_tc_placeholder: "11-значный TR ИНН",
    res_form_passport_placeholder: "Максимум 15 символов",
    res_form_age: "Возраст",
    res_form_email: "Электронная почта",
    res_form_phone: "Телефон",
    res_form_total_amount: "Итоговая сумма",
    res_form_preview_update: "Предварительный просмотр обновления",
    res_form_preview_res: "Предварительный просмотр бронирования"
  },
  tr: {
    res_form_back: "Geri",
    res_form_edit_title: "Rezervasyon Düzenleme",
    res_form_title: "Rezervasyon Detayları",
    res_form_hotel_res: "Otel Rezervasyonu",
    res_form_passenger_info: "Konuk Bilgileri",
    res_form_contact: "İletişim",
    res_form_first_name: "Ad",
    res_form_last_name: "Soyad",
    res_form_gender: "Cinsiyet",
    res_form_birth_date: "Doğum Tarihi",
    res_form_nationality: "Uyruk",
    res_form_tc_no: "T.C. Kimlik Numarası",
    res_form_passport: "Pasaport Numarası",
    res_form_tc_placeholder: "11 haneli T.C. kimlik numarası",
    res_form_passport_placeholder: "En fazla 15 harf veya rakam",
    res_form_age: "Yaş",
    res_form_email: "E-posta",
    res_form_phone: "Telefon",
    res_form_total_amount: "Toplam Tutar",
    res_form_preview_update: "Güncellemeyi Önizle",
    res_form_preview_res: "Rezervasyonu Önizle"
  }
};

const langs = ["en", "de", "ru", "tr"];

for (const lang of langs) {
  const filePath = path.join(localesDir, `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  
  Object.assign(data, newTranslations[lang]);
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`Updated ${lang}.json`);
}
