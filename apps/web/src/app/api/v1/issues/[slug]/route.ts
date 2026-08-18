import { NextResponse } from "next/server";
import { db } from "@where-they-stand/db";
export async function GET(_request:Request,{params}:{params:Promise<{slug:string}>}) {
 const {slug}=await params; const data=await db.issue.findUnique({where:{slug},include:{versions:{orderBy:{version:"desc"}}}});
 return data?NextResponse.json({ok:true,data}):NextResponse.json({ok:false,error:{code:"NOT_FOUND",message:"Issue not found"}},{status:404});
}
