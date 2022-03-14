import { Browser } from './browser'
import { config } from './config'

export async function listPools({ args, options, logger }): Promise<void> {
    return Pools.build(options.v)
        .then(pools => {
            console.log(`Available Pools:\n${pools.getPools().join('\n')}`)
        })
}


export class Pools {
    private static pools: { [key: string]: string } = null
    private verbose: boolean = false

    private constructor(verbose: boolean = false) {
        this.verbose = verbose
    }

    public static async build(verbose: boolean = false): Promise<Pools> {
        const instance = new Pools(verbose)
        await instance.init()
        return instance
    }

    public getPoolsAndUrls(): typeof Pools.pools {
        return Pools.pools
    }

    public getPools(): string[] {
        return Object.keys(Pools.pools).sort()
    }

    public getUrlForPool(searchPool: string): string {
        if (searchPool in Pools.pools) {
            return Pools.pools[searchPool]
        }
        const matchingPools = this.getPools().filter(pool => pool.toLowerCase().includes(searchPool.toLowerCase()))
        if (matchingPools.length === 1) {
            const poolName = matchingPools[0]
            console.log(`Using pool ${poolName}`)
            return Pools.pools[poolName]
        }

        throw new Error(`Found multiple matches for »${searchPool}«, please be more specific:\n${matchingPools.join('\n')}`)
    }


    private async init(): Promise<void> {
        Pools.pools = await Browser
            .getBrowser()
            .then(browser => browser.newPage())
            .then(async (page) => {
                if (this.verbose) page.on('console', (msg) => console.log('PAGE LOG:', msg.text()))

                const url = config.PRETIX_BAEDER_URL
                var pageNum = 1
                var result = {}
                while (true) {
                    await page.goto(`${url}?page=${pageNum}`)
                    const pageResult = await page.$$eval(".row a:not(.btn)", handles => {
                        const baseURI = document.baseURI
                        return Object.fromEntries(
                            handles.map(handle => {
                                return [
                                    handle.textContent.trim(),
                                    new URL(handle.getAttribute("href"), baseURI).toString()
                                ]
                            }))
                    })
                    // try next page till we get error
                    if (Object.keys(pageResult).length > 0) {
                        Object.assign(result, pageResult)
                        pageNum++
                    } else {
                        break
                    }
                }

                if (this.verbose) console.log(result)

                await page.close()
                return result
            })
    }

}


