const fs = require('fs');
const path = require('path');
const svgtofont = require('svgtofont');
const db = require('./db');

const tempSvgDir = path.join(__dirname, 'temp_svgs');
const outputDistDir = path.join(__dirname, 'public', 'dist');

// ফাংশনটিকে async হিসেবে ডিফাইন করলাম যাতে অন্য ফাইল থেকে কল করা যায়
async function buildFont() {
    try {
        console.log('Auto-Building Fonts: Fetching icons from database... ⏳');
        
        const [rows] = await db.query('SELECT icon_name, svg_code FROM icons');
        
        if (rows.length === 0) {
            console.log('No icons found to generate font! ❌');
            return false;
        }

        if (!fs.existsSync(tempSvgDir)) {
            fs.mkdirSync(tempSvgDir);
        } else {
            fs.readdirSync(tempSvgDir).forEach(file => fs.unlinkSync(path.join(tempSvgDir, file)));
        }

        rows.forEach(icon => {
            const fileName = `${icon.icon_name}.svg`;
            fs.writeFileSync(path.join(tempSvgDir, fileName), icon.svg_code);
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
            website: {
                title: "Webibis Icons",
                logo: "",
                version: "1.0.0",
                meta: {
                    description: "Custom SVG Icon Pack converted to Web Font.",
                    keywords: "icons,webfont,svg,webibis"
                },
                description: "Preview of your custom web font icons.",
                links: [{ title: "Font Class", url: "index.html" }]
            }
        });

        console.log('🎉 Web font auto-generated successfully!');
        
        // সাময়িক ফাইল ডিলিট
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

// এই লাইনটির মাধ্যমে ফাংশনটিকে অন্য ফাইলে ব্যবহারের জন্য এক্সপোর্ট করলাম
module.exports = buildFont;