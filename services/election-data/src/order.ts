import type {CandidateRecord,RaceCandidateRecord} from "./types";
type Entry=RaceCandidateRecord&{candidate:CandidateRecord};
const suffix=/^(jr\.?|sr\.?|ii|iii|iv)$/i; const collator=new Intl.Collator("en-US",{sensitivity:"base",usage:"sort"});
export function candidateSortName(name:string){const words=name.trim().split(/\s+/);while(words.length>1&&suffix.test(words.at(-1)!))words.pop();return words.at(-1)!.normalize("NFKD")}
export function orderRaceCandidates<T extends Entry>(entries:readonly T[]):T[]{return [...entries].sort((a,b)=>{const ao=a.ballotOrder,bo=b.ballotOrder;if(ao!=null||bo!=null){if(ao==null)return 1;if(bo==null)return-1;if(ao!==bo)return ao-bo}return collator.compare(candidateSortName(a.candidate.displayName),candidateSortName(b.candidate.displayName))||collator.compare(a.candidate.displayName,b.candidate.displayName)})}
