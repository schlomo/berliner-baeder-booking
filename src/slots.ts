import { AvailableSlot } from './availableslot'
import { Browser } from './browser'
import { Pools } from './pools'

export async function listSlots({ args, options, logger }) {
    const slots = await getAvailableSlots(args.pool, options.v)
    if (Object.keys(slots).length > 0) {
        const entries = slots.map(slot => slot.toString())
        console.log(`Available slots:\n${entries.join('\n')}`)
    } else {
        logger.error(`No slots available for ${args.pool}`)
    }
    return
}

export async function getAvailableSlots(pool: string, verbose: boolean = false): Promise<AvailableSlot[]> {
    const browser = await Browser.getBrowser()
    var poolUrl: string
    if (pool.startsWith("https://")) {
        console.log(`Using provided Pretix URL ${pool}`)
        poolUrl = pool
    } else {
        poolUrl = (await Pools.build(verbose)).getUrlForPool(pool)
    }

    const page = await browser.newPage()
    if (verbose) page.on('console', (msg) => console.log('PAGE LOG:', msg.text()))

    await page.goto(poolUrl)

    const results = await page.$$eval(".available > .event-time", handles => {
        const baseURI = document.baseURI
        return handles.map(eventEntry => {
            const
                ISODateTime = eventEntry.getAttribute("data-time"),
                timeZone = eventEntry.getAttribute("data-timezone"),
                [startTime, endTime] = Array.from(eventEntry.querySelectorAll("time")).map(timeEntry => timeEntry.dateTime)
            //debugger
            return {
                ISODateTime: ISODateTime,
                startTime: startTime,
                endTime: endTime,
                timeZone: timeZone,
                href: new URL(eventEntry.parentElement.getAttribute("href"), baseURI).toString()
            }
        })
    }).then(results => {
        return results.map(result => new AvailableSlot(result))
    })
    await page.close()
    if (verbose) console.log(results)
    return results
}
