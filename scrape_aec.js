import fs from 'fs';

async function scrape() {
  const url = 'https://api.firecrawl.dev/v1/scrape';
  const apiKey = 'fc-27b336639fee46518bb924638cf74a09';

  console.log("Iniciando scraping da URL: https://www.aec.com.br/");

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: 'https://www.aec.com.br/',
        formats: ['markdown', 'extract'],
        extract: {
          schema: {
            "type": "object",
            "properties": {
              "primaryColors": { "type": "array", "items": { "type": "string" } },
              "secondaryColors": { "type": "array", "items": { "type": "string" } },
              "fontsUsed": { "type": "array", "items": { "type": "string" } },
              "brandingVibe": { "type": "string" },
              "keyServices": { "type": "array", "items": { "type": "string" } }
            }
          }
        }
      })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();
    if (data.success && data.data && data.data.markdown) {
        fs.writeFileSync('aec_scraped.md', data.data.markdown);
        if (data.data.extract) {
            fs.writeFileSync('aec_brand.json', JSON.stringify(data.data.extract, null, 2));
        }
        console.log("Scrape concluído com sucesso e salvo em aec_scraped.md e aec_brand.json");
    } else {
        fs.writeFileSync('aec_scraped_error.json', JSON.stringify(data, null, 2));
        console.log("Scrape retornou erro ou formato inválido. Verifique aec_scraped_error.json");
    }
  } catch (err) {
    console.error("Erro durante o scraping:", err);
  }
}

scrape();
