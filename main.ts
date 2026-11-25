// Dapur Kilat — the hand-in program for the make.fun cooking-game bounty.
// It gathers the entry (the game in game/, the screenshots in screenshots/)
// into the output directory and writes dossier.json there with the vendored
// make.fun library, exactly as the grader expects. Standard library only,
// no network, deterministic: two runs write the same bytes.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// (Without MAKEFUN_OUTPUT_DIR it writes to /output, the grader's directory.)

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Start from a clean output directory so a stale file from an earlier run
// can never ride along into the entry.
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const gameSrc = join(repoRoot, 'game');
const shotsSrc = join(repoRoot, 'screenshots');

if (!existsSync(gameSrc)) throw new Error('game/ is missing from the repository');
cpSync(gameSrc, join(outDir, 'game'), { recursive: true });

mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(shotsSrc)) {
  cpSync(shotsSrc, join(outDir, 'screenshots'), { recursive: true });
}

// The scorer's own caps for this competition: text_max_bytes is the only
// one that shapes the dossier's bytes; the rest refuse an entry the scorer
// would refuse outright (more than 4 screenshots, one over 256 KiB, more
// than 993 files or 48 MiB under game/, or a game/ path over 1000 bytes).
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);

console.log('Dapur Kilat handed in to ' + outDir + ' (dossier.json: ' + dossier.length + ' bytes).');
