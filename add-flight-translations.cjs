const fs = require("fs");
const path = require("path");

const localesDir = path.join("c:\\Users\\Almira\\Desktop\\FrontendS\\src\\locales");

const newTranslations = {
  en: {
    reservation_update_confirm: "Update"
  },
  de: {
    reservation_update_confirm: "Aktualisieren"
  },
  ru: {
    reservation_update_confirm: "Обновить"
  },
  tr: {
    reservation_update_confirm: "Güncelle"
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
