import fs from "fs";
import path from "path";

export default async function handler(req, res) {
try {
const dir = path.join(process.cwd(), "public", "images", "atelier");

if (!fs.existsSync(dir)) {
return res.status(200).json({ images: [] });
}

const files = fs.readdirSync(dir);

// فقط jpg/png/webp
const images = files
.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

return res.status(200).json({ images });
} catch (e) {
return res.status(500).json({ images: [] });
}
}
