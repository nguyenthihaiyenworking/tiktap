const sharp = require('sharp');
const path = require('path');

async function slice() {
  const width = 578;
  const height = 432;
  
  // 1. FLAP MASK: Top triangle of the flap with realistic curve
  // Points: (44, 44) -> (533, 44) -> (288.5, 239) with slight 1.5px overlap
  const flapMaskSvg = Buffer.from(`
    <svg width="${width}" height="${height}">
      <polygon points="42,42 535,42 288.5,240" fill="white" />
    </svg>
  `);
  
  await sharp('vintage_envelope-removebg.png')
    .composite([{ input: flapMaskSvg, blend: 'dest-in' }])
    .png()
    .toFile('public/images/vintage/envelope-flap.png');
    
  // 2. POCKET MASK: Everything except the top flap
  const pocketMaskSvg = Buffer.from(`
    <svg width="${width}" height="${height}">
      <polygon points="43,43 43,388 534,388 534,43 288.5,238" fill="white" />
    </svg>
  `);
  
  await sharp('vintage_envelope-removebg.png')
    .composite([{ input: pocketMaskSvg, blend: 'dest-in' }])
    .png()
    .toFile('public/images/vintage/envelope-pocket.png');

  // 3. BACK LINING: Warm kraft paper texture for inside pocket
  const backMaskSvg = Buffer.from(`
    <svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="innerShadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#caa47c" />
          <stop offset="30%" stop-color="#d4b28c" />
          <stop offset="100%" stop-color="#dfc29f" />
        </linearGradient>
      </defs>
      <rect x="44" y="44" width="489" height="343" rx="4" fill="url(#innerShadow)" />
      <!-- Subtle interior pocket depth shadow -->
      <polygon points="44,44 533,44 288.5,238" fill="#c39d73" opacity="0.35" />
    </svg>
  `);

  await sharp(backMaskSvg)
    .png()
    .toFile('public/images/vintage/envelope-back.png');

  // 4. INNER FLAP: Texture for the back side of the flap when flipped 180 deg
  // Invert/flip flap texture so inside has matching warm kraft finish
  await sharp('public/images/vintage/envelope-flap.png')
    .modulate({ brightness: 0.96, saturation: 0.95 })
    .png()
    .toFile('public/images/vintage/envelope-flap-inner.png');

  console.log('SUCCESS: Sliced envelope into envelope-flap.png, envelope-pocket.png, envelope-back.png, envelope-flap-inner.png');
}

slice().catch(console.error);
