import axios from 'axios'

type FbiItem = { title: string }

type FbiResponse = {
  page: number
  total: number
  items: FbiItem[]
}

const FBI_URL = 'https://api.fbi.gov/wanted/v1/list'
const MAX_PAGE_SIZE = 50

/**
 * Queries the FBI Most Wanted API to check if there are any cases matching the given query string.
 *
 * @param query - A string which is a name or case title (or part of it) to search for in the FBI database.
 * @returns boolean
 */
export async function checkFbiApiList(query: string): Promise<boolean> {
  let match: FbiItem | undefined
  try {
    let total = Infinity
    let page = 1
    let scanned = 0
    let length = 0

    while (!match && scanned < total) {
      const { data } = await axios.get<FbiResponse>(FBI_URL, {
        params: { title: query, page, pageSize: MAX_PAGE_SIZE },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      })

      length = data.items.length
      total = data.total
      scanned += length

      match = data.items.find((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()),
      )
      page++
    }
  } catch (error) {
    console.error('FBI API error:', error)
    return false
  }

  if (match) {
    return true
  } else {
    return false
  }
}
