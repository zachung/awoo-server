import { createLogger, format, transports } from 'winston'
import chalk from 'chalk'

const { combine, timestamp, label, printf } = format

const myFormat = printf(({ level, message, label, timestamp }) => {
  let colors = {
    'debug': chalk.green,
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

export default logger
