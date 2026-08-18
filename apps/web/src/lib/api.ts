import {ApiErrorCodeSchema,ApiErrorSchema,ApiResultSchema} from "@where-they-stand/contracts";
import {NextResponse} from "next/server";
import {z} from "zod";
type ErrorCode=z.infer<typeof ApiErrorCodeSchema>;
export const UUIDSchema=z.string().uuid(); export const SlugSchema=z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export function error(code:ErrorCode,message:string,status:number){return NextResponse.json(ApiResultSchema(z.never()).options[1].parse({ok:false,error:ApiErrorSchema.parse({code,message})}),{status})}
export function success<T extends z.ZodType>(schema:T,data:unknown){return NextResponse.json(ApiResultSchema(schema).parse({ok:true,data}))}
export function pathValue<T>(schema:z.ZodType<T>,value:string):T|null{const result=schema.safeParse(value);return result.success?result.data:null}
export function query(request:Request,allowed:readonly string[]){const params=new URL(request.url).searchParams;return [...params.keys()].every(key=>allowed.includes(key))?params:null}
export function pagination(params:URLSearchParams){return z.object({limit:z.coerce.number().int().positive().max(100).default(50),offset:z.coerce.number().int().nonnegative().default(0)}).strict().safeParse(Object.fromEntries(params))}
