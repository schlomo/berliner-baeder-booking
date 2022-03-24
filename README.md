# Automated Ticket Booking for Berliner Bäder

Automate booking time slot tickets for public swimming pools in Berlin. This application will book tickets for the next available slot or a given time slot. The tickets only represent a time slot, you still need entrance tickets, which you can purchase at the entrance.

## Usage

The recommended way to use this is via the [Docker image](https://github.com/schlomo/berliner-baeder-booking/pkgs/container/berliner-baeder-booking) as it contains the latest tested version.

### Example

```bash
$ docker run --rm ghcr.io/schlomo/berliner-baeder-booking slots lankwitz
berliner-baeder-booking e477390
Using pool Stadtbad Lankwitz
Available slots:
Thu, March 24, 2022, 10:15 AM → 13:15
Thu, March 24, 2022, 01:30 PM → 16:30
Thu, March 24, 2022, 08:00 PM → 22:00
Fri, March 25, 2022, 08:00 AM → 10:00
Fri, March 25, 2022, 10:15 AM → 13:15
Fri, March 25, 2022, 01:30 PM → 16:30
Fri, March 25, 2022, 08:00 PM → 22:00
Sat, March 26, 2022, 06:45 PM → 22:00
Sun, March 27, 2022, 06:45 PM → 22:00
Mon, March 28, 2022, 08:00 AM → 10:00
```

### Installation

To make calling the tool easier I suggest to set an alias, e.g. add this to your `~/.bash_profile` or appropriate shell configuration file:

```bash
alias bbb="docker run --rm ghcr.io/schlomo/berliner-baeder-booking"
```

### Complete Help

```text
$ bbb help

  berliner-baeder-booking v1-10-g48b68a9 — Automate booking time slot tickets for public swimming pools in Berlin

  USAGE 
  
    ▸ berliner-baeder-booking <command> [ARGUMENTS...] [OPTIONS...]


  Examples:
  asap "Mariendorf (" your@email.domain
  book lankwitz Donnerstag 17:00 your@email.domain 5


  COMMANDS — Type 'berliner-baeder-booking help <command>' to get some help about a command

    pools                                List pools and courses                                 
    slots                                List available time slots for a pool                   
    book                                 Book a slot for specific date and time                 
    asap                                 Book a slot as soon as possible                        

  GLOBAL OPTIONS

    -h, --help                           Display global help or command-related help.           
    -V, --version                        Display version.                                       
    --no-color                           Disable use of colors in output.                       
    -v, --verbose                        Verbose mode: will also output debug messages.         
    --quiet                              Quiet mode - only displays warn and error messages.    
    --silent                             Silent mode: does not output anything, giving no       
                                         indication of success or failure other than the exit   
                                         code.                                                  

```

## Development

Install [NodeJS](https://nodejs.org/) version 17 and [activate yarn](https://yarnpkg.com/getting-started/install). Run `yarn` for setup, we use Yarn v3 and PNP.

Use `yarn dev` to run from source.

## Improvements

* Add documentation for Windows users (Pull Request is welcome)
* Smarter waiting with less frequent polling
* Automated tests?
