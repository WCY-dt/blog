var ua = navigator.userAgent.toLowerCase();
var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
            /(webkit)[ \/]([\w.]+)/.exec(ua) ||
            /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
            /(msie) ([\w.]+)/.exec(ua) ||
            ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
            [];

var browser = match[1] || "";
var version = match[2] || "0";

if (sessionStorage.getItem('alertShown') === null) {
    if (browser === 'chrome' && version < 115) {
        alert("您正在使用Chrome版本小于115，可能会遇到兼容性问题。");
        sessionStorage.setItem('alertShown', 'true');
    } else if (browser === 'webkit' && version < 115) {
        alert("您正在使用Safari，可能会遇到兼容性问题。");
        sessionStorage.setItem('alertShown', 'true');
    } else if (browser === 'opera' && version < 101) {
        alert("您正在使用Opera版本小于101，可能会遇到兼容性问题。");
        sessionStorage.setItem('alertShown', 'true');
    } else if (browser === 'msie' && version < 115) {
        alert("您正在使用Edge版本小于115，可能会遇到兼容性问题。");
        sessionStorage.setItem('alertShown', 'true');
    } else if (browser === 'mozilla') {
        alert("您正在使用Firefox，可能会遇到兼容性问题。");
        sessionStorage.setItem('alertShown', 'true');
    }
}