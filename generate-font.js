const fs = require('fs');
const path = require('path');
const svgtofont = require('svgtofont');
const db = require('./db');

const tempSvgDir = path.join(__dirname, 'temp_svgs');
const outputDistDir = path.join(__dirname, 'public', 'dist');

async function buildFont() {
    try {
        console.log('Auto-Building Fonts: Fetching icons from database... ⏳');
        
        const [rows] = await db.query('SELECT icon_name, svg_code FROM icons');
        
        if (rows.length === 0) {
            console.log('No icons found to generate font! ❌');
            return false;
        }

        // ফোল্ডার প্রস্তুতি
        if (!fs.existsSync(tempSvgDir)) {
            fs.mkdirSync(tempSvgDir, { recursive: true });
        } else {
            fs.readdirSync(tempSvgDir).forEach(file => fs.unlinkSync(path.join(tempSvgDir, file)));
        }

        // SVG ফাইলগুলো তৈরি করা
        rows.forEach(icon => {
            const fileName = `${icon.icon_name.toLowerCase().replace(/\s+/g, '-')}.svg`;
            // SVG ক্লিন করা
            let cleanSvg = icon.svg_code
                .replace(/width="[^"]*"/g, '')
                .replace(/height="[^"]*"/g, '');
                
            fs.writeFileSync(path.join(tempSvgDir, fileName), cleanSvg);
        });

        // ফন্ট জেনারেশন - কলিং পদ্ধতিতে পরিবর্তন (এটি এরর এড়াতে সাহায্য করবে)
        await svgtofont({
            src: tempSvgDir,
            dist: outputDistDir,
            fontName: 'webibis-icons',
            css: true,
            startUnicode: 0xea01,
            svg: true,
            emptyDist: true,
            fontHeight: 512, 
            normalize: true, 
            selector: '.webibis-icons',
            // গুরুত্বপূর্ণ: এটি স্ট্রিমিং এরর কমাতে সাহায্য করে
            useNameAsUnicode: true,
            // ডিফল্ট ওয়েবসাইট জেনারেশন বন্ধ রাখা, কারণ এটি অনেক সময় এরর দেয়
            website: null 
        });

        console.log('🎉 Web font auto-generated successfully!');
        
        // সাময়িক ফাইল ডিলিট
        if (fs.existsSync(tempSvgDir)) {
            fs.readdirSync(tempSvgDir).forEach(file => fs.unlinkSync(path.join(tempSvgDir, file)));
            fs.rmdirSync(tempSvgDir);
        }
        
        return true;
    } catch (error) {
        console.error('Critical Error in buildFont:', error);
        return false;
    }
}

module.exports = buildFont;