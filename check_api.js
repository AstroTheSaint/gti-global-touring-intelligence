import fetch from "node-fetch";

async function run() {
  const shows = await fetch("http://localhost:3000/api/tour/waffles-world-24/shows").then(r => r.json());
  console.log("shows", shows);
  const summary = await fetch("http://localhost:3000/api/tour/waffles-world-24/summary").then(r => r.json());
  console.log("summary", summary);
  const ledger = await fetch("http://localhost:3000/api/tour/waffles-world-24/ledger").then(r => r.json());
  console.log("ledger", ledger);
  const snapshots = await fetch("http://localhost:3000/api/tour/waffles-world-24/snapshots").then(r => r.json());
  console.log("snapshots", snapshots);
}
run();
