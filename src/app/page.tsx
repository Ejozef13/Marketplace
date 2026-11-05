import { workstreams } from "@/lib/workstreams";

export default function Home() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">Patriot Marketplace / Team foundation</p>
        <h1>A campus community.<br /><em>A shared place to trade.</em></h1>
        <p>Find something you need. Pass on something you don’t. Built around the GMU community.</p>
        <div className="notice"><strong>Development starter</strong><br />The project structure is ready. Login, real listings, chat, and transactions are still to be implemented.</div>
      </section>
      <section aria-labelledby="team-heading">
        <div className="section-heading"><h2 id="team-heading">Six people. One project.</h2><p>Clear ownership from the first commit.</p></div>
        <div className="grid">{workstreams.map((stream, index) => (
          <article className="card" key={stream.owner}>
            <span className="number">0{index + 1}</span>
            <p className="owner">{stream.owner}</p><h3>{stream.title}</h3><p>{stream.scope}</p>
          </article>
        ))}</div>
      </section>
    </>
  );
}
