import fetch from 'node-fetch';
import fs from 'fs';
import { createObjectCsvWriter } from 'csv-writer';
// api url
const api_url = "https://nocoded.org/version-test/api/1.1/obj/";


function JSONtoCsv(arrayOfJson, header, name) {
    // convert JSON to CSV
    const csvWriter = createObjectCsvWriter({
        path: `${name}.csv`,
        header: header.map((h) => ({ id: h, title: h })),
        alwaysQuote: true
    }
    );
    csvWriter.writeRecords(arrayOfJson).then(() => console.log('The CSV file was written successfully'));
}

function getHeader(json){
    // get header from json
    const header = [];
    for (const key in json[0]) {
        header.push(key);
    }
    return header;
}

async function show(url) {
    const tables = ["Course"];
    tables.forEach(async (table) => {
        const response = await fetch(url + table);
        const json = await response.json();
        const header = getHeader(json.response.results);
        console.log(header);
        //const header = ["Categories", "Completed", "Description", "Featured_Image", "Modules", "Price", "Published"];
        const date = new Date(Date.now());
        const name = `${table}_${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}`;
        JSONtoCsv(json.response.results, header, name);
    });
 
}



show(api_url);