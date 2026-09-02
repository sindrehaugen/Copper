import { argbFromHex, Hct, hexFromArgb } from '@material/material-color-utilities';
import { BRAND_SEED_HEX } from '../theme/tokens';

const seedHct = Hct.fromInt(argbFromHex(BRAND_SEED_HEX));

function getLocColors(hueOffset: number) {
  const h = (seedHct.hue + hueOffset) % 360;
  const c = Math.max(seedHct.chroma, 40);
  return {
    color: hexFromArgb(Hct.from(h, c, 30).toInt()),
    bgColor: hexFromArgb(Hct.from(h, c, 90).toInt())
  };
}

export const PHYSICAL_LOCATIONS: Record<string, { code: string; color: string; bgColor: string }> = {
  'Mobile': { code: 'MBL', ...getLocColors(0) },
  'Desktop': { code: 'DSK', ...getLocColors(15) },
  'In-Desk': { code: 'IND', ...getLocColors(30) },
  'Under-Desk': { code: 'UND', ...getLocColors(45) },
  'In-Floor': { code: 'INF', ...getLocColors(60) },
  'On-Floor': { code: 'ONF', ...getLocColors(75) },
  'In-Wall': { code: 'INW', ...getLocColors(90) },
  'On-Wall': { code: 'ONW', ...getLocColors(105) },
  'In-Ceiling': { code: 'INC', ...getLocColors(120) },
  'On-Ceiling': { code: 'ONC', ...getLocColors(135) },
  'Above Ceiling': { code: 'ABC', ...getLocColors(150) },
  'In-Rack': { code: 'INR', ...getLocColors(165) },
  'Top of rack': { code: 'TOR', ...getLocColors(180) },
  'Behind Parent Device': { code: 'BPD', ...getLocColors(195) },
  'DIN-Rail': { code: 'DIN', ...getLocColors(210) },
  'In-Furniture': { code: 'INU', ...getLocColors(225) },
  'Under-Furniture': { code: 'UNF', ...getLocColors(240) },
  'In-Cabinet': { code: 'CAB', ...getLocColors(255) },
  'Under-Cabinet': { code: 'UCB', ...getLocColors(270) },
  'On-Pole': { code: 'POL', ...getLocColors(285) },
  'On-Truss': { code: 'TRU', ...getLocColors(300) },
  'On-Cable Ladder': { code: 'OCL', ...getLocColors(315) },
  'In-Channel': { code: 'ICH', ...getLocColors(330) }
};
