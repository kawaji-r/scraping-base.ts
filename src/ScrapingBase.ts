// https://playwright.dev/docs/api/class-page
import { Browser, Page } from '@playwright/test'
import assert from 'assert'

export class ScrapingBase {
    browser: Browser | undefined
    page: Page | undefined

    async init(): Promise<void> {
        // npx playwright install chromium
        const playwright = require('@playwright/test')
        const options = {
            headless: false, // ヘッドレスモードをオフ
        }
        this.browser = await playwright.chromium.launch(options)
        assert(this.browser)
        const context = await this.browser.newContext()
        this.page = await context.newPage()
        // ビューポート設定
        // await this.page.setViewportSize({
        //     width: 1920,
        //     height: 1080,
        // })
    }

    async go(url: string): Promise<void> {
        assert(this.page)
        await this.page.goto(url)
    }

    /**
     * クリック
     * object.click('text=ABC') // テキストで検索する方法（一部でもOK）
     * @param selector セレクタ
     */
    async click(selector: string): Promise<void> {
        assert(this.page)
        await this.page.click(selector)
    }

    async input(selector: string, text: string): Promise<void> {
        assert(this.page)
        assert(this.page.isEditable(selector))
        assert(this.page.isEnabled(selector))
        await this.page.fill(selector, text)
    }

    async screenshot(filePath: string): Promise<void> {
        assert(this.page)
        await this.page.screenshot({ path: filePath })
    }

    async exist(selector: string): Promise<boolean> {
        assert(this.page)
        return await this.page.isVisible(selector)
    }

    async download(clickSelector: string, path: string): Promise<void> {
        assert(this.page)
        // Note that Promise.all prevents a race condition
        // between clicking and waiting for the download.
        const [download] = await Promise.all([
            // It is important to call waitForEvent before click to set up waiting.
            this.page.waitForEvent('download'),
            // Triggers the download.
            this.page.locator(clickSelector).click(),
        ])
        // wait for download to complete
        const downloadPath = path + download.suggestedFilename()
        console.log(downloadPath)
        await download.saveAs(downloadPath)
    }

    async pause(): Promise<void> {
        assert(this.page)
        await this.page.pause()
    }

    async close() {
        assert(this.browser)
        await this.browser.close()
    }
}
