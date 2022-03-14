import { DateTime } from "luxon"
import * as chrono from 'chrono-node'

import puppeteer from 'puppeteer';

import { Browser, PUPPETEER_LAUNCH_CONFIG } from "./browser"
import { config } from "./config"
import { getAvailableSlots } from "./slots"

export async function bookSlot({ args, options, logger }) {
    if (args.when.toLowerCase() == "sofort")
        return getAvailableSlots(args.pool, options.v)
            .then(slots => {
                if (slots.length > 0) {
                    // book slot
                    performBooking(slots[0].href, args.email, args.amount, options.v)
                } else {
                    throw new Error('No slots available')
                }
            })

    const parsed = chrono.de.parseDate(args.when, new Date(), { forwardDate: true })
    if (!parsed) throw new Error(`Could not understand »${args.when}« as relative or absolute date/time`)

    const whenDt = DateTime.fromJSDate(new Date(parsed)).setZone("Europe/Berlin").setLocale("de-DE")
    console.log(`Booking slot for ${formatDt(whenDt)}`)

    let now = nowDt()
    while (whenDt > now) {
        const slots = await getAvailableSlots(args.pool, options.v)
        const matchingSlots = slots.filter(slot => slot.isDtInSlot(whenDt))
        console.log(`Found ${slots.length > 0 ? slots.length : 'no'} slot${slots.length == 1 ? '' : 's'} at ${formatDt(now)}:\n${slots.join('\n')}`)
        if (matchingSlots.length > 0) {
            if (matchingSlots.length > 1) console.log(`Using first of ${matchingSlots.length} available slots`)
            return performBooking(matchingSlots[0].href, args.email, args.amount, options.v)
        } else {
            console.log("sleeping a minute")
            await sleep(60 * 1000)
        }
        now = nowDt() 
    }
    throw new Error("Sorry, couldn't find anything")
}

export async function testBooking({ args, options, logger }) {
    return performBooking("https://pretix.eu/Baeder/26/2504572/","hello",2)
}
async function performBooking(url: string, email: string, amount: number, verbose: boolean = false): Promise<void> {
    console.log(`Booking ${amount} tickets for ${email} at ${url}`)
    //const browser = await Browser.getBrowser()
    const browser = await puppeteer.launch(PUPPETEER_LAUNCH_CONFIG)
    try {
        const page = await browser.newPage()
        page.setViewport({
            width: 1000,
            height: 2000,
            deviceScaleFactor: 1,
        })
        if (verbose) page.on('console', (msg) => console.log('PAGE LOG:', msg.text()))
        await page.goto(url)

        await page.screenshot({ path: `screenshot-0-offer.png` })
        // enter amount and add to cart
        try {
            await page.type("input.form-control.input-item-count", amount.toString())
        } catch (e) {
            console.error(e)
            console.log("trying single ticket")
            try {
                await page.click('input[aria-label*="BäderCard"]')
            } catch (e) {
                console.error(e)
                throw new Error("Couldn't event book a single ticket")
            }
        }
        await page.waitForSelector("#btn-add-to-cart")
        await page.screenshot({ path: `screenshot-1-offer-selected.png` })
        await page.click("#btn-add-to-cart")

        // continue to checkout
        try {
            await page.waitForSelector("form.checkout-button-primary button")
        } catch (e) {
            console.log(e)
            throw new Error("Could not book desired amount: " + amount)
        }
        await page.screenshot({ path: `screenshot-2-cart.png` })
        await page.click("form.checkout-button-primary button")

        // optionally add extra infant tickets (not implemented)
        await page.waitForSelector("form button")
        await page.screenshot({ path: `screenshot-3-add-optional.png` })
        await page.$eval("form", (el: HTMLFormElement) => el.submit())

        // select continue as guest
        await page.waitForSelector("#input_customer_guest")
        await page.click("#input_customer_guest")
        await page.waitForSelector("form button")
        await page.screenshot({ path: `screenshot-4-continue-as-guest.png` })
        await page.$eval("form", (el: HTMLFormElement) => el.submit())

        // enter email twice and use it for given / family name
        await page.waitForSelector("#id_email")
        await page.type("#id_email", email)
        await page.type("#id_email_repeat", email)
        await page.waitForSelector("form button")
        await page.screenshot({ path: `screenshot-5-enter-email.png` })
        await page.$eval("form", (el: HTMLFormElement) => el.submit())

        // review order & confirm COVID
        try {
            await page.waitForSelector("#input_confirm_confirm_text_0")
        } catch (e) {
            console.error(e)
            await page.screenshot({ path: `screenshot-6-error.png` })
            throw new Error("failed")
        }
        await page.click("#input_confirm_confirm_text_0")
        await page.waitForSelector("form button")
        await page.screenshot({ path: `screenshot-5-review-confirm.png` })
        await page.$eval("form", (el: HTMLFormElement) => el.submit())

        // wait for confirmation
        await page.waitForSelector(".panel-cancellation a")
        console.log("Tickets booked: " + page.url())
        await page.screenshot({path:'screenshot-6-completed.png'})
    } catch (error) {
        console.error(error)
    }
    return await browser.close()
    return Browser.getBrowser()
        .then(async browser => await browser.newPage())
        .then(async (page) => {
            if (this.verbose) page.on('console', (msg) => console.log('PAGE LOG:', msg.text()))
            await page.goto(url)
            const [amountId, amountMax] = await page.$eval("input.form-control.input-item-count", el => {
                return [el.id, el.getAttribute("max")]
            })
            console.log(amountId, amountMax)
    })
}

function nowDt(): DateTime {
    return DateTime.now().setZone("Europe/Berlin").setLocale("de-DE")
}

function formatDt(dt: DateTime): string {
    return dt.toLocaleString(config.DT_LOCALE_STRING_OPTIONS)
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}