"use client";

import React, { useState } from "react";

const JournalPage: React.FC = () => {
  const [entry, setEntry] = useState("");
  const [entries, setEntries] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (entry.trim()) {
      setEntries([entry, ...entries]);
      setEntry("");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", padding: "1rem" }}>
      <h1>My Journal</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          rows={4}
          style={{ width: "100%", marginBottom: "1rem" }}
          placeholder="Write your thoughts here..."
        />
        <button type="submit">Add Entry</button>
      </form>
      <div style={{ marginTop: "2rem" }}>
        <h2>Previous Entries</h2>
        {entries.length === 0 && <p>No entries yet.</p>}
        <ul>
          {entries.map((e, idx) => (
            <li key={idx} style={{ marginBottom: "1rem", background: "#f9f9f9", padding: "0.5rem", borderRadius: 4 }}>
              {e}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default JournalPage;