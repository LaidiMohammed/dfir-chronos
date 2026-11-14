import type { Module } from "@/lib/types";

// TODO: modules 2-4

export const modules: Module[] = [
  {
    slug: "timeline",
    title: "Timeline Reconstruction via Artifact Correlation",
    subtitle: "Windows Forensics — $UsnJrnl, Shimcache, SQLite WAL",
    description:
      "Reconstruct an attacker's execution window on Windows by correlating " +
      "$UsnJrnl, Shimcache, and SQLite WAL files — even after event logs were " +
      "deleted. A complete, step-by-step forensic workflow with tools, " +
      "methodology, and deliverables.",
    objective:
      "Reconstruct the attacker's execution window by correlating partial or " +
      "deleted Windows artifacts.",
    context:
      "Event logs were deleted by the attacker. You have a disk image containing " +
      "$UsnJrnl, Shimcache, and SQLite databases with non-checkpointed -wal files.",
    steps: [
      {
        order: 1,
        title: "Collection & Preparation",
        body:
          "Extract $UsnJrnl (via fsutil usn readjournal or UsnJrnl2Csv), " +
          "Shimcache (via reg export or ShimcacheParser), and SQLite databases " +
          "with their -wal files. Preserve hashes of every source artifact.",
        tools: ["fsutil", "UsnJrnl2Csv", "ShimcacheParser", "reg export"],
      },
      {
        order: 2,
        title: "Timestamp Extraction",
        body:
          "Parse $UsnJrnl for file creation, modification, and deletion " +
          "sequences. Extract Shimcache entries for executed binaries even if " +
          "the files no longer exist. Open SQLite databases in WAL mode to " +
          "retrieve non-checkpointed transactions.",
        tools: ["sqlite3", "UsnJrnl2Csv", "ShimcacheParser"],
      },
      {
        order: 3,
        title: "Correlation",
        body:
          "Build a unified timeline (CSV or database) with normalized UTC " +
          "timestamps. Identify coherent sequences: a file created (USN), then " +
          "executed (Shimcache), then queried via SQLite (WAL) within a short " +
          "window.",
        tools: ["Timeline Explorer", "Plaso", "log2timeline"],
      },
      {
        order: 4,
        title: "Analysis",
        body:
          "Determine the exact attacker execution window (start and end). " +
          "Flag suspicious temporal gaps — for example, executions at 3 AM " +
          "outside business hours.",
        tools: ["Timeline Explorer"],
      },
    ],
    deliverables: [
      "Unified timeline chart or table",
      "Identified execution window (start date/time → end date/time, UTC)",
      "List of key artifacts used as evidence",
      "Conclusion on the attacker's modus operandi",
    ],
    tools: [
      "UsnJrnl2Csv",
      "ShimcacheParser",
      "sqlite3",
      "Timeline Explorer",
      "Plaso",
      "log2timeline",
    ],
    icon: "Clock",
  },
];
