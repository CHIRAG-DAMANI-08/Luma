from flask import Flask, request, jsonify
from chromadb.config import Settings
import chromadb
import os

app = Flask(__name__)

persist_dir = "/data/chroma" if os.path.exists("/data") else "./data/chroma"
client = chromadb.Client(Settings(chroma_db_impl="duckdb+parquet", persist_directory=persist_dir))
collection = client.get_or_create_collection("luma")

@app.route("/upsert", methods=["POST"])
def upsert():
    d = request.json
    collection.add(
        ids=[d["id"]],
        embeddings=[d["vector"]],
        metadatas=[d.get("metadata", {})],
        documents=[d.get("doc", "")]
    )
    client.persist()
    return jsonify({"ok": True})

@app.route("/query", methods=["POST"])
def query():
    d = request.json
    res = collection.query(query_embeddings=[d["vector"]], n_results=d.get("n_results", 5), include=["metadatas","documents"])
    return jsonify(res)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status":"ok"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))