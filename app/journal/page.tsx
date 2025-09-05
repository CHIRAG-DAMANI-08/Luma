import React from "react";

export default function JournalPage() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 24
    }}>
      <h1 style={{ margin: 0 }}>Journal</h1>
      <p style={{ marginTop: 8 }}>Write and view your journal entries here.</p>
    </div>
  );
}