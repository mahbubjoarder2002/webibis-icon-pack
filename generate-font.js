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
            fs.mkdirSync(tempSvgDir);
        } else {
            fs.readdirSync(tempSvgDir).forEach(file => fs.unlinkSync(path.join(tempSvgDir, file)));
        }

        // SVG ফাইলগুলো তৈরি করা এবং ক্লিন করা
        rows.forEach(icon => {
            const fileName = `${icon.icon_name.toLowerCase().replace(/\s+/g, '-')}.svg`;
            
            // হার্ডকোডেড উইডথ/হাইট সরিয়ে ফেলা যাতে ফন্ট জেনারেটর সঠিকভাবে প্রসেস করতে পারে
            let cleanSvg = icon.svg_code
                .replace(/width="[^"]*"/g, '')
                .replace(/height="[^"]*"/g, '');
                
            fs.writeFileSync(path.join(tempSvgDir, fileName), cleanSvg);
        });

        // ফন্ট জেনারেশন শুরু
        await svgtofont.default({
            src: tempSvgDir,
            dist: outputDistDir,
            fontName: 'webibis-icons',
            css: true,
            startUnicode: 0xea01,
            svg: true,
            emptyDist: true,
            // নিচের সেটিংসগুলো আইকন বক্স হওয়া এবং এরর ফিক্স করবে
            fontHeight: 512, 
            normalize: true, 
            selector: '.webibis-icons',
            website: {
                title: "Webibis Icons",
                version: "1.0.0",
                meta: {
                    description: "Custom SVG Icon Pack converted to Web Font.",
                    keywords: "icons,webfont,svg,webibis"
                }
            }
        });

        console.log('🎉 Web font auto-generated successfully!');
        
        // সাময়িক ফাইল ডিলিট
        if (fs.existsSync(tempSvgDir)) {
            fs.readdirSync(tempSvgDir).forEach(file => fs.unlinkSync(path.join(tempSvgDir, file)));
            fs.rmdirSync(tempSvgDir);
        }
        
        return true;
    } catch (error) {
        console.error('Error auto-generating font:', error);
        return false;
    }
}

module.exports = buildFont;