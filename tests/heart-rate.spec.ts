import { test, expect } from '@playwright/test';

const BRIDGE_URL = 'http://localhost:3476';

async function sendHeartRate(bpm: number) {
    await fetch(BRIDGE_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: `heartRate:${bpm}` }),
    });
}

test.describe('Heart Rate Overlay', () => {
    test('初期状態で Connecting... が表示される', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('.status-message')).toHaveText('Connecting...');
    });

    test('心拍数データを受信すると BPM が表示される', async ({ page }) => {
        await page.goto('/');
        // WebSocket 接続を待つ
        await expect(page.locator('.status-message')).toHaveText('Connecting...');
        await page.waitForTimeout(500);

        await sendHeartRate(72);

        await expect(page.locator('.bpm-value')).toHaveText('72');
        await expect(page.locator('.bpm-label')).toHaveText('BPM');
        // ステータスメッセージは消える
        await expect(page.locator('.status-message')).toBeHidden();
    });

    test('BPM が更新される', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(500);

        await sendHeartRate(60);
        await expect(page.locator('.bpm-value')).toHaveText('60');

        await sendHeartRate(130);
        await expect(page.locator('.bpm-value')).toHaveText('130');
    });

    test.describe('心拍数ゾーンカラー', () => {
        const zones = [
            { bpm: 55, color: 'rgb(13, 148, 136)' },   // rest: #0D9488
            { bpm: 80, color: 'rgb(16, 185, 129)' },   // normal: #10B981
            { bpm: 120, color: 'rgb(245, 158, 11)' },  // elevated: #F59E0B
            { bpm: 150, color: 'rgb(239, 68, 68)' },   // high: #EF4444
            { bpm: 180, color: 'rgb(220, 38, 38)' },   // extreme: #DC2626
        ];

        for (const { bpm, color } of zones) {
            test(`BPM ${bpm} で正しいゾーンカラーが適用される`, async ({ page }) => {
                await page.goto('/');
                await page.waitForTimeout(500);

                await sendHeartRate(bpm);

                await expect(page.locator('.bpm-value')).toHaveText(String(bpm));
                // BpmText の color が変わる
                await expect(page.locator('.bpm-text')).toHaveCSS('color', color);
                // HeartIcon の fill が変わる
                await expect(page.locator('.heart-icon')).toHaveAttribute('fill', expect.stringContaining('#'));
            });
        }
    });

    test('ハートアイコンがライブ時にアニメーションする', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(500);

        // 送信前: アニメーションなし
        await expect(page.locator('.heart-icon')).not.toHaveClass(/heart-beating/);

        await sendHeartRate(80);

        // 送信後: heart-beating クラスが付く
        await expect(page.locator('.heart-icon')).toHaveClass(/heart-beating/);
    });

    test('extreme ゾーンでグロー効果がつく', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(500);

        await sendHeartRate(170);

        await expect(page.locator('.heart-icon')).toHaveCSS('filter', /drop-shadow/);
    });

    test('5秒間データなしで Signal Lost が表示される', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(500);

        await sendHeartRate(72);
        await expect(page.locator('.bpm-value')).toHaveText('72');

        // 5秒 + マージン待つ
        await page.waitForTimeout(5500);

        await expect(page.locator('.status-message')).toHaveText('Signal Lost');
        // BPM 値はまだ表示されている（stale 状態）
        await expect(page.locator('.bpm-value')).toHaveText('72');
    });
});
