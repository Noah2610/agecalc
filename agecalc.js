/**
 * @typedef {object} Age
 * @prop {number} years
 * @prop {number} days
 * @prop {number} hours
 * @prop {number} minutes
 * @prop {number} seconds
 */

function parseDate(input) {
    const parseInput = (input) => {
        try {
            const [y, m, d, ...time] = parseYearMonthDay(input);
            return new Date(y, m - 1, d, ...time);
        } catch (_) {
            return new Date(input);
        }
    };

    const parseYearMonthDay = (input) => {
        const patterns = [
            // /(\d+)-(\d+)-(\d+)/,
            // /(\d+)\.(\d+)\.(\d+)/,
            /(\d+)[^\d]+(\d+)[^\d]+(\d+)[^\d]+(\d+)[^\d]+(\d+)[^\d]+(\d+)/,
            /(\d+)[^\d]+(\d+)[^\d]+(\d+)[^\d]+(\d+)[^\d]+(\d+)/,
            /(\d+)[^\d]+(\d+)[^\d]+(\d+)[^\d]+(\d+)/,
            /(\d+)[^\d]+(\d+)[^\d]+(\d+)/,
            /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
            /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/,
            /(\d{4})(\d{2})(\d{2})(\d{2})/,
            /(\d{4})(\d{2})(\d{2})/,
        ];

        for (const pattern of patterns) {
            const match = input.match(pattern);
            if (match) {
                return match.slice(1);
            }
        }

        throw "Invalid input";
    };

    const date = parseInput(input);
    if (!isDateValid(date)) {
        throw `Invalid date: ${input}`;
    }
    return date;
}

/** @param {Date} date */
function isDateValid(date) {
    return (
        typeof date === "object" &&
        date.constructor.name === "Date" &&
        !Number.isNaN(date.getTime())
    );
}

/** @param {Date} date */
function fmtDate(date) {
    /** @param {number} n */
    const pad = (n) => n.toString().padStart(2, "0");

    const dateS = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
        .map(pad)
        .join("-");

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    if (hours !== 0 || minutes !== 0 || seconds !== 0) {
        const timeS = [hours, minutes, seconds].map(pad).join(":");
        return `${dateS} ${timeS}`;
    }

    return dateS;
}

/** @param {Age} age */
function fmtAge(age) {
    /** @type {(keyof Age)[]} */
    const UNITS = ["years", "days", "hours", "minutes", "seconds"];

    /**
     * @param {string} unit
     * @param {number} value
     */
    const fmtNumPlurality = (unit, value) =>
        value === 1 ? unit.replace(/s$/, "") : unit;

    const result = [];

    for (const unit of UNITS) {
        const value = age[unit];
        if (value !== 0) {
            result.push(`${value} ${fmtNumPlurality(unit, value)}`);
        }
    }

    return result.join(", ");
}

/**
 * @param {Date} bday
 * @returns {Age}
 */
function getAgeFromBirthday(bday) {
    /** @param {number} milliseconds */
    const getAgeFromMs = (milliseconds) => {
        // const MS_PER_YEAR = 1000 * 60 * 60 * 24 * 365.2425;
        // return ms / MS_PER_YEAR;

        const DAYS_PER_YEAR = 365.2425;

        let seconds = Math.floor(milliseconds / 1000);
        milliseconds -= seconds * 1000;
        let minutes = Math.floor(seconds / 60);
        seconds -= minutes * 60;
        let hours = Math.floor(minutes / 60);
        minutes -= hours * 60;
        let days = Math.floor(hours / 24);
        hours -= days * 24;
        let years = Math.floor(days / DAYS_PER_YEAR);
        days -= Math.ceil(years * DAYS_PER_YEAR);
        return { years, days, hours, minutes, seconds };
    };

    const now = new Date();
    const diff = now.getTime() - bday.getTime();
    return getAgeFromMs(diff);
}

/** @param {string} arg */
function main(arg) {
    try {
        const bday = parseDate(arg);
        const age = getAgeFromBirthday(bday);

        console.log(
            [`Birthday: ${fmtDate(bday)}`, `Age: ${fmtAge(age)}`].join("\n"),
        );
    } catch (err) {
        console.error(`[Error]\n${err}`);
        process.exit(1);
    }
}

function getInputArg() {
    return process.argv.slice(2).join(" ").trim();
}

const arg = getInputArg();
if (arg === "test") {
    runTests();
} else {
    main(arg);
}

function runTests() {
    /**
     * @param {Date} actual
     * @param {Date} expected
     */
    function cmpDates(actual, expected) {
        if (actual.getTime() !== expected.getTime()) {
            throw `Dates are not equal: Expected ${fmtDate(
                actual,
            )} to equal ${fmtDate(expected)}`;
        }
    }

    function testParseValidDatesWithDashDelimiter() {
        cmpDates(parseDate("1999-01-01"), new Date(1999, 0, 1));
        cmpDates(parseDate("2020-12-31"), new Date(2020, 11, 31));
        cmpDates(parseDate("2019-04-20"), new Date(2019, 3, 20));
    }

    function testParseValidDatesWithDotDelimiter() {
        cmpDates(parseDate("1999.01.01"), new Date(1999, 0, 1));
        cmpDates(parseDate("2020.12.31"), new Date(2020, 11, 31));
        cmpDates(parseDate("2019.04.20"), new Date(2019, 3, 20));
    }

    function testParseValidDatesWithSpaceDelimiter() {
        cmpDates(parseDate("1999 01 01"), new Date(1999, 0, 1));
        cmpDates(parseDate("2020 12 31"), new Date(2020, 11, 31));
        cmpDates(parseDate("2019 04 20"), new Date(2019, 3, 20));
    }

    function testParseValidDatesWithMixedDelimiter() {
        cmpDates(parseDate("1999-01.01"), new Date(1999, 0, 1));
        cmpDates(parseDate("2020   12abc31"), new Date(2020, 11, 31));
        cmpDates(parseDate("2019.-?04!lmao?!-*()20"), new Date(2019, 3, 20));
    }

    function testParseValidDatesWithNoDelimiter() {
        parseDate("19990101");
        parseDate("20201231");
        parseDate("20190420");
    }

    function testInvalidDate() {
        const input = "LMAO";
        try {
            parseDate(input);
        } catch (_) {
            return;
        }
        throw `Expected test to fail with date: ${input}`;
    }

    const tests = [
        testParseValidDatesWithDashDelimiter,
        testParseValidDatesWithDotDelimiter,
        testParseValidDatesWithSpaceDelimiter,
        testParseValidDatesWithMixedDelimiter,
        testParseValidDatesWithNoDelimiter,
        testInvalidDate,
    ];

    let testFn;
    let testsCount = 0;
    let passedTestsCount = 0;
    let didPass = true;

    for (testFn of tests) {
        testsCount++;
        try {
            testFn();
            passedTestsCount++;
        } catch (e) {
            didPass = false;
            console.error(`[Failed test] ${testFn.name}\n${e}`);
        }
    }

    if (didPass) {
        console.log(`${passedTestsCount} tests passed!`);
        process.exit(0);
    } else {
        console.error(
            `${
                testsCount - passedTestsCount
            } failed tests of ${testsCount} total`,
        );
        process.exit(1);
    }
}
