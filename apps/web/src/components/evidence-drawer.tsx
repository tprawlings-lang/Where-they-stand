"use client";
import {useEffect,useId,useRef,useState} from "react";
import {StanceChip} from "@where-they-stand/ui";
import type {PublicStance} from "@where-they-stand/contracts";

export function EvidenceDrawer({stance}:{stance:PublicStance}){
 const [open,setOpen]=useState(false);const dialog=useRef<HTMLDialogElement>(null);const trigger=useRef<HTMLButtonElement>(null);const titleId=useId();
 useEffect(()=>{const node=dialog.current;if(open&&!node?.open)node?.showModal();if(!open&&node?.open)node.close()},[open]);
 function close(){setOpen(false);trigger.current?.focus()}
 return <><button ref={trigger} className="evidence-button" onClick={()=>setOpen(true)} aria-haspopup="dialog">View evidence for {stance.issue.title}</button><dialog ref={dialog} aria-labelledby={titleId} onCancel={event=>{event.preventDefault();close()}} onClose={()=>{setOpen(false);trigger.current?.focus()}}><div className="drawer-head"><div><p className="eyebrow">Evidence and sources</p><h2 id={titleId}>{stance.issue.title}</h2></div><button className="close-button" onClick={close} aria-label="Close evidence">Close</button></div><p>{stance.issue.question} <strong>Version {stance.issue.version}</strong></p><StanceChip label={stance.label}/>{stance.evidence.length?<ol className="evidence-list">{stance.evidence.map(item=><li key={item.id}><h3>{item.sourceTitle}</h3><p>{item.excerpt}</p><dl><dt>Published</dt><dd>{item.publishedAt?new Date(item.publishedAt).toLocaleDateString():"Date not provided"}</dd><dt>Retrieved</dt><dd>{new Date(item.retrievedAt).toLocaleDateString()}</dd><dt>Status</dt><dd>{item.verification}</dd></dl><a href={item.sourceUrl} target="_blank" rel="noreferrer">Open external source (leaves Where They Stand)</a></li>)}</ol>:<p className="empty-state">No public evidence is available for this position.</p>}</dialog></>
}
