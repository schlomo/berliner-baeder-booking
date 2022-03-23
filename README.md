# Automated Ticket Booking for Berliner Bäder

Automate booking time slot tickets for public swimming pools in Berlin. This application will book tickets for the next available slot or a given time slot. The tickets only represent a time slot, you still need entrance tickets, which you can purchase at the entrance.

## Installation

`yarn` should do everything right

## Usage

`yarn dev` to run, `yarn dev help` for more details:

```text
$ yarn dev help

  berliner-baeder-booking 1.0.0 — Automate booking time slot tickets for public swimming pools in Berlin

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

## Improvements

* Smarter waiting with less frequent polling
* Automated tests?
