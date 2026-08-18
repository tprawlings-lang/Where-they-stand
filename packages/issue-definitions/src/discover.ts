import { createHash } from "node:crypto";
import { readdir,readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { IssueDefinitionSchema,type IssueDefinition } from "./index.js";
const FILE_PATTERN=/^([a-z0-9]+(?:-[a-z0-9]+)*)\.v([1-9][0-9]*)\.json$/;
export interface DiscoveredIssue {definition:IssueDefinition;filename:string;hash:string}
export async function discoverIssueDefinitions(directory=fileURLToPath(new URL("../issues",import.meta.url))):Promise<DiscoveredIssue[]> {
 const files=(await readdir(directory)).filter(file=>file.endsWith(".json")).sort();
 return Promise.all(files.map(async filename=>{const match=FILE_PATTERN.exec(filename);if(!match)throw new Error(`Invalid issue filename: ${filename}`);const raw=await readFile(`${directory}/${filename}`,"utf8");const definition=IssueDefinitionSchema.parse(JSON.parse(raw));if(definition.id!==match[1]||definition.version!==Number(match[2]))throw new Error(`Issue filename does not match id/version: ${filename}`);return {definition,filename,hash:createHash("sha256").update(JSON.stringify(definition)).digest("hex")}}));
}
