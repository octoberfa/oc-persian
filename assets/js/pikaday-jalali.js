/*!
    JDate
*/
/*
  Converts a Gregorian date to Jalaali.
*/
function toJalaali(gy, gm, gd) {
    if (Object.prototype.toString.call(gy) === '[object Date]') {
        gd = gy.getDate()
        gm = gy.getMonth() + 1
        gy = gy.getFullYear()
    }
    return d2j(g2d(gy, gm, gd))
}

/*
  Converts a Jalaali date to Gregorian.
*/
function toGregorian(jy, jm, jd) {
    return d2g(j2d(jy, jm, jd))
}

/*
  Checks whether a Jalaali date is valid or not.
*/
function isValidJalaaliDate(jy, jm, jd) {
    return jy >= -61 && jy <= 3177 &&
        jm >= 1 && jm <= 12 &&
        jd >= 1 && jd <= jalaaliMonthLength(jy, jm)
}

/*
  Is this a leap year or not?
*/
function isLeapJalaaliYear(jy) {
    return jalCal(jy).leap === 0
}

/*
  Number of days in a given month in a Jalaali year.
*/
function jalaaliMonthLength(jy, jm) {
    if (jm <= 6) return 31
    if (jm <= 11) return 30
    if (isLeapJalaaliYear(jy)) return 30
    return 29
}

/*
  This function determines if the Jalaali (Persian) year is
  leap (366-day long) or is the common year (365 days), and
  finds the day in March (Gregorian calendar) of the first
  day of the Jalaali year (jy).
  @param jy Jalaali calendar year (-61 to 3177)
  @return
    leap: number of years since the last leap year (0 to 4)
    gy: Gregorian year of the beginning of Jalaali year
    march: the March day of Farvardin the 1st (1st day of jy)
  @see: http://www.astro.uni.torun.pl/~kb/Papers/EMP/PersianC-EMP.htm
  @see: http://www.fourmilab.ch/documents/calendar/
*/
function jalCal(jy) {
    // Jalaali years starting the 33-year rule.
    var breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178],
        bl = breaks.length,
        gy = jy + 621,
        leapJ = -14,
        jp = breaks[0],
        jm, jump, leap, leapG, march, n, i

    if (jy < jp || jy >= breaks[bl - 1])
        throw new Error('Invalid Jalaali year ' + jy)

    // Find the limiting years for the Jalaali year jy.
    for (i = 1; i < bl; i += 1) {
        jm = breaks[i]
        jump = jm - jp
        if (jy < jm)
            break
        leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4)
        jp = jm
    }
    n = jy - jp

    // Find the number of leap years from AD 621 to the beginning
    // of the current Jalaali year in the Persian calendar.
    leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4)
    if (mod(jump, 33) === 4 && jump - n === 4)
        leapJ += 1

    // And the same in the Gregorian calendar (until the year gy).
    leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150

    // Determine the Gregorian date of Farvardin the 1st.
    march = 20 + leapJ - leapG

    // Find how many years have passed since the last leap year.
    if (jump - n < 6)
        n = n - jump + div(jump + 4, 33) * 33
    leap = mod(mod(n + 1, 33) - 1, 4)
    if (leap === -1) {
        leap = 4
    }

    return {
        leap: leap,
        gy: gy,
        march: march
    }
}

/*
  Converts a date of the Jalaali calendar to the Julian Day number.
  @param jy Jalaali year (1 to 3100)
  @param jm Jalaali month (1 to 12)
  @param jd Jalaali day (1 to 29/31)
  @return Julian Day number
*/
function j2d(jy, jm, jd) {
    var r = jalCal(jy)
    return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1
}

/*
  Converts the Julian Day number to a date in the Jalaali calendar.
  @param jdn Julian Day number
  @return
    jy: Jalaali year (1 to 3100)
    jm: Jalaali month (1 to 12)
    jd: Jalaali day (1 to 29/31)
*/
function d2j(jdn) {
    var gy = d2g(jdn).gy // Calculate Gregorian year (gy).
        ,
        jy = gy - 621,
        r = jalCal(jy),
        jdn1f = g2d(gy, 3, r.march),
        jd, jm, k

    // Find number of days that passed since 1 Farvardin.
    k = jdn - jdn1f
    if (k >= 0) {
        if (k <= 185) {
            // The first 6 months.
            jm = 1 + div(k, 31)
            jd = mod(k, 31) + 1
            return {
                jy: jy,
                jm: jm,
                jd: jd
            }
        } else {
            // The remaining months.
            k -= 186
        }
    } else {
        // Previous Jalaali year.
        jy -= 1
        k += 179
        if (r.leap === 1)
            k += 1
    }
    jm = 7 + div(k, 30)
    jd = mod(k, 30) + 1
    return {
        jy: jy,
        jm: jm,
        jd: jd
    }
}

/*
  Calculates the Julian Day number from Gregorian or Julian
  calendar dates. This integer number corresponds to the noon of
  the date (i.e. 12 hours of Universal Time).
  The procedure was tested to be good since 1 March, -100100 (of both
  calendars) up to a few million years into the future.
  @param gy Calendar year (years BC numbered 0, -1, -2, ...)
  @param gm Calendar month (1 to 12)
  @param gd Calendar day of the month (1 to 28/29/30/31)
  @return Julian Day number
*/
function g2d(gy, gm, gd) {
    var d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
        div(153 * mod(gm + 9, 12) + 2, 5) +
        gd - 34840408
    d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752
    return d
}

/*
  Calculates Gregorian and Julian calendar dates from the Julian Day number
  (jdn) for the period since jdn=-34839655 (i.e. the year -100100 of both
  calendars) to some millions years ahead of the present.
  @param jdn Julian Day number
  @return
    gy: Calendar year (years BC numbered 0, -1, -2, ...)
    gm: Calendar month (1 to 12)
    gd: Calendar day of the month M (1 to 28/29/30/31)
*/
function d2g(jdn) {
    var j, i, gd, gm, gy
    j = 4 * jdn + 139361631
    j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908
    i = div(mod(j, 1461), 4) * 5 + 308
    gd = div(mod(i, 153), 5) + 1
    gm = mod(div(i, 153), 12) + 1
    gy = div(j, 1461) - 100100 + div(8 - gm, 6)
    return {
        gy: gy,
        gm: gm,
        gd: gd
    }
}

/*
  Utility helper functions.
*/

function div(a, b) {
    return ~~(a / b)
}

function mod(a, b) {
    return a - ~~(a / b) * b
}

// Calculate Gregorian calendar date from Julian day
function jd_to_gregorian(jd) {
    var res = d2g(jd);
    return [res.gy, res.gm, res.gd];
}

function gregorian_to_jd(year, month, day) {
    return g2d(year, month, day);
}

function jd_to_persian(jd) {
    var res = d2j(jd);
    return [res.jy, res.jm, res.jd];
}

// Determine Julian day from Persian date
function persian_to_jd(year, month, day) {
    return j2d(year, month, day);
}

function persian_to_jd_fixed(year, month, day) {
    /*
     Fix `persian_to_jd` so we can use negative or large values for month, e.g:
     persian_to_jd_fixed(1393, 26, 1) == persian_to_jd_fixed(1395, 2, 1)
     persian_to_jd_fixed(1393, -2, 1) == persian_to_jd_fixed(1392, 10, 1)
     */
    if (month > 12 || month <= 0) {
        var yearDiff = Math.floor((month - 1) / 12);
        year += yearDiff;
        month = month - yearDiff * 12;
    }
    return persian_to_jd(year, month, day);
}

