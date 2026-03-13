import fetch from "node-fetch";

async function run() {
  const summary = await fetch("http://localhost:3000/api/tour/undefined/summary").then(r => r.text());
  console.log("summary", summary);
}
run();
