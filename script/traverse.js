const fs = require('fs');
const Papa = require('papaparse');
const axios = require('axios');

async function processCSV() {
    try {
        const csvFilePath = '../city_temperature.csv';
        const fileContent = fs.readFileSync(csvFilePath, 'utf8');
        const parsedData = Papa.parse(fileContent, { header: true, dynamicTyping: true });
        const rows = parsedData.data;

        // Initialize an array to hold request stats
        let requestStats = [];

        for (let i = 0; i < 10000; i++) {
            const row = rows[i];
            const headers = {
                'Content-Type': 'application/json'
            };

            try {
                const startTime = new Date(); // Capture start time
                const response = await axios.post('http://localhost:3001/csv-row-process', { data: row }, { headers });
                const endTime = new Date(); // Capture end time

                // Calculate duration and store in requestStats
                requestStats.push({
                    row,
                    startTime,
                    endTime,
                    duration: (endTime - startTime) / 1000 // Duration in seconds
                });

                console.log('Row processed:', row);
            } catch (error) {
                console.error('Error processing row:', row, error);
            }
        }

        // Write request stats to a file
        fs.writeFileSync('processCsvStats.json', JSON.stringify(requestStats, null, 2));

        console.log('CSV traversal complete');
    } catch (error) {
        console.error('Error reading or parsing CSV file:', error);
    }
}

async function processText() {
    try {
        const csvFilePath = '../sentiment_sentences.csv';
        const fileContent = fs.readFileSync(csvFilePath, 'utf8');
        const parsedData = Papa.parse(fileContent, { header: true, dynamicTyping: true });
        const rows = parsedData.data;

        // Initialize an array to hold request stats
        let requestStats = [];

        for (const row of rows) {
            console.log('Processing row:', row);

            const headers = {
                'Content-Type': 'application/json'
            };

            try {
                const startTime = new Date(); // Capture start time
                const response = await axios.post('http://localhost:3001/csv-row-process', { data: row }, { headers });
                const endTime = new Date(); // Capture end time

                // Calculate duration and store in requestStats
                requestStats.push({
                    row,
                    startTime,
                    endTime,
                    duration: (endTime - startTime) / 1000 // Duration in seconds
                });

                
                console.log('Row processed:', row);
            } catch (error) {
                console.error('Error processing row:', row, error);
            }
        }

        // Write request stats to a file
        fs.writeFileSync('processTextStats.json', JSON.stringify(requestStats, null, 2));

        console.log('CSV traversal complete');
    } catch (error) {
        console.error('Error reading or parsing CSV file:', error);
    }
}

async function processImageFolder() {
    const folderPath = '../crop_images/rice';
    let requestStats = []; // Initialize an array to hold request stats

    fs.readdir(folderPath, async (err, files) => {
        if (err) {
            console.error("Could not list the directory.", err);
            process.exit(1);
        }

        for (const file of files) {
            const imagePath = folderPath + '/' + file;

            try {
                const imageBuffer = fs.readFileSync(imagePath); // Use synchronous read to ensure timing accuracy

                const headers = {
                    'Content-Type': 'application/json',
                    'Access-Control-Request-Headers': 'mulipart/form-data'
                };

                const startTime = new Date(); // Capture start time

                await axios.post('http://localhost:3001/image-upload', { file: imageBuffer }, { headers });

                const endTime = new Date(); // Capture end time

                // Save the stats
                requestStats.push({
                    file: imagePath,
                    startTime,
                    endTime,
                    duration: (endTime - startTime) / 1000 // Duration in seconds
                });
            } catch (error) {
                console.error(`Error processing file ${imagePath}:`, error);
            }
        }

        // Write request stats to a file
        fs.writeFileSync('processImageFolderStats.json', JSON.stringify(requestStats, null, 2));

        console.log('Folder traversal complete');
    });
}
