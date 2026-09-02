import fs from 'fs';
let code = fs.readFileSync('bff/src/routes/design.ts', 'utf8');

// First remove ALL occurrences
code = code.replaceAll("  const config = loadConfig();\n", "");
code = code.replaceAll("  const client = createNceClient(config);\n", "");
code = code.replaceAll("    const config = loadConfig();\n", "");
code = code.replaceAll("    const client = createNceClient(config);\n", "");

// Then inject the hoisted ones right after `designRoutes` declaration
code = code.replace(
  "export const designRoutes = new Hono<{ Variables: { session: { actor: string; namespace: string } } }>();",
  "export const designRoutes = new Hono<{ Variables: { session: { actor: string; namespace: string } } }>();\n\nconst config = loadConfig();\nconst client = createNceClient(config);"
);

fs.writeFileSync('bff/src/routes/design.ts', code);
