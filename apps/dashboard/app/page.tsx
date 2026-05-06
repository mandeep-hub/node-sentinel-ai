"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}`)
      .then((res) => res.text())
      .then((data) => setMessage(data))
      .catch(() => setMessage("Failed to connect"));
  }, []);

  return (
    <main style={{ padding: "20px" }}>
      <h1>Node Sentinel AI Dashboard</h1>
      <p>Backend says:</p>
      <pre>{message}</pre>
    </main>
  );
}
