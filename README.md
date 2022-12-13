# agecalc
Simple age calculator.

## Usage
Call the script with a date argument, and optionally a time.  
The input date format is: `YYYY-MM-DD`, or optionally with a time: `YYYY-MM-DD hh:mm:ss`  
The delimiters can be any non-digit character or be omitted altogether.  
Only the year number is required, all other date/time values are optional.

Examples:
```
node ./agecalc.js 1999-01-01
node ./agecalc.js 1999 01 01
node ./agecalc.js 19990101
node ./agecalc.js 1999-01-01 08:30
```
