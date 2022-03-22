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
  
    ▸ 0 <command> [ARGUMENTS...] [OPTIONS...]


  COMMANDS — Type '0 help <command>' to get some help about a command

    pools                                List pools and courses                                 
    slots                                List available time slots for a pool                   
    book                                 Book a slot                                            
    test                                 Test                                                   

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

* Wait till 4 days before the beginning of a slot time and then start polling
* Explore why reusing the browser for the booking doesn't work
* Smarter waiting with less frequent polling
* Automated tests?
