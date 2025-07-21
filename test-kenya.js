import genericScraper from './src/scraper/genericScraper.js'

;(async () => {
  const filters = { make: 'Mazda', model: 'CX-5' }
  const auto = await genericScraper('autochek', filters)
  const jiji = await genericScraper('jiji',    filters)
  console.log(JSON.stringify({ autochek: auto, jiji }, null, 2))
})()
