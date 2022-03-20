
import { DateTime, Duration } from 'luxon'

import { config } from "./config"

export class AvailableSlot {
    dt: DateTime = null
    dtEnd: DateTime = null
    ISODateTime: string
    startTime: string
    endTime: string
    duration: Duration
    timeZone: string
    href: string

    constructor(data: Partial<AvailableSlot>) {
        Object.assign(this, data)
        if (!this.dt) {
            this.dt = DateTime.fromISO(this.ISODateTime).setZone(this.timeZone).setLocale("de-DE")
            const slotDuration = Duration.fromISOTime(this.endTime).minus(Duration.fromISOTime(this.startTime))
            this.dtEnd = this.dt.plus(slotDuration)
        }

    }

    public isDtInSlot(when: DateTime): boolean {
        return this.dt <= when && when <= this.dtEnd
    }

    // unused
    public toKV(): Array<string> {
        return [
            this.dt.toISO(),
            this.href
        ]
    }

    public toString(): string {
        return this.dt.toLocaleString(config.DT_LOCALE_STRING_OPTIONS) + " → " + this.dtEnd.toFormat("HH:mm")
    }

}