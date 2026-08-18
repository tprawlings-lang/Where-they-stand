import {PublicCandidateProfileSchema,PublicIssueSchema,PublicRaceComparisonSchema,type PublicIssue,type PublicStance} from "@where-they-stand/contracts";
import {db} from "@where-they-stand/db";
import {issueDefinitions} from "@where-they-stand/issue-definitions";
import {orderRaceCandidates} from "@where-they-stand/election-data";

const publicStatuses=["PUBLISHED","SUPERSEDED"] as const;
const iso=(date:Date)=>date.toISOString();

export async function listPublicIssues():Promise<PublicIssue[]> {
 const rows=await db.issue.findMany({where:{versions:{some:{status:"active"}}},select:{id:true,slug:true,neutralTitle:true,publicCategory:true,versions:{where:{status:"active"},orderBy:{version:"desc"},take:1,select:{id:true,version:true,cycle:true,canonicalQuestion:true,goal:true,planJson:true}}}});
 const bySlug=new Map(rows.map(row=>[row.slug,row]));
 return issueDefinitions.flatMap(definition=>{const row=bySlug.get(definition.id);const version=row?.versions[0];if(!row||!version)return [];const plan=version.planJson as {billName?:string};return [PublicIssueSchema.parse({id:row.id,slug:row.slug,title:row.neutralTitle,category:row.publicCategory,versionId:version.id,version:version.version,cycle:version.cycle,billName:plan.billName??definition.billName,goal:version.goal,question:version.canonicalQuestion})]});
}

export async function getPublicIssue(slug:string){return (await listPublicIssues()).find(issue=>issue.slug===slug)??null}

const stanceSelect={id:true,candidateId:true,label:true,effectiveAt:true,current:true,status:true,issueVersion:{select:{id:true,version:true,canonicalQuestion:true,issue:{select:{id:true,slug:true,neutralTitle:true}}}},evidence:{orderBy:{weightOrder:"asc" as const},where:{evidence:{approvedAt:{not:null}}},select:{evidence:{select:{id:true,approvedAt:true,sourcePassage:{select:{text:true,source:{select:{type:true,url:true,publishedAt:true,retrievedAt:true,candidateId:true}}}}}}}}};
interface PublicStanceRow {id:string;candidateId:string;label:PublicStance["label"];effectiveAt:Date;current:boolean;issueVersion:{version:number;canonicalQuestion:string;issue:{id:string;slug:string;neutralTitle:string}};evidence:Array<{evidence:{id:string;sourcePassage:{text:string;source:{type:string;url:string;publishedAt:Date|null;retrievedAt:Date;candidateId:string}}}}>}
function mapStance(row:PublicStanceRow):PublicStance {
 const evidence=row.evidence.filter(link=>link.evidence.sourcePassage.source.candidateId===row.candidateId).map(link=>({id:link.evidence.id,sourceType:link.evidence.sourcePassage.source.type,sourceTitle:link.evidence.sourcePassage.source.type.replaceAll("_"," "),sourceUrl:link.evidence.sourcePassage.source.url,publishedAt:link.evidence.sourcePassage.source.publishedAt?iso(link.evidence.sourcePassage.source.publishedAt):null,retrievedAt:iso(link.evidence.sourcePassage.source.retrievedAt),excerpt:link.evidence.sourcePassage.text,verification:"Verified for publication" as const}));
 return {id:row.id,candidateId:row.candidateId,issue:{id:row.issueVersion.issue.id,slug:row.issueVersion.issue.slug,title:row.issueVersion.issue.neutralTitle,version:row.issueVersion.version,question:row.issueVersion.canonicalQuestion},label:row.label,effectiveAt:iso(row.effectiveAt),isCurrent:row.current,evidence};
}

async function stances(candidateIds:string[]){
 const rows=await db.stance.findMany({where:{candidateId:{in:candidateIds},status:{in:[...publicStatuses]}},select:stanceSelect,orderBy:[{effectiveAt:"desc"},{id:"asc"}]});
 return rows.map(mapStance).filter(stance=>!(["SUPPORTS","OPPOSES","DIFFERENT_APPROACH"] as string[]).includes(stance.label)||stance.evidence.length>0);
}

export async function getPublicRaceComparison(id:string){
 const race=await db.race.findUnique({where:{id},include:{election:true,candidates:{where:{ballotStatus:{in:["QUALIFIED","WRITE_IN"]}},include:{candidate:true}}}});if(!race)return null;
 const issues=await listPublicIssues();const all=await stances(race.candidates.map(entry=>entry.candidateId));
 const ordered=orderRaceCandidates(race.candidates);const ballotOrder=ordered.length>0&&ordered.every(entry=>entry.ballotOrder!=null);
 return PublicRaceComparisonSchema.parse({id:race.id,office:race.office,state:race.state,district:race.district,specialElection:race.specialFlag,orderingRule:ballotOrder?"OFFICIAL_BALLOT_ORDER":"ALPHABETICAL_BY_SURNAME",election:{id:race.election.id,name:race.election.name,cycle:race.election.cycle,date:iso(race.election.generalDate),sourceAuthority:race.election.sourceAuthority},issues,candidates:ordered.map(entry=>({id:entry.candidate.id,displayName:entry.candidate.displayName,party:entry.partyText,ballotStatus:entry.ballotStatus,ballotOrder:entry.ballotOrder,stances:issues.map(issue=>all.find(stance=>stance.candidateId===entry.candidateId&&stance.issue.id===issue.id&&stance.isCurrent)??null)}))});
}

export async function getPublicCandidateProfile(id:string){
 const candidate=await db.candidate.findUnique({where:{id},include:{accounts:{where:{status:"VERIFIED"}},races:{where:{ballotStatus:{in:["QUALIFIED","WRITE_IN"]}},include:{race:{include:{election:true}}},orderBy:{effectiveAt:"desc"}}}});const candidacy=candidate?.races[0];if(!candidate||!candidacy)return null;
 const issues=await listPublicIssues();const all=await stances([id]);
 return PublicCandidateProfileSchema.parse({id:candidate.id,displayName:candidate.displayName,legalName:candidate.legalName,race:{id:candidacy.race.id,office:candidacy.race.office,state:candidacy.race.state,district:candidacy.race.district,electionName:candidacy.race.election.name,electionDate:iso(candidacy.race.election.generalDate),party:candidacy.partyText,ballotStatus:candidacy.ballotStatus},accounts:candidate.accounts.map(account=>({platform:account.platform,url:account.canonicalUrl})),currentPositions:issues.map(issue=>({issue,stance:all.find(stance=>stance.issue.id===issue.id&&stance.isCurrent)??null})),history:all.filter(stance=>!stance.isCurrent).sort((a,b)=>a.effectiveAt.localeCompare(b.effectiveAt))});
}

export async function listIssueStances(slug:string){const issue=await getPublicIssue(slug);if(!issue)return null;const rows=await db.stance.findMany({where:{issueVersionId:issue.versionId,status:"PUBLISHED",current:true,candidate:{races:{some:{ballotStatus:{in:["QUALIFIED","WRITE_IN"]}}}}},select:stanceSelect,orderBy:[{candidate:{displayName:"asc"}},{effectiveAt:"desc"}]});return rows.map(mapStance).filter(stance=>!(["SUPPORTS","OPPOSES","DIFFERENT_APPROACH"] as string[]).includes(stance.label)||stance.evidence.length>0)}
