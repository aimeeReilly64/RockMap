import fs from 'fs';

const inputFile = 'raw.geojson';       // Change this to your filename
const outputFile = 'cleaned.geojson';

const htmlTagRegex = /<[^>]*>/g;
const tdValueRegex = /<td>(.*?)<\/td>/g;

function extractFields(html) {
    const cleaned = {};
    let matches = [...html.matchAll(tdValueRegex)];

    for (let i = 0; i < matches.length - 1; i += 2) {
        let key = matches[i][1].replace(htmlTagRegex, '').trim();
        let value = matches[i + 1][1].replace(htmlTagRegex, '').trim();

        if (key && value && value !== '&lt;Null&gt;') {
            cleaned[key] = value;
        }
    }

    return {
        name: cleaned['OFFICIAL_NAME'] || '',
        commodity: cleaned['PRIMARY_COMMODITY'] || '',
        status: cleaned['MINE_SITE_STATUS'] || '',
        access: cleaned['OPERATIONAL_ACCESS'] || '',
        district: cleaned['AMIS_DISTRICT'] || '',
        township: cleaned['NDM_TOWNSHIP'] || '',
        notes: cleaned['AMIS_BACKGROUND_INFO'] || ''
    };
}

const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

const cleaned = {
    type: 'FeatureCollection',
    features: data.features.map((feature) => {
        const html = feature.properties.description?.value || '';
        const extracted = extractFields(html);

        return {
            type: 'Feature',
            geometry: feature.geometry,
            properties: {
                id: feature.properties.name || '',
                ...extracted
            }
        };
    })
};

fs.writeFileSync(outputFile, JSON.stringify(cleaned, null, 2));
console.log(`✅ Cleaned GeoJSON written to ${outputFile}`);