function digits_fa2en(value) {
    var newValue = "";
    for (var i = 0; i < value.length; i++) {
        var ch = value.charCodeAt(i);
        if (ch >= 1776 && ch <= 1785) // For Persian digits.
        {
            var newChar = ch - 1728;
            newValue = newValue + String.fromCharCode(newChar);
        } else if (ch >= 1632 && ch <= 1641) // For Arabic & Unix digits.
        {
            var newChar = ch - 1584;
            newValue = newValue + String.fromCharCode(newChar);
        } else
            newValue = newValue + String.fromCharCode(ch);
    }
    return newValue;
}

function digits_en2fa(value) {
    if (!value) {
        return;
    }
    value = value + '';
    var englishNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
        persianNumbers = ["۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹", "۰"];

    for (var i = 0, numbersLen = englishNumbers.length; i < numbersLen; i++) {
        value = value.replace(new RegExp(englishNumbers[i], "g"), persianNumbers[i]);
    }
    return value;
}


function pad2(number) {
    return number < 10 ? `0${number}` : number;
}


function parseDateString(string) {
    var re = /^(شنبه|یکشنبه|دوشنبه|سه شنبه|چهارشنبه|پنجشنبه|جمعه)\s(\d\d)\s*(فروردین|اردیبهشت|خرداد|تیر|مرداد|شهریور|مهر|آبان|آذر|دی|بهمن|اسفند)\s*(\d\d\d\d)$/,
        match = re.exec(string),
        year,
        month,
        day;
    if (!match) {
        return;
    }
    year = parseInt(match[4]);
    month = parseInt(JDate.i18n.months.indexOf(match[3])) + 1;
    day = parseInt(match[2]);
    var gd = jd_to_gregorian(persian_to_jd_fixed(year, month, day));
    return new Date(gd[0], gd[1] - 1, gd[2]);
}

