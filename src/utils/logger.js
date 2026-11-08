const colors = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m"
};

class Logger {
  static info(message) {
    console.log(`${colors.cyan}[HiRes-Addon INFO]${colors.reset} ${message}`);
  }

  static success(message) {
    console.log(`${colors.green}[HiRes-Addon SUCCESS]${colors.reset} ${message}`);
  }

  static warn(message) {
    console.warn(`${colors.yellow}[HiRes-Addon WARN]${colors.reset} ${message}`);
  }

  static error(message, err = "") {
    console.error(`${colors.red}[HiRes-Addon ERROR]${colors.reset} ${message}`, err);
  }
}

module.exports = Logger;