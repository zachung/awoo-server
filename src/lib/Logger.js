import { createLogger, format, transports, config, info } from 'winston'
import chalk from 'chalk'

const { combine, timestamp, label, printf } = format
const { npm: { levels } } = config

const myFormat = printf(({ level, message, label, timestamp }) => {
  let colors = {
    'info': chalk.blue,
  }
  const s = `${level}: ${message}`
  return `${timestamp} [${label}] ${colors[level](s)}`
})

const console = new transports.Console({
  handleExceptions: true
})
const logger = createLogger({
  format: combine(
    label({ label: chalk.yellow('System') }),
    timestamp(),
    myFormat
  ),
  transports: [
    console
  ],
  exitOnError: false
})

const systemLogger = new Proxy({}, {
  get (target, name) {
    return logger[name]
  }
})

export default systemLogger
