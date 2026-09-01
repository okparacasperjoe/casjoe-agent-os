import chromeCookiesSecure from 'chrome-cookies-secure';

chromeCookiesSecure.getCookies('https://www.google.com', 'puppeteer', function(err, cookies) {
    console.log(err, cookies);
}, 'Default');
