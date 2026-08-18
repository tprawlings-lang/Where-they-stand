import { NextResponse } from "next/server";
import { electionData } from "@/lib/election-data";
export async function GET(_request:Request,{params}:{params:Promise<{electionId:string}>}) { const {electionId}=await params; const election=await electionData.getElection(electionId); if(!election)return NextResponse.json({ok:false,error:{code:"NOT_FOUND",message:"Election not found"}},{status:404}); return NextResponse.json({ok:true,data:await electionData.listRaces(electionId)}); }
