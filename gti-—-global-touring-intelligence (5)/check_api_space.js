import fetch from "node-fetch";

async function run() {
  const shows = await fetch("http://localhost:3000/api/tour/ /shows").then(r => r.json());
  console.log("shows", shows);
}
run();
