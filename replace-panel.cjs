const fs = require('fs');
const file = 'c:/Users/Almira/Desktop/FrontendS/src/components/ReservationFormPanel.jsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  { search: 'Geri\n              </button>', replace: '{t("res_form_back", "Geri")}\n              </button>' },
  { search: '? "Rezervasyon Düzenleme"\n                  : "Rezervasyon Detayları"', replace: '? t("res_form_edit_title", "Rezervasyon Düzenleme")\n                  : t("res_form_details_title", "Rezervasyon Detayları")' },
  { search: '>\n                                    Ad\n                                  </label>', replace: '>\n                                    {t("res_form_first_name", "Ad")}\n                                  </label>' },
  { search: '>\n                                    Soyad\n                                  </label>', replace: '>\n                                    {t("res_form_last_name", "Soyad")}\n                                  </label>' },
  { search: '>\n                                    Cinsiyet\n                                  </label>', replace: '>\n                                    {t("res_form_gender", "Cinsiyet")}\n                                  </label>' },
  { search: '<option value="MR">\n                                      {i18n.language?.startsWith("tr")\n                                        ? "Erkek"\n                                        : "Mr"}\n                                    </option>\n                                    <option value="MRS">\n                                      {i18n.language?.startsWith("tr")\n                                        ? "Kadın"\n                                        : "Mrs"}\n                                    </option>', replace: '<option value="MR">\n                                      {t("gender_male", "Erkek")}\n                                    </option>\n                                    <option value="MRS">\n                                      {t("gender_female", "Kadın")}\n                                    </option>' },
  { search: '>\n                                    Doğum Tarihi\n                                  </label>', replace: '>\n                                    {t("res_form_dob", "Doğum Tarihi")}\n                                  </label>' },
  { search: '>\n                                    Uyruk\n                                  </label>', replace: '>\n                                    {t("res_form_nationality", "Uyruk")}\n                                  </label>' },
  { search: '? "T.C. Kimlik Numarası"\n                                      : "Pasaport Numarası"', replace: '? t("res_form_tc_no", "T.C. Kimlik Numarası")\n                                      : t("res_form_passport_no", "Pasaport Numarası")' },
  { search: '>Türkiye (TR)<', replace: '>{t("country_tr", "Türkiye (TR)")}<' },
  { search: '>Almanya (DE)<', replace: '>{t("country_de", "Almanya (DE)")}<' },
  { search: '>Birleşik Krallık (GB)<', replace: '>{t("country_gb", "Birleşik Krallık (GB)")}<' },
  { search: '>Amerika Birleşik Devletleri (US)<', replace: '>{t("country_us", "Amerika Birleşik Devletleri (US)")}<' },
  { search: '>Fransa (FR)<', replace: '>{t("country_fr", "Fransa (FR)")}<' },
  { search: '>Hollanda (NL)<', replace: '>{t("country_nl", "Hollanda (NL)")}<' },
  { search: '>İtalya (IT)<', replace: '>{t("country_it", "İtalya (IT)")}<' },
  { search: '>İspanya (ES)<', replace: '>{t("country_es", "İspanya (ES)")}<' },
  { search: '>Avustralya (AU)<', replace: '>{t("country_au", "Avustralya (AU)")}<' },
  { search: '>Kanada (CA)<', replace: '>{t("country_ca", "Kanada (CA)")}<' },
  { search: '>Diğer<', replace: '>{t("country_other", "Diğer")}<' },
  { search: '<span>Vergiler ve Harçlar</span>', replace: '<span>{t("res_form_taxes_fees", "Vergiler ve Harçlar")}</span>' },
  { search: 'Toplam Tutar', replace: '{t("res_form_total_amount", "Toplam Tutar")}' },
  { search: '? "Güncellemeyi Önizle"\n                : "Rezervasyonu Önizle"', replace: '? t("res_form_preview_update", "Güncellemeyi Önizle")\n                : t("res_form_preview", "Rezervasyonu Önizle")' }
];

replacements.forEach(({ search, replace }) => {
  if (!content.includes(search)) {
    console.warn('Could not find:\\n', search);
  } else {
    content = content.replace(search, replace);
  }
});

fs.writeFileSync(file, content);
console.log('ReservationFormPanel translated.');
