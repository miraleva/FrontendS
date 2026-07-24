const fs = require("fs");
const path = require("path");

const localesDir = path.join("c:\\Users\\Almira\\Desktop\\FrontendS\\src\\locales");

const newTranslations = {
  en: {
    res_preview_edit_title: "Preview Update",
    res_preview_title: "Reservation Preview",
    res_preview_desc: "Please check the information and confirm the transaction.",
    res_preview_flight: "Flight",
    res_preview_accom: "Accommodation",
    res_preview_total: "Total Amount",
    res_preview_start: "Start",
    res_preview_end: "End",
    res_preview_passengers: "Passenger Information",
    res_preview_person: "person(s)",
    res_preview_child: "Child",
    res_preview_adult: "Adult",
    res_preview_birthdate: "Birth date:",
    res_preview_gender: "Gender:",
    res_preview_nationality: "Nationality:",
    res_preview_tc_no: "TR Identity No:",
    res_preview_passport: "Passport No:",
    res_preview_agree_title: "I confirm that my information is correct",
    res_preview_agree_desc: "I have checked the passenger, contact, date, and fee information. I accept the completion of the reservation with this information.",
    res_preview_edit: "Edit Info",
    res_preview_loading: "Processing...",
    res_preview_complete_update: "Complete Update",
    res_preview_complete: "Complete Reservation"
  },
  de: {
    res_preview_edit_title: "Aktualisierungsvorschau",
    res_preview_title: "Reservierungsvorschau",
    res_preview_desc: "Bitte überprüfen Sie die Informationen und bestätigen Sie die Transaktion.",
    res_preview_flight: "Flug",
    res_preview_accom: "Unterkunft",
    res_preview_total: "Gesamtbetrag",
    res_preview_start: "Start",
    res_preview_end: "Ende",
    res_preview_passengers: "Passagierinformationen",
    res_preview_person: "Person(en)",
    res_preview_child: "Kind",
    res_preview_adult: "Erwachsener",
    res_preview_birthdate: "Geburtsdatum:",
    res_preview_gender: "Geschlecht:",
    res_preview_nationality: "Nationalität:",
    res_preview_tc_no: "TR-Identitätsnr.:",
    res_preview_passport: "Passnummer:",
    res_preview_agree_title: "Ich bestätige, dass meine Angaben korrekt sind",
    res_preview_agree_desc: "Ich habe die Passagier-, Kontakt-, Datums- und Gebühreninformationen überprüft. Ich akzeptiere den Abschluss der Reservierung mit diesen Informationen.",
    res_preview_edit: "Info bearbeiten",
    res_preview_loading: "Wird verarbeitet...",
    res_preview_complete_update: "Aktualisierung abschließen",
    res_preview_complete: "Reservierung abschließen"
  },
  ru: {
    res_preview_edit_title: "Предварительный просмотр обновления",
    res_preview_title: "Предварительный просмотр бронирования",
    res_preview_desc: "Пожалуйста, проверьте информацию и подтвердите транзакцию.",
    res_preview_flight: "Перелет",
    res_preview_accom: "Проживание",
    res_preview_total: "Итоговая сумма",
    res_preview_start: "Начало",
    res_preview_end: "Окончание",
    res_preview_passengers: "Информация о пассажирах",
    res_preview_person: "чел.",
    res_preview_child: "Ребенок",
    res_preview_adult: "Взрослый",
    res_preview_birthdate: "Дата рождения:",
    res_preview_gender: "Пол:",
    res_preview_nationality: "Национальность:",
    res_preview_tc_no: "TR ИНН:",
    res_preview_passport: "Номер паспорта:",
    res_preview_agree_title: "Я подтверждаю правильность моих данных",
    res_preview_agree_desc: "Я проверил(а) информацию о пассажирах, контактах, датах и стоимости. Я согласен(на) на завершение бронирования с этими данными.",
    res_preview_edit: "Редактировать",
    res_preview_loading: "Обработка...",
    res_preview_complete_update: "Завершить обновление",
    res_preview_complete: "Завершить бронирование"
  },
  tr: {
    res_preview_edit_title: "Güncelleme Önizlemesi",
    res_preview_title: "Rezervasyon Önizlemesi",
    res_preview_desc: "Lütfen bilgileri kontrol ederek işlemi onaylayın.",
    res_preview_flight: "Uçuş",
    res_preview_accom: "Konaklama",
    res_preview_total: "Toplam Tutar",
    res_preview_start: "Başlangıç",
    res_preview_end: "Bitiş",
    res_preview_passengers: "Yolcu Bilgileri",
    res_preview_person: "kişi",
    res_preview_child: "Çocuk",
    res_preview_adult: "Yetişkin",
    res_preview_birthdate: "Doğum tarihi:",
    res_preview_gender: "Cinsiyet:",
    res_preview_nationality: "Uyruk:",
    res_preview_tc_no: "T.C. Kimlik No:",
    res_preview_passport: "Pasaport No:",
    res_preview_agree_title: "Bilgilerimin doğru olduğunu onaylıyorum",
    res_preview_agree_desc: "Yolcu, iletişim, tarih ve ücret bilgilerini kontrol ettim. Rezervasyon işleminin bu bilgilerle tamamlanmasını kabul ediyorum.",
    res_preview_edit: "Bilgileri Düzenle",
    res_preview_loading: "İşlem yapılıyor...",
    res_preview_complete_update: "Güncellemeyi Tamamla",
    res_preview_complete: "Rezervasyonu Tamamla"
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
