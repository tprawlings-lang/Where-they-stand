import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) { return <button {...props} />; }
export function Card({children,...props}:HTMLAttributes<HTMLElement>&{children:ReactNode}) { return <article {...props}>{children}</article>; }
const labels:Record<string,string>={SUPPORTS:"Supports",OPPOSES:"Opposes",DIFFERENT_APPROACH:"Different approach",NO_PUBLIC_POSITION:"No public position found",DECLINED_TO_STATE:"Declined to state"};
export function StanceChip({label}:{label:string}) { return <span className="stance-chip" data-stance={label}>{labels[label]??label.replaceAll("_", " ")}</span>; }
export function EvidenceLink(props:AnchorHTMLAttributes<HTMLAnchorElement>) { return <a {...props}>{props.children ?? "View evidence"}</a>; }
export function CandidateCard({name,metadata}:{name:string;metadata?:string}) { return <Card><h3>{name}</h3>{metadata&&<p>{metadata}</p>}</Card>; }
export function IssueRow({title,children}:{title:string;children:ReactNode}) { return <section><h3>{title}</h3><div>{children}</div></section>; }
export function EmptyState({children}:{children:ReactNode}){return <p className="empty-state">{children}</p>}
