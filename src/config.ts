export const config = {
    HEADLESS: true,
    PRETIX_BAEDER_URL: 'https://pretix.eu/Baeder/',
    DT_LOCALE_STRING_OPTIONS: Object({ weekday: 'short', year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    EMAIL_REGEX: new RegExp(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/),
    SCREENSHOTS: "screenshots",
    HELP_EXAMPLES: `
Examples:
asap "Mariendorf (" your@email.domain
book lankwitz Donnerstag 17:00 your@email.domain 5
    `

}