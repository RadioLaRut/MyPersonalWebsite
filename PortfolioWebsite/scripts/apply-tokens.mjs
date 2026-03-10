import fs from 'fs';
import path from 'path';

function walkSync(dir, filelist = []) {
    try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            if (file === '.DS_Store' || file.startsWith('.')) continue;
            const filepath = path.join(dir, file);
            try {
                if (fs.statSync(filepath).isDirectory()) {
                    filelist = walkSync(filepath, filelist);
                } else {
                    if (filepath.endsWith('.tsx') || filepath.endsWith('.ts')) {
                        filelist.push(filepath);
                    }
                }
            } catch (err) { }
        }
    } catch (e) { }
    return filelist;
}

const files = walkSync('/Users/baixi/Desktop/PersonalPortfolioWebsite/PortfolioWebsite/src');
let changedFiles = 0;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace text-white/XX with textPrimary or textMuted
    content = content.replace(/text-white\/(90|80|75|70)(\s|"|'|`|\]|\})/g, "text-textPrimary$2");
    content = content.replace(/text-white\/(60|50|40|30|20)(\s|"|'|`|\]|\})/g, "text-textMuted$2");

    // Replace hardcoded leadings with semantic leadings
    content = content.replace(/leading-\[1\.[89]\]/g, "leading-loose");
    content = content.replace(/leading-\[2(\.2)?\]/g, "leading-loose");
    content = content.replace(/leading-\[1\.[67]\]/g, "leading-relaxed");

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changedFiles++;
        console.log(`Updated ${file}`);
    }
}

console.log(`Successfully updated ${changedFiles} files with semantic tokens.`);
