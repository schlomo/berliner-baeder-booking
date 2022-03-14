export const config = {
    HEADLESS: true,
    PRETIX_BAEDER_URL: 'https://pretix.eu/Baeder/',
    SLOT_DURATION: 120, // minutes
    DT_LOCALE_STRING_OPTIONS: Object({ weekday: 'short', year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    EMAIL_REGEX: new RegExp(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
}