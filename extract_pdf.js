const fs = require("fs");
const mod = require("pdf-parse");
const pdf = mod.default || mod.pdf || mod;
const p = "C:/Users/SUMOT/OneDrive - H & M HENNES & MAURITZ GBC AB/Documents/Profile/Subhajeet_Mohanty_Senior_Performance_Engineer_CV.pdf";
Promise.resolve(pdf(fs.readFileSync(p))).then(d => { fs.writeFileSync("resume_extract.txt", d.text); console.log(d.text); }).catch(e => console.error("ERR", e.message));
