import fs from 'fs';
import path from 'path';
import https from 'https';

const URL = "https://orbit.escp.eu/api/calendars/getSpecificCalendar/2f6b7c9855f563b1ad9d3f5e221a2d60f3f3fdb2";
const OUTPUT_DIR = path.join(process.cwd(), 'public');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'calendar-cache.ics');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log("📅 Prefetching Calendar Data...");
console.log(`Target: ${URL}`);

// Use options object to disable SSL matching
const options = {
    method: 'GET',
    rejectUnauthorized: false // Ignore self-signed/invalid cert errors
};

const req = https.request(URL, options, (res) => {
    if (res.statusCode !== 200) {
        console.error(`❌ Failed to fetch calendar: Status Code ${res.statusCode}`);
        // Create an empty or fallback file to prevent build error
        fs.writeFileSync(OUTPUT_FILE, "BEGIN:VCALENDAR\nVERSION:2.0\nEND:VCALENDAR");
        process.exit(0); // Soft exit
    }

    const file = fs.createWriteStream(OUTPUT_FILE);
    res.pipe(file);

    file.on('finish', () => {
        file.close();
        console.log(`✅ Calendar cached successfully to ${OUTPUT_FILE}`);
    });
}).on('error', (err) => {
    console.error(`❌ Error fetching calendar: ${err.message}`);
    // Create empty file on error
    fs.writeFileSync(OUTPUT_FILE, "BEGIN:VCALENDAR\nVERSION:2.0\nEND:VCALENDAR");
});

req.end();
