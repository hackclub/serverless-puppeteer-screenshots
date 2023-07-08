import chromium from "chrome-aws-lambda";

export default async function handler(req, res) {
  const { url, as } = req.query;
  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    // executablePath: "/usr/bin/google-chrome-stable", // use this when running locally.
    headless: true,
    ignoreHTTPSErrors: true,
  });

  let page = await browser.newPage();

  await page.emulateMediaFeatures([
    {name: 'prefers-color-scheme', value: 'dark'},
  ]);

  await page.setViewport({
    width: 1200,
    height: 800
});

  await page.goto(url, { waitUntil: "networkidle2" });

  await page.addStyleTag({content: '.public-message { display: none; }'})

  await page.addStyleTag({content: '.transparency-banner { display: none; }'})

  if (as === "pdf") {
    const pdf = await page.pdf({ format: "A4" });

    await browser?.close();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Content-Disposition", `inline; filename=screenshot.pdf`);
    res.send(imageBuffer);
  } else {
    const imageBuffer = await page.screenshot();
    await browser?.close();
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Content-Disposition", `inline; filename=screenshot.png`);
    res.send(imageBuffer);
  }
}
