const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const headerTemplate = fs.readFileSync(path.join(root, 'partials', 'header.html'), 'utf8');
const footerTemplate = fs.readFileSync(path.join(root, 'partials', 'footer.html'), 'utf8');

const pages = [
  { file: 'index.html', lang: 'en' },
  { file: 'contact.html', lang: 'en' },
  { file: 'service.html', lang: 'en' },
  { file: 'service-overview.html', lang: 'en' },
  { file: path.join('ar', 'index.html'), lang: 'ar' },
  { file: path.join('ar', 'contact.html'), lang: 'ar' },
  { file: path.join('ar', 'service.html'), lang: 'ar' },
  { file: path.join('ar', 'service-overview.html'), lang: 'ar' }
];

const tokensForLang = (lang) => {
  if (lang === 'ar') {
    return {
      HOME_URL: '/ar/index.html#home',
      ABOUT_URL: '/ar/index.html#about',
      SERVICES_URL: '/ar/index.html#services',
      CONTACT_URL: '/ar/contact.html#contact',
      CTA_URL: '/ar/contact.html#contact',
      LANG_SWITCH_URL: '/index.html',
      LANG_SWITCH_LABEL: 'EN',
      HOME_LABEL: 'الرئيسية',
      ABOUT_LABEL: 'من نحن',
      SERVICES_LABEL: 'خدماتنا',
      CONTACT_LABEL: 'تواصل معنا',
      CTA_LABEL: 'تواصل معنا'
    };
  }

  return {
    HOME_URL: 'index.html#home',
    ABOUT_URL: 'index.html#about',
    SERVICES_URL: 'index.html#services',
    CONTACT_URL: 'contact.html#contact',
    CTA_URL: 'contact.html#contact',
    LANG_SWITCH_URL: '/ar/index.html',
    LANG_SWITCH_LABEL: 'AR',
    HOME_LABEL: 'HOME',
    ABOUT_LABEL: 'ABOUT US',
    SERVICES_LABEL: 'SERVICES',
    CONTACT_LABEL: 'CONTACT',
    CTA_LABEL: 'Get an Appointment'
  };
};

const applyTokens = (template, tokens) => {
  return Object.entries(tokens).reduce((acc, [key, value]) => {
    const pattern = new RegExp(`{{${key}}}`, 'g');
    return acc.replace(pattern, value);
  }, template);
};

const wrapPartial = (name, content) => `<!-- PARTIAL:${name} -->\n${content}\n<!-- /PARTIAL:${name} -->`;

const replaceOrInsert = (html, name, content, fallbackRegex) => {
  const marker = new RegExp(`<!-- PARTIAL:${name} -->[\s\S]*?<!-- /PARTIAL:${name} -->`, 'm');
  if (marker.test(html)) {
    return html.replace(marker, wrapPartial(name, content));
  }
  if (fallbackRegex && fallbackRegex.test(html)) {
    return html.replace(fallbackRegex, wrapPartial(name, content));
  }
  return html;
};

pages.forEach(({ file, lang }) => {
  const pagePath = path.join(root, file);
  if (!fs.existsSync(pagePath)) return;

  const tokens = tokensForLang(lang);
  const header = applyTokens(headerTemplate, tokens);
  const footer = applyTokens(footerTemplate, tokens);

  let html = fs.readFileSync(pagePath, 'utf8');
  html = replaceOrInsert(html, 'header', header, /<header[\s\S]*?<\/header>/m);
  html = replaceOrInsert(html, 'footer', footer, /<footer[\s\S]*?<\/footer>/m);

  fs.writeFileSync(pagePath, html, 'utf8');
  console.log(`Updated ${file}`);
});
