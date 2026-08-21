async function cleanup() {
  await fetch("http://127.0.0.1:3000/api/admin/persona-types/6", { method: "DELETE" });
  console.log("Cleanup done.");
}
cleanup();
