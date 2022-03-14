#!/usr/bin/env node

import { program } from '@caporal/core'

import * as pkg from '../package.json'
import { Browser } from './browser'
import { listSlots } from './slots'
import { listPools } from './pools'
import { bookSlot, testBooking } from './book'
import { config } from './config'

program
    .name(pkg.name)
    .description(pkg.description)
    .version(pkg.version)
    .bin(Object.keys(pkg.bin)[0])

    .command("pools", "List pools and courses")
    .default()
    .action(listPools)

    .command("slots", "List available time slots for a pool")
    .argument("<pool>", "Specify the pool by (partial) name or full booking URL", { validator: program.STRING })
    .action(listSlots)

    .command("book", "Book a slot")
    .argument("<pool>", "Specify the pool by (partial) name or full booking URL", { validator: program.STRING })
    .argument("<when>", "Date and time in German to book\n'sofort' for first available slot", { validator: program.STRING })
    .argument("<email>", "Email to send confirmation to", { validator: config.EMAIL_REGEX })
    .argument("[amount]", "Amount of tickets to order", { default: 1, validator: program.NUMBER })
    .action(bookSlot)

    .command("test", "Test")
    .action(testBooking)


program.run()
    .finally(() => {
        Browser.closeBrowser()
    })


