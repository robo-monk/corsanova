import { text } from '@sveltejs/kit'
import { JSDOM, ResourceLoader } from 'jsdom';
import fetch from 'node-fetch'; // npm install node-fetch

class CustomResourceLoader extends ResourceLoader {
    async fetch(url, options) {
        console.log('! url', url, options)
        return await fetch(url, options);
        // Override the contents of this script to do something unusual.
        if (url === "https://example.com/some-specific-script.js") {
            return Promise.resolve(Buffer.from("window.someGlobal = 5;"));
        }

        return super.fetch(url, options);
    }
}

async function renderWebsite(url) {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html, {
        resources: 'usable',
        runScripts: "dangerously",
        pretendToBeVisual: true,
    });

    // Wait for the scripts and resources to load
    await new Promise((resolve) => {
        dom.window.document.addEventListener('DOMContentLoaded', resolve);
    });

    // Return the fully rendered HTML
    return dom.serialize();
}

export async function POST({ request, cookies, params }) {
    let website = params.website
    if (!website.includes('https://')) website = 'https://' + website

    // const response = await fetch(website);
    // const html = await response.text();
    const dom = await JSDOM.fromURL(website, {
        // resources: new CustomResourceLoader({
        //     userAgent: "Chrome/88.0.4298.0 Safari/537.36"
        // }),

        resources: 'usable',
        runScripts: "dangerously",
        pretendToBeVisual: true
    });
    const url = new URL(website);
    const baseURI = url.origin;
    const images = dom.window.document.querySelectorAll('img');
    console.log(`Found ${images.length} images`)
    const base64Images = [];

    for (const img of images) {
        // continue
        const imageUrl = img.src;

        if (imageUrl.startsWith('data:image')) {
            // Skip if the image is already a base64 data URL
            continue;
        }

        try {
            continue
            const absoluteUrl = new URL(imageUrl, baseURI).href;
            console.log(`Converting image: ${absoluteUrl}`)
            const imageResponse = await fetch(absoluteUrl);
            if (!imageResponse.ok) {
                throw new Error(`Failed to fetch image: ${absoluteUrl} (${imageResponse.status} ${imageResponse.statusText})`);
            }
            const imageData = await imageResponse.arrayBuffer();
            const base64Data = Buffer.from(imageData).toString('base64');
            const mimeType = imageResponse.headers.get('content-type');

            const dataURL = `data:${mimeType};base64,${base64Data}`;
            // console.log(`Converted image: ${absoluteUrl} to ${dataURL}`)

            img.src = dataURL;
            base64Images.push({
                src: imageUrl,
                dataURL,
            });
        } catch (error) {
            console.error(`Error converting image: ${imageUrl}`, error);
        }
    }


    // Return the fully rendered HTML
    return text(dom.serialize());

    return text(`Hello ${JSON.stringify(params)}!`)
}
