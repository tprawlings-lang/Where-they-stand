import { NextResponse } from "next/server";
import { electionData } from "@/lib/election-data";
export async function GET(_request:Request,{params}:{params:Promise<{raceId:string}>}) { const {raceId}=await params; const data=await electionData.getRace(raceId); return data?NextResponse.json({ok:true,data}):NextResponse.json({ok:false,error:{code:"NOT_FOUND",message:"Race not found"}},{status:404}); }
