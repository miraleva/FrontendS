import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { Metadata } from 'libphonenumber-js/core';
import metadataJson from 'libphonenumber-js/metadata.min.json';

const metadata = new Metadata(metadataJson);

// Bir ulkenin numaralandirma planinda (kutuphanenin kendi verisi) tanimli
// en uzun olasi ulusal numara uzunlugunu dondurur. Elle bir ulke->uzunluk
// tablosu tutmuyoruz; desteklenen her ulke icin ayni mantik otomatik calisir.
function getMaxNationalLength(country) {
  try {
    metadata.selectNumberingPlan(country);
    const lengths = metadata.numberingPlan.possibleLengths();
    return lengths && lengths.length > 0 ? Math.max(...lengths) : 15;
  } catch (e) {
    return 15;
  }
}

function getCallingCodeLength(country) {
  try {
    metadata.selectNumberingPlan(country);
    return String(metadata.numberingPlan.callingCode()).length;
  } catch (e) {
    return 2;
  }
}

// Yazilmakta olan numaranin ulkesini belirler. react-phone-number-input'un
// kendi "onCountryChange" olayi, kullanici ulke kodunu (+44 gibi) elle
// yazdiginda her zaman guvenilir sekilde tetiklenmiyor; bu yuzden ulkeyi
// state'te ayrica tutmak yerine, her defasinda numaranin kendisinden
// (basindaki uluslararasi koddan) yeniden hesapliyoruz.
function resolveCountry(value, defaultCountry) {
  if (!value || !value.startsWith('+')) {
    return defaultCountry;
  }

  const parsed = parsePhoneNumberFromString(value);
  if (parsed && parsed.country) {
    return parsed.country;
  }

  // Numara henuz kesin bir ulkeye netlesecek kadar uzun degil
  // (ornek: "+44207" gibi). Yazilan uluslararasi kodu, kutuphanenin
  // bildigi kodlarla en uzun eslesmeye gore ulkeye cevirmeye calisiyoruz.
  const digits = value.slice(1).replace(/\D/g, '');
  for (let len = 3; len >= 1; len--) {
    const candidateCode = digits.slice(0, len);
    if (!candidateCode) continue;
    const countries = metadata.getCountryCodesForCallingCode(candidateCode);
    if (countries && countries.length > 0) {
      return countries[0];
    }
  }

  return defaultCountry;
}

// react-phone-number-input, yazilan metni kendi ic DOM yonetimiyle
// bicimlendirdigi icin sadece React state'ini guncellememek yazmayi
// gorsel olarak durdurmuyor. Bu yuzden asil sinir, <input maxLength>
// niteligiyle taraycidan once uygulanmali. Bu fonksiyon, o an yazilmakta
// olan numaranin ulkesine gore (basindaki uluslararasi koddan otomatik
// belirlenerek) dinamik bir maxLength degeri hesaplar.
export function getPhoneInputMaxLength(value, defaultCountry = 'TR') {
  const country = resolveCountry(value, defaultCountry) || defaultCountry;
  try {
    const callingCodeLength = getCallingCodeLength(country);
    const maxNational = getMaxNationalLength(country);
    // '+' + ulke kodu + bir bosluk + ulusal numara
    return 2 + callingCodeLength + maxNational;
  } catch (e) {
    return 18;
  }
}

// Girilen numara, basindaki uluslararasi koddan (ornek: +90, +1, +44)
// otomatik belirlenen ulke icin olmasi gerekenden uzunsa true doner.
// Form state'inin dogru degeri tutmasi icin ek bir guvenlik katmani
// olarak kullanilir (asil engelleme numberInputProps.maxLength ile olur).
export function isPhoneNumberTooLong(value, defaultCountry = 'TR') {
  if (!value) return false;

  const country = resolveCountry(value, defaultCountry);
  if (!country) return false;

  const digitsOnly = value.replace(/\D/g, '');
  const parsed = parsePhoneNumberFromString(value);
  const callingCode = parsed ? parsed.countryCallingCode : null;
  const nationalDigits = callingCode && digitsOnly.startsWith(callingCode)
    ? digitsOnly.slice(callingCode.length)
    : digitsOnly;

  return nationalDigits.length > getMaxNationalLength(country);
}
