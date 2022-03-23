import { DateTime } from "luxon"
import * as chrono from 'chrono-node'

import { emptyDirSync } from 'fs-extra'

import { Browser } from "./browser"
import { config } from "./config"
import { getAvailableSlots } from "./slots"

export async function bookSlotAsap({ args, options, logger }) {
    return getAvailableSlots(args.pool, options.v)
        .then(slots => {
            if (slots.length > 0) {
                // book slot
                return performBooking(slots[0].href, args.email, args.amount, options.v)
            } else {
                throw new Error('No slots available')
            }
        })
}

export async function bookSlot({ args, options, logger }) {
    const parsed = chrono.de.parseDate(args.date + " " + args.time, new Date(), { forwardDate: true })
    if (!parsed) throw new Error(`Could not understand »${args.date} ${args.time}« as relative or absolute date/time`)

    const whenDt = DateTime.fromJSDate(new Date(parsed)).setZone("Europe/Berlin").setLocale("de-DE")
    console.log(`Booking slot for ${formatDt(whenDt)}`)

    let now = nowDt()
    while (now < whenDt) {
        const slots = await getAvailableSlots(args.pool, options.v)
        const matchingSlots = slots.filter(slot => slot.isDtInSlot(whenDt))
        console.log(`Found ${slots.length > 0 ? slots.length : 'no'} slot${slots.length == 1 ? '' : 's'} at ${formatDt(now)}:\n${slots.join('\n')}`)
        if (matchingSlots.length > 0) {
            if (matchingSlots.length > 1) console.log(`Using first of ${matchingSlots.length} available slots: ${matchingSlots[0]
}`)
            return performBooking(matchingSlots[0].href, args.email, args.amount, options.v)
        } else {
            // can book 4 days before start of time slot
            // add 2h 30m to cover time slot and make sure that we stop waiting before the slot becomes available
            const earliestBookingDt = whenDt.minus({ days: 4, hours: 2, minutes: 30 })
            if (now < earliestBookingDt) {
                // sleep till it's time to check for available slots
                const waitSeconds = Math.floor(earliestBookingDt.diff(now).as("seconds"))
                console.log(`Sleeping till ${formatDt(earliestBookingDt)}`)
                await sleepSeconds(waitSeconds)
            } else {
                // probe every minute for available slots
                await sleepSeconds(60)
            }
        }
        now = nowDt()
    }
    throw new Error("Sorry, couldn't find anything")
}

export async function testBooking({ args, options, logger }) {
    return performBooking("https://pretix.eu/Baeder/26/2504572/", "hello", 2)
}

async function performBooking(url: string, email: string, amountToBook: number, verbose: boolean = false): Promise<void> {
    console.log(`Booking ${amountToBook} tickets for ${email} at ${url}`)
    const browser = await Browser.getBrowser()
    try {

        const page = await browser.newPage()
        page.setViewport({
            width: 1000,
            height: 2000,
            deviceScaleFactor: 1,
        })
        if (verbose) page.on('console', (msg) => console.log('PAGE LOG:', msg.text()))

        let amountBooked = 0, screenshotCounter = 0

        emptyDirSync(config.SCREENSHOTS)

        while (amountBooked < amountToBook) {
            // we can only book up to 2 tickets per session
            const sessionAmount = amountToBook - amountBooked > 2 ? 2 : amountToBook - amountBooked
            
            await page.goto(url)

            await page.screenshot({ path: screenshotPath(screenshotCounter++, "offer") })
            // enter amount and add to cart
            try {
                await page.type("input.form-control.input-item-count", sessionAmount.toString())
                amountBooked+=sessionAmount
            } catch (e) {
                console.dir(e.msg)
                console.log("trying single ticket")
                try {
                    await page.click('input[aria-label*="BäderCard"]')
                    amountBooked++
                } catch (e) {
                    console.error(e)
                    throw new Error("Couldn't event book a single ticket")
                }
            }
            await page.waitForSelector("#btn-add-to-cart")
            await page.screenshot({ path: screenshotPath(screenshotCounter++, "offer-selected") })
            await page.click("#btn-add-to-cart")

            // continue to checkout
            try {
                await page.waitForSelector("form.checkout-button-primary button")
            } catch (e) {
                console.log(e)
                throw new Error("Could not book desired amount: " + amountToBook)
            }
            await page.screenshot({ path: screenshotPath(screenshotCounter++, "cart") })
            await page.click("form.checkout-button-primary button")

            // optionally add extra infant tickets (not implemented)
            await page.waitForSelector("form button")
            await page.screenshot({ path: screenshotPath(screenshotCounter++, "add-optional") })
            await page.$eval("form", (el: HTMLFormElement) => el.submit())

            // select continue as guest
            await page.waitForSelector("#input_customer_guest")
            await page.click("#input_customer_guest")
            await page.waitForSelector("form button")
            await page.screenshot({ path: screenshotPath(screenshotCounter++, "continue-as-guest") })
            await page.$eval("form", (el: HTMLFormElement) => el.submit())

            // enter email twice and use it for given / family name
            await page.waitForSelector("#id_email")
            await page.type("#id_email", email)
            await page.type("#id_email_repeat", email)
            await page.waitForSelector("form button")
            await page.screenshot({ path: screenshotPath(screenshotCounter++, "enter-email") })
            await page.$eval("form", (el: HTMLFormElement) => el.submit())

            // review order & confirm COVID
            try {
                await page.waitForSelector("#input_confirm_confirm_text_0")
            } catch (e) {
                console.error(e)
                await page.screenshot({ path: screenshotPath(screenshotCounter++, "error") })
                throw new Error("failed")
            }
            await page.click("#input_confirm_confirm_text_0")
            await page.waitForSelector("form button")
            await page.screenshot({ path: screenshotPath(screenshotCounter++, "review-confirm") })
            await page.$eval("form", (el: HTMLFormElement) => el.submit())

            // wait for confirmation
            await page.waitForSelector(".panel-cancellation a")
            console.log(`Booked ${sessionAmount} tickets: ${page.url()}`)
            await page.screenshot({ path: screenshotPath(screenshotCounter++, "completed") })

            // add 10 to the base of the screenshot counter
            screenshotCounter = Math.floor(screenshotCounter/10) + 10
        }
    } catch (error) {
        console.error(error)
    }
}

function nowDt(): DateTime {
    return DateTime.now().setZone("Europe/Berlin").setLocale("de-DE")
}

function formatDt(dt: DateTime): string {
    return dt.toLocaleString(config.DT_LOCALE_STRING_OPTIONS)
}

function sleepSeconds(seconds: number) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000))
}

function screenshotPath(counter: number, name: string) {
    return `${config.SCREENSHOTS}/${counter.toString().padStart(2, "0")}-${name}.png`
}