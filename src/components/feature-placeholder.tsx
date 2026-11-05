import Link from "next/link";

export function FeaturePlaceholder({ title, owner, description }: { title: string; owner: string; description: string }) {
  return <section className="feature"><p className="eyebrow">Planned feature / {owner}</p><h1>{title}</h1><p>{description}</p><div className="notice">This screen is a development placeholder. It does not collect or save information yet.</div><Link className="back" href="/">Back to project home →</Link></section>;
}
