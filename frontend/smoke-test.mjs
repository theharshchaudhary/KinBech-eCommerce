import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
let hadError = false
page.on('response', async (res) => {
  if (res.status() >= 400) {
    hadError = true
    console.log('[HTTP', res.status(), ']', res.url())
  }
})
page.on('pageerror', (err) => {
  hadError = true
  console.log('[pageerror]', String(err))
})

async function shot(url, name) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(700)
  await page.screenshot({ path: `smoke-${name}.png`, fullPage: true })
  console.log(`--- ${name} (${url}) ---`)
}

await shot('http://localhost:5173/', 'home')
await shot('http://localhost:5173/shop', 'shop')

const res = await fetch('http://localhost:8000/api/products?per_page=1')
const json = await res.json()
const slug = json.data[0].slug
await shot(`http://localhost:5173/products/${slug}`, 'product-detail')

await shot('http://localhost:5173/login', 'login')
await shot('http://localhost:5173/admin/login', 'admin-login')

await page.fill('input[type="email"]', 'admin@kinbech.test')
await page.fill('input[type="password"]', 'password')
await page.click('button[type="submit"]')
await page.waitForURL('**/admin', { timeout: 10000 })
await page.waitForTimeout(1000)
await page.screenshot({ path: 'smoke-admin-dashboard.png', fullPage: true })
console.log('--- admin-dashboard ---')

await shot('http://localhost:5173/admin/products', 'admin-products')
await shot('http://localhost:5173/admin/staff', 'admin-staff')
await shot('http://localhost:5173/admin/settings', 'admin-settings')
await shot('http://localhost:5173/admin/orders', 'admin-orders')

console.log(hadError ? '\n=== ERRORS FOUND ===' : '\n=== NO ERRORS ===')
await browser.close()
