const fs = require("fs");
const path = require("path");

const localesDir = path.join(
  "c:\\Users\\Almira\\Desktop\\FrontendS\\src\\locales"
);

const newTranslations = {
  en: {
    err_first_name_req: "First name is required.",
    err_last_name_req: "Last name is required.",
    err_invalid_tc: "Invalid TR Identity No (must be 11 digits and not start with 0).",
    err_invalid_passport: "Invalid Passport No (minimum 5 characters).",
    err_birthdate_req: "Birth date is required.",
    err_birthdate_past: "Birth date must be in the past.",
    err_adult_req: "The person making the reservation must be over 18.",
    err_email_req: "Email is required.",
    err_invalid_email: "Invalid email format (e.g., name@example.com).",
    err_phone_req: "Phone number is required.",
    err_invalid_phone: "Does not match country format (invalid length)."
  },
  de: {
    err_first_name_req: "Vorname ist erforderlich.",
    err_last_name_req: "Nachname ist erforderlich.",
    err_invalid_tc: "Ungültige TR-Identitätsnr. (muss 11 Ziffern haben und darf nicht mit 0 beginnen).",
    err_invalid_passport: "Ungültige Passnummer (mindestens 5 Zeichen).",
    err_birthdate_req: "Geburtsdatum ist erforderlich.",
    err_birthdate_past: "Das Geburtsdatum muss in der Vergangenheit liegen.",
    err_adult_req: "Die Person, die die Reservierung vornimmt, muss über 18 Jahre alt sein.",
    err_email_req: "E-Mail ist erforderlich.",
    err_invalid_email: "Ungültiges E-Mail-Format (z. B. name@beispiel.com).",
    err_phone_req: "Telefonnummer ist erforderlich.",
    err_invalid_phone: "Entspricht nicht dem Landesformat (ungültige Länge)."
  },
  ru: {
    err_first_name_req: "Имя обязательно.",
    err_last_name_req: "Фамилия обязательна.",
    err_invalid_tc: "Неверный TR ИНН (должно быть 11 цифр и не начинаться с 0).",
    err_invalid_passport: "Неверный номер паспорта (минимум 5 символов).",
    err_birthdate_req: "Дата рождения обязательна.",
    err_birthdate_past: "Дата рождения должна быть в прошлом.",
    err_adult_req: "Лицо, оформляющее бронирование, должно быть старше 18 лет.",
    err_email_req: "Электронная почта обязательна.",
    err_invalid_email: "Неверный формат почты (например, name@example.com).",
    err_phone_req: "Требуется номер телефона.",
    err_invalid_phone: "Не соответствует формату страны (недопустимая длина)."
  },
  tr: {
    err_first_name_req: "Ad gereklidir.",
    err_last_name_req: "Soyad gereklidir.",
    err_invalid_tc: "Geçersiz T.C. Kimlik No (11 hane olmalı ve 0 ile başlamamalı).",
    err_invalid_passport: "Geçersiz Pasaport No (en az 5 karakter).",
    err_birthdate_req: "Doğum tarihi gereklidir.",
    err_birthdate_past: "Doğum tarihi geçmişte olmalıdır.",
    err_adult_req: "Rezervasyonu yapan kişi 18 yaşından büyük olmalıdır.",
    err_email_req: "E-posta gereklidir.",
    err_invalid_email: "Geçersiz e-posta formatı (örn: ad@example.com).",
    err_phone_req: "Telefon numarası gereklidir.",
    err_invalid_phone: "Ülke formatına uymuyor (geçersiz uzunluk)."
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
