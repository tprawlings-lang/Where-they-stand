import { issueDefinitions } from "@where-they-stand/issue-definitions";
export default function Page() { return <div className="shell page"><p className="eyebrow">2026 issue framework</p><h1>The 15 Issues</h1>{issueDefinitions.map(i => <article className="card" key={i.id}><h2>{i.title}</h2><p>{i.question}</p></article>)}</div>; }
