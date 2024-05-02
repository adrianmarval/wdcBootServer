const fs = require('fs');
const {red, green, yellow, cyan} = require('colors');

class Logger {
  constructor() {}

  _checkFile() {
    if (!fs.existsSync('database/logs.txt')) {
      fs.writeFileSync('database/logs.txt', '');
    }
  }

  _write(text) {
    this._checkFile();
    fs.appendFileSync('database/logs.txt', '\n' + text);
  }

  _formatDate(date) {
    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(
      date.getMinutes()
    )}:${pad(date.getSeconds())}`;
  }

  log(text, phone) {
    const formattedDate = this._formatDate(new Date());
    let completeLog = `[INFO] ${phone ? `phone:${phone} ` : ''}${formattedDate} ${text}`;

    this._write(completeLog);
    console.log(cyan(completeLog));
  }

  success(text, phone) {
    const formattedDate = this._formatDate(new Date());
    let completeLog = `[SUCCESS] ${phone ? `phone:${phone} ` : ''}${formattedDate} ${text}`;

    this._write(completeLog);
    console.log(green(completeLog));
  }

  warn(text, phone) {
    const formattedDate = this._formatDate(new Date());
    let completeLog = `[WARN] ${phone ? `phone:${phone} ` : ''}${formattedDate} ${text}`;

    this._write(completeLog);
    console.warn(yellow(completeLog));
  }

  error(text, phone) {
    const formattedDate = this._formatDate(new Date());
    let completeLog = `[ERROR] ${phone ? `phone:${phone} ` : ''}${formattedDate} ${text}`;

    this._write(completeLog);
    console.error(red(completeLog));
  }
}
const logger = new Logger();

module.exports = logger;
