import { NextResponse } from "next/server";
import { electionData } from "@/lib/election-data";
export async function GET(_request:Request,{params}:{params:Promise<{candidateId:string}>}) { const {candidateId}=await params; const data=await electionData.getCandidate(candidateId); return data?NextResponse.json({ok:true,data}):NextResponse.json({ok:false,error:{code:"NOT_FOUND",message:"Candidate not found"}},{status:404}); }
