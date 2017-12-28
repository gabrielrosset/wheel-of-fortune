
// Assets files and directories
// --------------------------------
exports.source = {
    css: [
      'less/*.less',
      'less/**/*.less',
    ],
    js: [
      'js/wheel.js',
      'js/game.js',
    ],
    js_vendors: [
      'node_modules/konva/konva.min.js',
      'node_modules/jquery/dist/jquery.min.js',
      'node_modules/sprintf-js/dist/sprintf.min.js',
    ],
    img: [
      'img/**/*.+(jpg|jpeg|png|gif|ico|svg)'
    ],
    font: [
      'font/**/*.*'
    ],
    template: [
        'views/index.hbs'
    ],
    partials: [
        'views/partials',
    ],
    strings: './js/data/strings.js',
    helpers: './js/helpers/helpers.js',
};
exports.dest = {
    css: 'app/css/',
    js: 'app/js/',
    img: 'app/img/',
    font: 'app/font/',
};


// Internationalization
// --------------------------------
var culture = require("i18n");
culture.configure({
    locales: ['en', 'fr'],
    defaultLocale: 'fr',
    cookie: 'locale',
    queryParameter: 'lang',
    directory: __dirname + '/locales',
});
exports.i18n = culture;
