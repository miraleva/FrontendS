const fs = require("fs");
const path = require("path");

const localesDir = path.join("c:\\Users\\Almira\\Desktop\\FrontendS\\src\\locales");

const newTranslations = {
  en: {
    res_preview_flight_title: "Flight Preview",
    res_preview_complete_flight: "Buy Ticket"
  },
  de: {
    res_preview_flight_title: "Flugvorschau",
    res_preview_complete_flight: "Ticket kaufen"
  },
  ru: {
    res_preview_flight_title: "Предварительный просмотр рейса",
    res_preview_complete_flight: "Купить билет"
  },
  tr: {
    res_preview_flight_title: "Uçuş Önizlemesi",
    res_preview_complete_flight: "Bileti Satın Al"
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