function parseDate(string, convertToPersian) {
    /*
     http://en.wikipedia.org/wiki/ISO_8601
     http://dygraphs.com/date-formats.html
     https://github.com/arshaw/xdate/blob/master/src/xdate.js#L414
     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
     tests:
     +parseDate('2014') == +new Date('2014')
     +parseDate('2014-2') == +new Date('2014-02')
     +parseDate('2014-2-3') == +new Date('2014-02-03')
     +parseDate('2014-02-03 12:11') == +new Date('2014/02/03 12:11')
     +parseDate('2014-02-03T12:11') == +new Date('2014/02/03 12:11')
     parseDate('2014/02/03T12:11') == undefined
     +parseDate('2014/02/03 12:11:10.2') == +new Date('2014/02/03 12:11:10') + 200
     +parseDate('2014/02/03 12:11:10.02') == +new Date('2014/02/03 12:11:10') + 20
     parseDate('2014/02/03 12:11:10Z') == undefined
     +parseDate('2014-02-03T12:11:10Z') == +new Date('2014-02-03T12:11:10Z')
     +parseDate('2014-02-03T12:11:10+0000') == +new Date('2014-02-03T12:11:10Z')
     +parseDate('2014-02-03T10:41:10+0130') == +new Date('2014-02-03T12:11:10Z')
     */
    var re = /^(\d|\d\d|\d\d\d\d)(?:([-\/])(\d{1,2})(?:\2(\d|\d\d|\d\d\d\d))?)?(([ T])(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?(Z|([+-])(\d{2})(?::?(\d{2}))?)?)?$/;
    var match = re.exec(string);
    // re.exec('2012-4-5 01:23:10.1111+0130')
    //  0                              1       2    3    4    5                      6    7     8     9     10      11       12   13    14
    // ["2012-4-5 01:23:10.1111+0330", "2012", "-", "4", "5", " 01:23:10.1111+0130", " ", "01", "23", "10", "1111", "+0330", "+", "03", "30"]

    var date;
    var separator;
    var timeSeparator;
    var year;
    var month;
    var day;
    var isISO;
    var hour;
    var minute;
    var seconds;
    var millis;
    var tz;
    var isNonLocal;
    var tzOffset;

    if (!match) {
        return;
    }

    separator = match[2];
    timeSeparator = match[6];
    year = +match[1];
    month = +match[3] || 1;
    day = +match[4] || 1;
    isISO = (separator !== '/') && (match[6] !== ' ');
    hour = +match[7] || 0;
    minute = +match[8] || 0;
    seconds = +match[9] || 0;
    millis = +(`0.${(match[10] || '0')}`) * 1000;
    tz = match[11];
    isNonLocal = isISO && (tz || !match[5]);
    tzOffset = (match[12] === '-' ? -1 : 1) * ((+match[13] || 0) * 60 + (+match[14] || 0));

    // timezone should be empty if dates are with / (2012/1/10)
    if ((tz || timeSeparator === 'T') && !isISO) {
        return;
    }

    // one and only-one of year/day should be 4-chars (2012/1/10 vs 10/1/2012)
    if ((day >= 1000) === (year >= 1000)) {
        return;
    }

    if (day >= 1000) {
        // year and day only can be swapped if using '/' as separator
        if (separator === '-') {
            return;
        }
        day = +match[1];
        year = day;
    }

    if (convertToPersian) {
        const persian = jd_to_gregorian(persian_to_jd_fixed(year, month, day));
        year = persian[0];
        month = persian[1];
        day = persian[2];
    }

    date = new Date(year, month - 1, day, hour, minute, seconds, millis);

    if (isNonLocal) {
        date.setUTCMinutes(date.getUTCMinutes() - date.getTimezoneOffset() + tzOffset);
    }

    return date;
}

var isDate = function (obj) {
    return (/Date/).test(Object.prototype.toString.call(obj)) && !isNaN(obj.getTime());
}

var Data = window.Date;

var proto;

/**
 * @param {Object=} a ,may have different types for different semantics: 1) string: parse a date
 * 		2) Date object: clone a date object  3) number: value for year
 * @param {Number=} month
 * @param {Number=} day
 * @param {Number=} hour
 * @param {Number=} minute
 * @param {Number=} second
 * @param {Number=} millisecond
 * @constructor
 * @extends {Date}
 */
function JDate(a, month, day, hour, minute, second, millisecond) {
    if (a === '') {
        this._d = new Date();
    } else if (typeof a === 'string' && (parseInt(a) != a)) {
        a = digits_fa2en(a);
        this._d = parseDate(a, true);
        if (!isDate(this._d)) {
            this._d = parseDateString(a);
            if (!isDate(this._d)) {
                this._d = new Date(a);
                if (!isDate(this._d)) {
                    this._d = new Date();
                }
            }
        }
    } else if (arguments.length === 0) {
        this._d = new Date();
    } else if (arguments.length === 1) {
        this._d = new Date((a instanceof JDate) ? a._d : a);
    } else {
        const persian = jd_to_gregorian(persian_to_jd_fixed(parseInt(a), (parseInt(month) || 0) + 1, parseInt(day) || 1));
        this._d = new Date(persian[0], persian[1] - 1, persian[2], hour || 0, minute || 0, second || 0, millisecond || 0);
    }
    this._date = this._d;
    this._cached_date_ts = null;
    this._cached_date = [0, 0, 0];
    this._cached_utc_date_ts = null;
    this._cached_utc_date = [0, 0, 0];
}

proto = JDate.prototype;
/**
 * returns current Jalali date representation of internal date object, eg. [1394, 12, 5]
 * Caches the converted Jalali date for improving performance
 * @returns {Array}
 */
proto._persianDate = function () {
    if (this._cached_date_ts != +this._d) {
        this._cached_date_ts = +this._d;
        this._cached_date = jd_to_persian(gregorian_to_jd(this._d.getFullYear(), this._d.getMonth() + 1, this._d.getDate()));
    }
    return this._cached_date;
};
/**
 * Exactly like `_persianDate` but for UTC value of date
 */
proto._persianUTCDate = function () {
    if (this._cached_utc_date_ts != +this._d) {
        this._cached_utc_date_ts = +this._d;
        this._cached_utc_date = jd_to_persian(gregorian_to_jd(this._d.getUTCFullYear(), this._d.getUTCMonth() + 1, this._d.getUTCDate()));
    }
    return this._cached_utc_date;
};
/**
 *
 * @param which , which component of date to change? 0 for year, 1 for month, 2 for day
 * @param value , value of specified component
 * @param {Number=} dayValue , change the day along-side specified component, used for setMonth(month[, dayValue])
 */
proto._setPersianDate = function (which, value, dayValue) {
    var persian = this._persianDate();
    persian[which] = value;
    if (dayValue !== undefined) {
        persian[2] = dayValue;
    }
    var new_date = jd_to_gregorian(persian_to_jd_fixed(persian[0], persian[1], persian[2]));
    this._d.setFullYear(new_date[0]);
    this._d.setMonth(new_date[1] - 1, new_date[2]);
};
/**
 * Exactly like `_setPersianDate`, but operates UTC value
 */
proto._setUTCPersianDate = function (which, value, dayValue) {
    var persian = this._persianUTCDate();
    if (dayValue !== undefined) {
        persian[2] = dayValue;
    }
    persian[which] = value;
    var new_date = jd_to_gregorian(persian_to_jd_fixed(persian[0], persian[1], persian[2]));
    this._d.setUTCFullYear(new_date[0]);
    this._d.setUTCMonth(new_date[1] - 1, new_date[2]);
};

// All date getter methods
proto.getDate = function () {
    return this._persianDate()[2];
};
proto.getMonth = function () {
    return this._persianDate()[1] - 1;
};
proto.getFullYear = function () {
    return this._persianDate()[0];
};
proto.getUTCDate = function () {
    return this._persianUTCDate()[2];
};
proto.getUTCMonth = function () {
    return this._persianUTCDate()[1] - 1;
};
proto.getUTCFullYear = function () {
    return this._persianUTCDate()[0];
};

// All date setter methods
proto.setDate = function (dayValue) {
    this._setPersianDate(2, dayValue);
};
proto.setFullYear = function (yearValue) {
    this._setPersianDate(0, yearValue);
};
proto.setMonth = function (monthValue, dayValue) {
    this._setPersianDate(1, monthValue + 1, dayValue);
};
proto.setUTCDate = function (dayValue) {
    this._setUTCPersianDate(2, dayValue);
};
proto.setUTCFullYear = function (yearValue) {
    this._setUTCPersianDate(0, yearValue);
};
proto.setUTCMonth = function (monthValue, dayValue) {
    this._setUTCPersianDate(1, monthValue + 1, dayValue);
};

/**
 * The Date.toLocaleString() method can return a string with a language sensitive representation of this date,
 * so we change it to return date in Jalali calendar
 */
proto.toLocaleString = function () {
    return `${this.getFullYear()}/${pad2(this.getMonth() + 1)}/${pad2(this.getDate())} ${pad2(this.getHours())}:${pad2(this.getMinutes())}:${pad2(this.getSeconds())}`;
};

/**
 * The Date.now() method returns the number of milliseconds elapsed since 1 January 1970 00:00:00 UTC.
 */
JDate.now = function now() {
    return Date.now();
};

/**
 * parses a string representation of a date, and returns the number of milliseconds since January 1, 1970, 00:00:00 UTC.
 */
JDate.parse = function parse(strDate) {
    return (new JDate(strDate)).getTime();
};


proto.toDateString = function () {
    return JDate.i18n.weekdays[this.getDay()] + ' ' +
        pad2(this.getDate()) + ' ' +
        JDate.i18n.months[this.getMonth()] + ' ' + this.getFullYear();

}

JDate.i18n = {
    months: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'],
    weekdays: ['یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
    weekdaysShort: ['یک', 'دو', 'سه', 'چهار', 'پنج', 'جمعه', 'شنبه']
}
/**
 * The Date.UTC() method accepts the same parameters as the longest form of the constructor, and returns the number of
 * milliseconds in a Date object since January 1, 1970, 00:00:00, universal time.
 */
JDate.UTC = function (year, month, date, hours, minutes, seconds, milliseconds) {
    var d = jd_to_gregorian(persian_to_jd_fixed(year, month + 1, date || 1));
    return Date.UTC(d[0], d[1] - 1, d[2], hours || 0, minutes || 0, seconds || 0, milliseconds || 0);
};

// Proxy all time-related methods to internal date object
['getHours', 'getMilliseconds', 'getMinutes', 'getSeconds', 'getTime', 'getUTCDay',
    'getUTCHours', 'getTimezoneOffset', 'getUTCMilliseconds', 'getUTCMinutes', 'getUTCSeconds',
    'setHours', 'setMilliseconds', 'setMinutes', 'setSeconds', 'setTime', 'setUTCHours',
    'setUTCMilliseconds', 'setUTCMinutes', 'setUTCSeconds', 'toISOString',
    'toJSON', 'toString', 'toLocaleDateString', 'toLocaleTimeString', 'toTimeString',
    'toUTCString', 'valueOf', 'getDay'
].forEach((method) => {
    proto[method] = function () {
        return this._d[method].apply(this._d, arguments);
    };
});


/*!
 * Pikaday
 *
 * Copyright © 2014 David Bushell | BSD & MIT license | https://github.com/Pikaday/Pikaday
 */

(function (root, factory) {
    'use strict';

    var moment;
    if (typeof exports === 'object') {
        // CommonJS module
        // Load moment.js as an optional dependency
        try {
            moment = require('moment');
        } catch (e) {}
        module.exports = factory(moment);
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(function (req) {
            // Load moment.js as an optional dependency
            var id = 'moment';
            try {
                moment = req(id);
            } catch (e) {}
            return factory(moment);
        });
    } else {
        root.Pikaday = factory(root.moment);
    }
}(this, function (moment) {
    return function (Date, oDate) {
        'use strict';

        /**
         * feature detection and helper functions
         */
        var hasMoment = typeof moment === 'function',

            hasEventListeners = !!window.addEventListener,

            document = window.document,

            sto = window.setTimeout,

            addEvent = function (el, e, callback, capture) {
                if (hasEventListeners) {
                    el.addEventListener(e, callback, !!capture);
                } else {
                    el.attachEvent('on' + e, callback);
                }
            },

            removeEvent = function (el, e, callback, capture) {
                if (hasEventListeners) {
                    el.removeEventListener(e, callback, !!capture);
                } else {
                    el.detachEvent('on' + e, callback);
                }
            },

            trim = function (str) {
                return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
            },

            hasClass = function (el, cn) {
                return (' ' + el.className + ' ').indexOf(' ' + cn + ' ') !== -1;
            },

            addClass = function (el, cn) {
                if (!hasClass(el, cn)) {
                    el.className = (el.className === '') ? cn : el.className + ' ' + cn;
                }
            },

            removeClass = function (el, cn) {
                el.className = trim((' ' + el.className + ' ').replace(' ' + cn + ' ', ' '));
            },

            isArray = function (obj) {
                return (/Array/).test(Object.prototype.toString.call(obj));
            },

            isDate = function (obj) {
                return ((/Object/).test(Object.prototype.toString.call(obj)) && typeof obj.getTime === "function" && !isNaN(obj.getTime())) ||
                    ((/Date/).test(Object.prototype.toString.call(obj)) && !isNaN(obj.getTime()));
            },

            isODate = function (obj) {
                return (/Date/).test(Object.prototype.toString.call(obj)) && !isNaN(obj.getTime());
            },

            isWeekend = function (date) {
                var day = date.getDay();
                return day === 4 || day === 5;
            },

            isLeapYear = function (year) {
                return jalCal(year).leap === 0
            },

            getDaysInMonth = function (year, month) {
                return [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, isLeapYear(year, true) ? 30 : 29][month];
            },

            setToStartOfDay = function (date) {
                if (isDate(date)) date.setHours(0, 0, 0, 0);
            },

            compareDates = function (a, b) {
                // weak date comparison (use setToStartOfDay(date) to ensure correct result)
                return a.getTime() === b.getTime();
            },

            extend = function (to, from, overwrite) {
                var prop, hasProp;
                for (prop in from) {
                    hasProp = to[prop] !== undefined;
                    if (hasProp && typeof from[prop] === 'object' && from[prop] !== null && from[prop].nodeName === undefined) {
                        if (isDate(from[prop])) {
                            if (overwrite) {
                                to[prop] = new Date(from[prop].getTime());
                            }
                        } else if (isArray(from[prop])) {
                            if (overwrite) {
                                to[prop] = from[prop].slice(0);
                            }
                        } else {
                            to[prop] = extend({}, from[prop], overwrite);
                        }
                    } else if (overwrite || !hasProp) {
                        to[prop] = from[prop];
                    }
                }
                return to;
            },

            fireEvent = function (el, eventName, data) {
                var ev;

                if (document.createEvent) {
                    ev = document.createEvent('HTMLEvents');
                    ev.initEvent(eventName, true, false);
                    ev = extend(ev, data);
                    el.dispatchEvent(ev);
                } else if (document.createEventObject) {
                    ev = document.createEventObject();
                    ev = extend(ev, data);
                    el.fireEvent('on' + eventName, ev);
                }
            },

            adjustCalendar = function (calendar) {
                if (calendar.month < 0) {
                    calendar.year -= Math.ceil(Math.abs(calendar.month) / 12);
                    calendar.month += 12;
                }
                if (calendar.month > 11) {
                    calendar.year += Math.floor(Math.abs(calendar.month) / 12);
                    calendar.month -= 12;
                }
                return calendar;
            },

            /**
             * defaults and localisation
             */
            defaults = {

                // bind the picker to a form field
                field: null,

                // automatically show/hide the picker on `field` focus (default `true` if `field` is set)
                bound: undefined,

                // data-attribute on the input field with an aria assistance tekst (only applied when `bound` is set)
                ariaLabel: 'Use the arrow keys to pick a date',

                // position of the datepicker, relative to the field (default to bottom & left)
                // ('bottom' & 'left' keywords are not used, 'top' & 'right' are modifier on the bottom/left position)
                position: 'bottom left',

                // automatically fit in the viewport even if it means repositioning from the position option
                reposition: true,

                // the default output format for `.toString()` and `field` value
                format: 'YYYY-MM-DD',

                // the toString function which gets passed a current date object and format
                // and returns a string
                toString: null,

                // used to create date object from current input string
                parse: null,

                // the initial date to view when first opened
                defaultDate: null,

                // make the `defaultDate` the initial selected value
                setDefaultDate: false,

                // first day of week (0: Sunday, 1: Monday etc)
                firstDay: 6,

                // the default flag for moment's strict date parsing
                formatStrict: false,

                // the minimum/earliest date that can be selected
                minDate: null,
                // the maximum/latest date that can be selected
                maxDate: null,

                // number of years either side, or array of upper/lower range
                yearRange: 10,

                // show week numbers at head of row
                showWeekNumber: false,

                // Week picker mode
                pickWholeWeek: false,

                // used internally (don't config outside)
                minYear: 0,
                maxYear: 9999,
                minMonth: undefined,
                maxMonth: undefined,

                startRange: null,
                endRange: null,

                isRTL: false,

                persianNumbers: true,

                // Additional text to append to the year in the calendar title
                yearSuffix: '',

                // Render the month after year in the calendar title
                showMonthAfterYear: false,

                // Render days of the calendar grid that fall in the next or previous month
                showDaysInNextAndPreviousMonths: false,

                // Allows user to select days that fall in the next or previous month
                enableSelectionDaysInNextAndPreviousMonths: false,

                // how many months are visible
                numberOfMonths: 1,

                // when numberOfMonths is used, this will help you to choose where the main calendar will be (default `left`, can be set to `right`)
                // only used for the first display or when a selected date is not visible
                mainCalendar: 'left',

                // Specify a DOM element to render the calendar in
                container: undefined,

                // Blur field when date is selected
                blurFieldOnSelect: true,

                // internationalization
                i18n: {
                    previousMonth: 'ماه قبل',
                    nextMonth: 'ماه بعد',
                    months: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'],
                    weekdays: ['یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
                    weekdaysShort: ['یک', 'دو', 'سه', 'چهار', 'پنج', 'جمعه', 'شنبه']
                },

                // Theme Classname
                theme: null,

                // events array
                events: [],

                // callback function
                onSelect: null,
                onOpen: null,
                onClose: null,
                onDraw: null,

                // Enable keyboard input
                keyboardInput: true
            },


            /**
             * templating functions to abstract HTML rendering
             */
            renderDayName = function (opts, day, abbr) {
                day += 6;
                while (day >= 7) {
                    day -= 7;
                }
                return abbr ? opts.i18n.weekdaysShort[day] : opts.i18n.weekdays[day];
            },

            renderDay = function (opts) {
                var arr = [];
                var ariaSelected = 'false';
                if (opts.isEmpty) {
                    if (opts.showDaysInNextAndPreviousMonths) {
                        arr.push('is-outside-current-month');

                        if (!opts.enableSelectionDaysInNextAndPreviousMonths) {
                            arr.push('is-selection-disabled');
                        }

                    } else {
                        return '<td class="is-empty"></td>';
                    }
                }
                if (opts.isDisabled) {
                    arr.push('is-disabled');
                }
                if (opts.isToday) {
                    arr.push('is-today');
                }
                if (opts.isSelected) {
                    arr.push('is-selected');
                    ariaSelected = 'true';
                }
                if (opts.hasEvent) {
                    arr.push('has-event');
                }
                if (opts.isInRange) {
                    arr.push('is-inrange');
                }
                if (opts.isStartRange) {
                    arr.push('is-startrange');
                }
                if (opts.isEndRange) {
                    arr.push('is-endrange');
                }
                return '<td data-day="' + opts.day + '" class="' + arr.join(' ') + '" aria-selected="' + ariaSelected + '">' +
                    '<button class="pika-button pika-day" type="button" ' +
                    'data-pika-year="' + opts.year + '" data-pika-month="' + opts.month + '" data-pika-day="' + opts.day + '">' +
                    (opts.persianNumbers ? digits_en2fa(opts.day) : opts.day) +
                    '</button>' +
                    '</td>';
            },

            isoWeek = function (date) {
                // Ensure we're at the start of the day.
                date.setHours(0, 0, 0, 0);

                // Thursday in current week decides the year because January 4th
                // is always in the first week according to ISO8601.

                var yearDay = date.getDate(),
                    weekDay = date.getDay(),
                    dayInFirstWeek = 4 // January 4th
                    ,
                    dayShift = dayInFirstWeek - 1 // counting starts at 0
                    ,
                    daysPerWeek = 7,
                    prevWeekDay = function (day) {
                        return (day + daysPerWeek - 1) % daysPerWeek;
                    };

                // Adjust to Thursday in week 1 and count number of weeks from date to week 1.

                date.setDate(yearDay + dayShift - prevWeekDay(weekDay));

                var jan4th = new Date(date.getFullYear(), 0, dayInFirstWeek),
                    msPerDay = 24 * 60 * 60 * 1000,
                    daysBetween = (date.getTime() - jan4th.getTime()) / msPerDay,
                    weekNum = 1 + Math.round((daysBetween - dayShift + prevWeekDay(jan4th.getDay())) / daysPerWeek);

                return weekNum;
            },

            renderWeek = function (d, m, y) {
                var date = new Date(y, m, d),
                    week = hasMoment ? moment(date).isoWeek() : isoWeek(date);

                return '<td class="pika-week">' + week + '</td>';
            },

            renderRow = function (days, isRTL, pickWholeWeek, isRowSelected) {
                return '<tr class="pika-row' + (pickWholeWeek ? ' pick-whole-week' : '') + (isRowSelected ? ' is-selected' : '') + '">' + (isRTL ? days.reverse() : days).join('') + '</tr>';
            },

            renderBody = function (rows) {
                return '<tbody>' + rows.join('') + '</tbody>';
            },

            renderHead = function (opts) {
                var i, arr = [];
                if (opts.showWeekNumber) {
                    arr.push('<th></th>');
                }
                for (i = 0; i < 7; i++) {
                    arr.push('<th scope="col"><abbr title="' + renderDayName(opts, i) + '">' + renderDayName(opts, i, true) + '</abbr></th>');
                }
                return '<thead><tr>' + (opts.isRTL ? arr.reverse() : arr).join('') + '</tr></thead>';
            },

            renderTitle = function (instance, c, year, month, refYear, randId) {
                var i, j, arr,
                    opts = instance._o,
                    isMinYear = year === opts.minYear,
                    isMaxYear = year === opts.maxYear,
                    html = '<div id="' + randId + '" class="pika-title" role="heading" aria-live="assertive">',
                    monthHtml,
                    yearHtml,
                    prev = true,
                    next = true;

                for (arr = [], i = 0; i < 12; i++) {
                    arr.push('<option value="' + (year === refYear ? i - c : 12 + i - c) + '"' +
                        (i === month ? ' selected="selected"' : '') +
                        ((isMinYear && i < opts.minMonth) || (isMaxYear && i > opts.maxMonth) ? ' disabled="disabled"' : '') + '>' +
                        opts.i18n.months[i] + '</option>');
                }

                monthHtml = '<div class="pika-label">' + opts.i18n.months[month] + '<select class="pika-select pika-select-month" tabindex="-1">' + arr.join('') + '</select></div>';

                if (isArray(opts.yearRange)) {
                    i = opts.yearRange[0];
                    j = opts.yearRange[1] + 1;
                } else {
                    i = year - opts.yearRange;
                    j = 1 + year + opts.yearRange;
                }

                for (arr = []; i < j && i <= opts.maxYear; i++) {
                    if (i >= opts.minYear) {
                        arr.push('<option value="' + i + '"' + (i === year ? ' selected="selected"' : '') + '>' + (opts.persianNumbers ? digits_en2fa(i) : i) + '</option>');
                    }
                }
                yearHtml = '<div class="pika-label">' + (opts.persianNumbers ? digits_en2fa(year) : year) + opts.yearSuffix + '<select class="pika-select pika-select-year" tabindex="-1">' + arr.join('') + '</select></div>';

                if (opts.showMonthAfterYear) {
                    html += yearHtml + monthHtml;
                } else {
                    html += monthHtml + yearHtml;
                }

                if (isMinYear && (month === 0 || opts.minMonth >= month)) {
                    prev = false;
                }

                if (isMaxYear && (month === 11 || opts.maxMonth <= month)) {
                    next = false;
                }

                if (c === 0) {
                    html += '<button class="pika-prev' + (prev ? '' : ' is-disabled') + '" type="button">' + opts.i18n.previousMonth + '</button>';
                }
                if (c === (instance._o.numberOfMonths - 1)) {
                    html += '<button class="pika-next' + (next ? '' : ' is-disabled') + '" type="button">' + opts.i18n.nextMonth + '</button>';
                }

                return html += '</div>';
            },

            renderTable = function (opts, data, randId) {
                return '<table cellpadding="0" cellspacing="0" class="pika-table" role="grid" aria-labelledby="' + randId + '">' + renderHead(opts) + renderBody(data) + '</table>';
            },


            /**
             * Pikaday constructor
             */
            Pikaday = function (options) {
                var self = this,
                    opts = self.config(options);
                self._onMouseDown = function (e) {
                    if (!self._v) {
                        return;
                    }
                    e = e || window.event;
                    var target = e.target || e.srcElement;
                    if (!target) {
                        return;
                    }

                    if (!hasClass(target, 'is-disabled')) {
                        if (hasClass(target, 'pika-button') && !hasClass(target, 'is-empty') && !hasClass(target.parentNode, 'is-disabled')) {
                            self.setDate(new Date(target.getAttribute('data-pika-year'), target.getAttribute('data-pika-month'), target.getAttribute('data-pika-day')));
                            if (opts.bound) {
                                sto(function () {
                                    self.hide();
                                    if (opts.blurFieldOnSelect && opts.field) {
                                        opts.field.blur();
                                    }
                                }, 100);
                            }
                        } else if (hasClass(target, 'pika-prev')) {
                            self.prevMonth();
                        } else if (hasClass(target, 'pika-next')) {
                            self.nextMonth();
                        }
                    }
                    if (!hasClass(target, 'pika-select')) {
                        // if this is touch event prevent mouse events emulation
                        if (e.preventDefault) {
                            e.preventDefault();
                        } else {
                            e.returnValue = false;
                            return false;
                        }
                    } else {
                        self._c = true;
                    }
                };

                self._onChange = function (e) {
                    e = e || window.event;
                    var target = e.target || e.srcElement;
                    if (!target) {
                        return;
                    }
                    if (hasClass(target, 'pika-select-month')) {
                        self.gotoMonth(target.value);
                    } else if (hasClass(target, 'pika-select-year')) {
                        self.gotoYear(target.value);
                    }
                };

                self._onKeyChange = function (e) {
                    e = e || window.event;

                    if (self.isVisible()) {

                        switch (e.keyCode) {
                            case 13:
                            case 27:
                                if (opts.field) {
                                    opts.field.blur();
                                }
                                break;
                            case 37:
                                self.adjustDate('subtract', 1);
                                break;
                            case 38:
                                self.adjustDate('subtract', 7);
                                break;
                            case 39:
                                self.adjustDate('add', 1);
                                break;
                            case 40:
                                self.adjustDate('add', 7);
                                break;
                            case 8:
                            case 46:
                                self.setDate(null);
                                break;
                        }
                    }
                };

                self._parseFieldValue = function () {
                    if (opts.parse) {
                        return opts.parse(opts.field.value, opts.format);
                    } else if (hasMoment) {
                        var date = moment(opts.field.value, opts.format, opts.formatStrict);
                        return (date && date.isValid()) ? date.toDate() : null;
                    } else {
                        return new Date(Date.parse(opts.field.value));
                    }
                };

                self._onInputChange = function (e) {
                    var date;

                    if (e.firedBy === self) {
                        return;
                    }
                    date = self._parseFieldValue();
                    if (isDate(date)) {
                        self.setDate(date);
                    }
                    if (!self._v) {
                        self.show();
                    }
                };

                self._onInputFocus = function () {
                    self.show();
                };

                self._onInputClick = function () {
                    self.show();
                };

                self._onInputBlur = function () {
                    // IE allows pika div to gain focus; catch blur the input field
                    var pEl = document.activeElement;
                    do {
                        if (hasClass(pEl, 'pika-single')) {
                            return;
                        }
                    }
                    while ((pEl = pEl.parentNode));

                    if (!self._c) {
                        self._b = sto(function () {
                            self.hide();
                        }, 50);
                    }
                    self._c = false;
                };

                self._onClick = function (e) {
                    e = e || window.event;
                    var target = e.target || e.srcElement,
                        pEl = target;
                    if (!target) {
                        return;
                    }
                    if (!hasEventListeners && hasClass(target, 'pika-select')) {
                        if (!target.onchange) {
                            target.setAttribute('onchange', 'return;');
                            addEvent(target, 'change', self._onChange);
                        }
                    }
                    do {
                        if (hasClass(pEl, 'pika-single') || pEl === opts.trigger) {
                            return;
                        }
                    }
                    while ((pEl = pEl.parentNode));
                    if (self._v && target !== opts.trigger && pEl !== opts.trigger) {
                        self.hide();
                    }
                };

                self.el = document.createElement('div');
                self.el.className = 'pika-single' + (opts.isRTL ? ' is-rtl' : '') + (opts.theme ? ' ' + opts.theme : '');

                addEvent(self.el, 'mousedown', self._onMouseDown, true);
                addEvent(self.el, 'touchend', self._onMouseDown, true);
                addEvent(self.el, 'change', self._onChange);

                if (opts.keyboardInput) {
                    addEvent(document, 'keydown', self._onKeyChange);
                }

                if (opts.field) {
                    if (opts.container) {
                        opts.container.appendChild(self.el);
                    } else if (opts.bound) {
                        document.body.appendChild(self.el);
                    } else {
                        opts.field.parentNode.insertBefore(self.el, opts.field.nextSibling);
                    }
                    addEvent(opts.field, 'change', self._onInputChange);

                    if (!opts.defaultDate) {
                        opts.defaultDate = self._parseFieldValue();
                        opts.setDefaultDate = true;
                    }
                }

                var defDate = opts.defaultDate;

                if (isDate(defDate)) {
                    if (opts.setDefaultDate) {
                        self.setDate(defDate, true);
                    } else {
                        self.gotoDate(defDate);
                    }
                } else {
                    self.gotoDate(new Date());
                }

                if (opts.bound) {
                    this.hide();
                    self.el.className += ' is-bound';
                    addEvent(opts.trigger, 'click', self._onInputClick);
                    addEvent(opts.trigger, 'focus', self._onInputFocus);
                    addEvent(opts.trigger, 'blur', self._onInputBlur);
                } else {
                    this.show();
                }
            };


        /**
         * public Pikaday API
         */
        Pikaday.prototype = {


            /**
             * configure functionality
             */
            config: function (options) {
                if (!this._o) {
                    this._o = extend({}, defaults, true);
                }

                var opts = extend(this._o, options, true);

                opts.isRTL = !!opts.isRTL;

                opts.persianNumbers = !!opts.persianNumbers;

                opts.field = (opts.field && opts.field.nodeName) ? opts.field : null;

                opts.theme = (typeof opts.theme) === 'string' && opts.theme ? opts.theme : null;

                opts.bound = !!(opts.bound !== undefined ? opts.field && opts.bound : opts.field);

                opts.trigger = (opts.trigger && opts.trigger.nodeName) ? opts.trigger : opts.field;

                opts.disableWeekends = !!opts.disableWeekends;

                opts.disableDayFn = (typeof opts.disableDayFn) === 'function' ? opts.disableDayFn : null;

                var nom = parseInt(opts.numberOfMonths, 10) || 1;
                opts.numberOfMonths = nom > 4 ? 4 : nom;

                if (!isDate(opts.minDate)) {
                    opts.minDate = false;
                }
                if (!isDate(opts.maxDate)) {
                    opts.maxDate = false;
                }
                if ((opts.minDate && opts.maxDate) && opts.maxDate < opts.minDate) {
                    opts.maxDate = opts.minDate = false;
                }
                if (opts.minDate) {
                    this.setMinDate(opts.minDate);
                }
                if (opts.maxDate) {
                    this.setMaxDate(opts.maxDate);
                }

                if (isArray(opts.yearRange)) {
                    if (opts.yearRange[0] > 1500) {
                        opts.yearRange[0] = toJalaali(opts.yearRange[0], 4, 29).jy
                    }
                    if (opts.yearRange[1] > 1500) {
                        opts.yearRange[1] = toJalaali(opts.yearRange[1], 4, 29).jy
                    }
                    var fallback = new Date().getFullYear() - 10;
                    opts.yearRange[0] = parseInt(opts.yearRange[0], 10) || fallback;
                    opts.yearRange[1] = parseInt(opts.yearRange[1], 10) || fallback;
                } else {
                    opts.yearRange = Math.abs(parseInt(opts.yearRange, 10)) || defaults.yearRange;
                    if (opts.yearRange > 100) {
                        opts.yearRange = 100;
                    }
                }

                return opts;
            },

            /**
             * return a formatted string of the current selection (using Moment.js if available)
             */
            toString: function (format) {
                format = format || this._o.format;
                if (!isDate(this._d)) {
                    return '';
                }
                if (this._o.toString) {
                    return this._o.toString(this._d, format);
                }
                if (hasMoment) {
                    return moment(this._d._d).format(format);
                }
                return this._d.toDateString();
            },

            /**
             * return a Moment.js object of the current selection (if available)
             */
            getMoment: function () {
                return hasMoment ? moment(this._d._d) : null;
            },

            /**
             * set the current selection from a Moment.js object (if available)
             */
            setMoment: function (date, preventOnSelect) {
                if (hasMoment && moment.isMoment(date)) {
                    this.setDate(new Date(date.toDate()), preventOnSelect);
                }
            },

            /**
             * return a Date object of the current selection
             */
            getDate: function () {
                return isDate(this._d) ? new Date(this._d.getTime()) : null;
            },

            /**
             * set the current selection
             */
            setDate: function (date, preventOnSelect) {
                if (!date) {
                    this._d = null;

                    if (this._o.field) {
                        this._o.field.value = '';
                        fireEvent(this._o.field, 'change', {
                            firedBy: this
                        });
                    }

                    return this.draw();
                }
                if (typeof date === 'string') {
                    date = new Date(Date.parse(date));
                }
                if (!isDate(date)) {
                    return;
                }

                var min = this._o.minDate,
                    max = this._o.maxDate;

                if (isDate(min) && date < min) {
                    date = min;
                } else if (isDate(max) && date > max) {
                    date = max;
                }
                this._d = new Date(date.getTime());

                setToStartOfDay(this._d);
                this.gotoDate(this._d);
                if (this._o.field) {
                    this._o.field.value = this.toString();
                    fireEvent(this._o.field, 'change', {
                        firedBy: this
                    });
                }
                if (!preventOnSelect && typeof this._o.onSelect === 'function') {
                    this._o.onSelect.call(this, this.getDate());
                }
            },

            /**
             * clear and reset the date
             */
            clear: function () {
                this.setDate(null);
            },

            /**
             * change view to a specific date
             */
            gotoDate: function (date) {
                var newCalendar = true;

                if (!isDate(date)) {
                    return;
                }

                if (this.calendars) {
                    var firstVisibleDate = new Date(this.calendars[0].year, this.calendars[0].month, 1),
                        lastVisibleDate = new Date(this.calendars[this.calendars.length - 1].year, this.calendars[this.calendars.length - 1].month, 1),
                        visibleDate = date.getTime();
                    // get the end of the month
                    lastVisibleDate.setMonth(lastVisibleDate.getMonth() + 1);
                    lastVisibleDate.setDate(lastVisibleDate.getDate() - 1);
                    newCalendar = (visibleDate < firstVisibleDate.getTime() || lastVisibleDate.getTime() < visibleDate);
                }

                if (newCalendar) {
                    this.calendars = [{
                        month: date.getMonth(),
                        year: date.getFullYear()
                    }];
                    if (this._o.mainCalendar === 'right') {
                        this.calendars[0].month += 1 - this._o.numberOfMonths;
                    }
                }

                this.adjustCalendars();
            },

            adjustDate: function (sign, days) {

                var day = this.getDate() || new Date();
                var difference = parseInt(days) * 24 * 60 * 60 * 1000;

                var newDay;

                if (sign === 'add') {
                    newDay = new Date(day.valueOf() + difference);
                } else if (sign === 'subtract') {
                    newDay = new Date(day.valueOf() - difference);
                }

                this.setDate(newDay);
            },

            adjustCalendars: function () {
                this.calendars[0] = adjustCalendar(this.calendars[0]);
                for (var c = 1; c < this._o.numberOfMonths; c++) {
                    this.calendars[c] = adjustCalendar({
                        month: this.calendars[0].month + c,
                        year: this.calendars[0].year
                    });
                }
                this.draw();
            },

            gotoToday: function () {
                this.gotoDate(new Date());
            },

            /**
             * change view to a specific month (zero-index, e.g. 0: January)
             */
            gotoMonth: function (month) {
                if (!isNaN(month)) {
                    this.calendars[0].month = parseInt(month, 10);
                    this.adjustCalendars();
                }
            },

            nextMonth: function () {
                this.calendars[0].month++;
                this.adjustCalendars();
            },

            prevMonth: function () {
                this.calendars[0].month--;
                this.adjustCalendars();
            },

            /**
             * change view to a specific full year (e.g. "2012")
             */
            gotoYear: function (year) {
                if (!isNaN(year)) {
                    this.calendars[0].year = parseInt(year, 10);
                    this.adjustCalendars();
                }
            },

            /**
             * change the minDate
             */
            setMinDate: function (value) {
                if (value instanceof oDate) {
                    value = Date(value);
                }
                if (value instanceof Date) {
                    setToStartOfDay(value);
                    this._o.minDate = value;
                    this._o.minYear = value.getFullYear();
                    this._o.minMonth = value.getMonth();
                } else {
                    this._o.minDate = defaults.minDate;
                    this._o.minYear = defaults.minYear;
                    this._o.minMonth = defaults.minMonth;
                    this._o.startRange = defaults.startRange;
                }

                this.draw();
            },

            /**
             * change the maxDate
             */
            setMaxDate: function (value) {
                if (value instanceof oDate) {
                    setToStartOfDay(value);
                    this._o.maxDate = value;
                    this._o.maxYear = value.getFullYear();
                    this._o.maxMonth = value.getMonth();
                } else {
                    this._o.maxDate = defaults.maxDate;
                    this._o.maxYear = defaults.maxYear;
                    this._o.maxMonth = defaults.maxMonth;
                    this._o.endRange = defaults.endRange;
                }

                this.draw();
            },

            setStartRange: function (value) {
                this._o.startRange = value;
            },

            setEndRange: function (value) {
                this._o.endRange = value;
            },

            /**
             * refresh the HTML
             */
            draw: function (force) {
                if (!this._v && !force) {
                    return;
                }
                var opts = this._o,
                    minYear = opts.minYear,
                    maxYear = opts.maxYear,
                    minMonth = opts.minMonth,
                    maxMonth = opts.maxMonth,
                    html = '',
                    randId;

                if (this._y <= minYear) {
                    this._y = minYear;
                    if (!isNaN(minMonth) && this._m < minMonth) {
                        this._m = minMonth;
                    }
                }
                if (this._y >= maxYear) {
                    this._y = maxYear;
                    if (!isNaN(maxMonth) && this._m > maxMonth) {
                        this._m = maxMonth;
                    }
                }

                for (var c = 0; c < opts.numberOfMonths; c++) {
                    randId = 'pika-title-' + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 2);
                    html += '<div class="pika-lendar">' + renderTitle(this, c, this.calendars[c].year, this.calendars[c].month, this.calendars[0].year, randId) + this.render(this.calendars[c].year, this.calendars[c].month, randId) + '</div>';
                }

                this.el.innerHTML = html;

                if (opts.bound) {
                    if (opts.field.type !== 'hidden') {
                        sto(function () {
                            opts.trigger.focus();
                        }, 1);
                    }
                }

                if (typeof this._o.onDraw === 'function') {
                    this._o.onDraw(this);
                }

                if (opts.bound) {
                    // let the screen reader user know to use arrow keys
                    opts.field.setAttribute('aria-label', opts.ariaLabel);
                }
            },

            adjustPosition: function () {
                var field, pEl, width, height, viewportWidth, viewportHeight, scrollTop, left, top, clientRect, leftAligned, bottomAligned;

                if (this._o.container) return;

                this.el.style.position = 'absolute';

                field = this._o.trigger;
                pEl = field;
                width = this.el.offsetWidth;
                height = this.el.offsetHeight;
                viewportWidth = window.innerWidth || document.documentElement.clientWidth;
                viewportHeight = window.innerHeight || document.documentElement.clientHeight;
                scrollTop = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
                leftAligned = true;
                bottomAligned = true;

                if (typeof field.getBoundingClientRect === 'function') {
                    clientRect = field.getBoundingClientRect();
                    left = clientRect.left + window.pageXOffset;
                    top = clientRect.bottom + window.pageYOffset;
                } else {
                    left = pEl.offsetLeft;
                    top = pEl.offsetTop + pEl.offsetHeight;
                    while ((pEl = pEl.offsetParent)) {
                        left += pEl.offsetLeft;
                        top += pEl.offsetTop;
                    }
                }

                // default position is bottom & left
                if ((this._o.reposition && left + width > viewportWidth) ||
                    (
                        this._o.position.indexOf('right') > -1 &&
                        left - width + field.offsetWidth > 0
                    )
                ) {
                    left = left - width + field.offsetWidth;
                    leftAligned = false;
                }
                if ((this._o.reposition && top + height > viewportHeight + scrollTop) ||
                    (
                        this._o.position.indexOf('top') > -1 &&
                        top - height - field.offsetHeight > 0
                    )
                ) {
                    top = top - height - field.offsetHeight;
                    bottomAligned = false;
                }

                this.el.style.left = left + 'px';
                this.el.style.top = top + 'px';

                addClass(this.el, leftAligned ? 'left-aligned' : 'right-aligned');
                addClass(this.el, bottomAligned ? 'bottom-aligned' : 'top-aligned');
                removeClass(this.el, !leftAligned ? 'left-aligned' : 'right-aligned');
                removeClass(this.el, !bottomAligned ? 'bottom-aligned' : 'top-aligned');
            },

            /**
             * render HTML for a particular month
             */
            render: function (year, month, randId) {
                var opts = this._o,
                    now = new Date(),
                    days = getDaysInMonth(year, month),
                    before = new Date(year, month, 1).getDay(),
                    data = [],
                    row = [];
                setToStartOfDay(now);
                if (opts.firstDay > 0) {
                    before -= opts.firstDay;
                    if (before < 0) {
                        before += 7;
                    }
                }
                var previousMonth = month === 0 ? 11 : month - 1,
                    nextMonth = month === 11 ? 0 : month + 1,
                    yearOfPreviousMonth = month === 0 ? year - 1 : year,
                    yearOfNextMonth = month === 11 ? year + 1 : year,
                    daysInPreviousMonth = getDaysInMonth(yearOfPreviousMonth, previousMonth);
                var cells = days + before,
                    after = cells;
                while (after > 7) {
                    after -= 7;
                }
                cells += 7 - after;
                var isWeekSelected = false;
                for (var i = 0, r = 0; i < cells; i++) {
                    var day = new Date(year, month, 1 + (i - before)),
                        isSelected = isDate(this._d) ? compareDates(day, this._d) : false,
                        isToday = compareDates(day, now),
                        hasEvent = opts.events.indexOf(day.toDateString()) !== -1 ? true : false,
                        isEmpty = i < before || i >= (days + before),
                        dayNumber = 1 + (i - before),
                        monthNumber = month,
                        yearNumber = year,
                        isStartRange = opts.startRange && compareDates(opts.startRange, day),
                        isEndRange = opts.endRange && compareDates(opts.endRange, day),
                        isInRange = opts.startRange && opts.endRange && opts.startRange < day && day < opts.endRange,
                        isDisabled = (opts.minDate && day < opts.minDate) ||
                        (opts.maxDate && day > opts.maxDate) ||
                        (opts.disableWeekends && isWeekend(day)) ||
                        (opts.disableDayFn && opts.disableDayFn(day));

                    if (isEmpty) {
                        if (i < before) {
                            dayNumber = daysInPreviousMonth + dayNumber;
                            monthNumber = previousMonth;
                            yearNumber = yearOfPreviousMonth;
                        } else {
                            dayNumber = dayNumber - days;
                            monthNumber = nextMonth;
                            yearNumber = yearOfNextMonth;
                        }
                    }

                    var dayConfig = {
                        day: dayNumber,
                        month: monthNumber,
                        year: yearNumber,
                        hasEvent: hasEvent,
                        isSelected: isSelected,
                        isToday: isToday,
                        isDisabled: isDisabled,
                        isEmpty: isEmpty,
                        isStartRange: isStartRange,
                        isEndRange: isEndRange,
                        isInRange: isInRange,
                        showDaysInNextAndPreviousMonths: opts.showDaysInNextAndPreviousMonths,
                        enableSelectionDaysInNextAndPreviousMonths: opts.enableSelectionDaysInNextAndPreviousMonths
                    };

                    if (opts.pickWholeWeek && isSelected) {
                        isWeekSelected = true;
                    }

                    row.push(renderDay(dayConfig));

                    if (++r === 7) {
                        if (opts.showWeekNumber) {
                            row.unshift(renderWeek(i - before, month, year, opts.persianNumbers));
                        }
                        data.push(renderRow(row, opts.isRTL, opts.pickWholeWeek, isWeekSelected));
                        row = [];
                        r = 0;
                        isWeekSelected = false;
                    }
                }
                return renderTable(opts, data, randId);
            },

            isVisible: function () {
                return this._v;
            },

            show: function () {
                if (!this.isVisible()) {
                    this._v = true;
                    this.draw();
                    removeClass(this.el, 'is-hidden');
                    if (this._o.bound) {
                        addEvent(document, 'click', this._onClick);
                        this.adjustPosition();
                    }
                    if (typeof this._o.onOpen === 'function') {
                        this._o.onOpen.call(this);
                    }
                }
            },

            hide: function () {
                var v = this._v;
                if (v !== false) {
                    if (this._o.bound) {
                        removeEvent(document, 'click', this._onClick);
                    }
                    this.el.style.position = 'static'; // reset
                    this.el.style.left = 'auto';
                    this.el.style.top = 'auto';
                    addClass(this.el, 'is-hidden');
                    this._v = false;
                    if (v !== undefined && typeof this._o.onClose === 'function') {
                        this._o.onClose.call(this);
                    }
                }
            },

            /**
             * GAME OVER
             */
            destroy: function () {
                var opts = this._o;

                this.hide();
                removeEvent(this.el, 'mousedown', this._onMouseDown, true);
                removeEvent(this.el, 'touchend', this._onMouseDown, true);
                removeEvent(this.el, 'change', this._onChange);
                if (opts.keyboardInput) {
                    removeEvent(document, 'keydown', this._onKeyChange);
                }
                if (opts.field) {
                    removeEvent(opts.field, 'change', this._onInputChange);
                    if (opts.bound) {
                        removeEvent(opts.trigger, 'click', this._onInputClick);
                        removeEvent(opts.trigger, 'focus', this._onInputFocus);
                        removeEvent(opts.trigger, 'blur', this._onInputBlur);
                    }
                }
                if (this.el.parentNode) {
                    this.el.parentNode.removeChild(this.el);
                }
            }

        };

        return Pikaday;
    }(JDate, Date)
}));



/*!
 * Pikaday jQuery plugin.
 *
 * Copyright © 2013 David Bushell | BSD & MIT license | https://github.com/Pikaday/Pikaday
 */

(function (root, factory) {
    'use strict';

    if (typeof exports === 'object') {
        // CommonJS module
        factory(require('jquery'), require('pikaday'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', 'pikaday'], factory);
    } else {
        // Browser globals
        factory(root.jQuery, root.Pikaday);
    }
}(this, function ($, Pikaday) {
    'use strict';

    $.fn.pikaday = function () {
        var args = arguments;

        if (!args || !args.length) {
            args = [{}];
        }

        return this.each(function () {
            var self = $(this),
                plugin = self.data('pikaday');

            if (!(plugin instanceof Pikaday)) {
                if (typeof args[0] === 'object') {
                    var options = $.extend({}, args[0]);
                    options.field = self[0];
                    self.data('pikaday', new Pikaday(options));
                }
            } else {
                if (typeof args[0] === 'string' && typeof plugin[args[0]] === 'function') {
                    plugin[args[0]].apply(plugin, Array.prototype.slice.call(args, 1));

                    if (args[0] === 'destroy') {
                        self.removeData('pikaday');
                    }
                }
            }
        });
    };

}));
