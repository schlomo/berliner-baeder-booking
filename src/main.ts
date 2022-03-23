#!/usr/bin/env node

import { program } from '@caporal/core'

import * as pkg from '../package.json'
import { Browser } from './browser'
import { listSlots } from './slots'
import { listPools } from './pools'
import { bookSlot, bookSlotAsap, testBooking } from './book'
import { config } from './config'

let VERSION = "development"
try { VERSION = require("./version").VERSION } catch { }

console.log(pkg.name + " " + VERSION)

program
    .name(pkg.name)
    .description(pkg.description)
    .version(VERSION)
    .bin(pkg.name)
    .help(config.HELP_EXAMPLES)

    .command("pools", "List pools and courses")
    .default()
    .action(listPools)

    .command("slots", "List available time slots for a pool")
    .argument("<pool>", "Specify the pool by (partial) name or full booking URL", { validator: program.STRING })
    .action(listSlots)

    .command("book", "Book a slot for specific date and time")
    .argument("<pool>", "Specify the pool by (partial) name or full booking URL", { validator: program.STRING })
    .argument("<date>", "Date in German to book, e.g. Freitag or 12.4.22", { validator: program.STRING })
    .argument("<time>", "Time in German to book, e.g. 13:10", { validator: program.STRING })
    .argument("<email>", "Email to send confirmation to", { validator: config.EMAIL_REGEX })
    .argument("[amount]", "Amount of tickets to order", { default: 1, validator: program.NUMBER })
    .action(bookSlot)

    .command("asap", "Book a slot as soon as possible")
    .argument("<pool>", "Specify the pool by (partial) name or full booking URL", { validator: program.STRING })
    .argument("<email>", "Email to send confirmation to", { validator: config.EMAIL_REGEX })
    .argument("[amount]", "Amount of tickets to order", { default: 1, validator: program.NUMBER })
    .action(bookSlotAsap)

    .command("test", "Test")
    .hide()
    .action(testBooking)


program.run()
    .finally(() => {
        Browser.closeBrowser()
    })


