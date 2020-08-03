import { createLogger, format, transports, config, info } from 'winston'
import chalk from 'chalk'

const { combine, timestamp, label, printf } = format
const { npm: { levels } } = config

const myFormat = printf(({ level, message, label, timestamp }) => {
  let colors = {
    'info': chalk.blue,
    'error': chalk.red
  }
  const s = `${level}: ${message}`
  return `${timestamp} [${label}] ${colors[level](s)}`
})

const logger = createLogger({
  format: combine(
    label({ label: chalk.yellow('System') }),
    timestamp(),
    myFormat
  ),
  transports: [
    new transports.Console({
      handleExceptions: true
    })
  ],
  exitOnError: false
})

const systemLogger = new Proxy({}, {
  get (target, name) {
    return logger[name]
  }
})

export default systemLogger
