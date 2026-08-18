import { NextResponse } from "next/server";
import { db } from "@where-they-stand/db";
export async function GET() {
 const data=await db.issue.findMany({include:{versions:{where:{status:"active"},orderBy:{version:"desc"}}},orderBy:{neutralTitle:"asc"}});
 return NextResponse.json({ok:true,data});
}
