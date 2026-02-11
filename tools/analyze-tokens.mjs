#!/usr/bin/env node

/**
 * Agent Token Usage Analyzer
 *
 * Parses Claude Code JSONL transcripts to produce per-agent, per-session,
 * and per-model token usage breakdowns. Dev tool only — zero external deps.
 *
 * Usage: node tools/analyze-tokens.mjs [--json-only] [--session <id>]
 */

import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import readline from "node:readline";

// ── Constants ────────────────────────────────────────────────────────────────

const PROJECT_DIR = path.join(
  os.homedir(),
  ".claude/projects/-home-tabramczyk-workspace-the-amulet",
);
const REPORT_DIR = path.join(import.meta.dirname, ".token-reports");

// ── CLI flags ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const JSON_ONLY = args.includes("--json-only");
const SESSION_FILTER = (() => {
  const idx = args.indexOf("--session");
  return idx !== -1 ? args[idx + 1] : null;
})();

// ── JSONL streaming reader ───────────────────────────────────────────────────

async function* readJsonl(filePath) {
  let stream;
  try {
    stream = createReadStream(filePath, { encoding: "utf-8" });
  } catch {
    return;
  }
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  let lineNum = 0;
  for await (const line of rl) {
    lineNum++;
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      yield JSON.parse(trimmed);
    } catch {
      // Silently skip malformed lines
    }
  }
}

// ── Role detection from main session ─────────────────────────────────────────

/**
 * Extract Task tool_use calls and agent_progress records from the main session.
 *
 * Returns:
 * - roleMap: Map<agentId, { role, prompt }> for agents found in progress records
 * - taskCalls: Array<{ subagentType, description, prompt }> for matching against
 *   subagent first-user text
 */
async function buildRoleMap(mainSessionPath) {
  /** @type {Map<string, { role: string, prompt: string }>} */
  const roleMap = new Map();

  // Collect Task tool_use entries
  const taskCalls = [];
  // Collect agent_progress entries: agentId → prompt
  const agentPrompts = new Map();

  for await (const rec of readJsonl(mainSessionPath)) {
    if (rec.type === "assistant" && rec.message?.content) {
      for (const block of rec.message.content) {
        if (block?.type === "tool_use" && block.name === "Task") {
          const inp = block.input || {};
          taskCalls.push({
            subagentType: inp.subagent_type || "",
            description: inp.description || "",
            prompt: inp.prompt || "",
            name: inp.name || "",
          });
        }
      }
    }

    if (rec.type === "progress") {
      const data = rec.data || {};
      if (data.type === "agent_progress" && data.agentId) {
        agentPrompts.set(data.agentId, data.prompt || "");
      }
    }
  }

  // Match agent prompts to Task calls by prompt text overlap
  for (const [agentId, agentPrompt] of agentPrompts) {
    const match = matchPromptToTask(agentPrompt, taskCalls);
    if (match) {
      roleMap.set(agentId, { role: formatTaskRole(match), prompt: agentPrompt.slice(0, 150) });
    }
  }

  return { roleMap, taskCalls };
}

function matchPromptToTask(text, taskCalls) {
  let bestMatch = null;
  let bestScore = 0;

  for (const taskInfo of taskCalls) {
    const taskPrompt = taskInfo.prompt;
    if (taskPrompt && text) {
      const aSlice = text.slice(0, 200);
      const tSlice = taskPrompt.slice(0, 200);
      if (aSlice === tSlice || aSlice.startsWith(tSlice) || tSlice.startsWith(aSlice)) {
        const score = Math.min(aSlice.length, tSlice.length);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = taskInfo;
        }
      }
    }
  }

  return bestMatch;
}

function formatTaskRole(taskInfo) {
  if (taskInfo.subagentType) {
    return `${taskInfo.subagentType}: ${taskInfo.description}`;
  }
  return taskInfo.description || "unknown";
}

// ── Analyze a single JSONL file ──────────────────────────────────────────────

async function analyzeFile(filePath) {
  let sessionId = null;
  let agentId = null;
  let slug = null;
  let firstTimestamp = null;
  let lastTimestamp = null;
  let model = null;
  let inputTokens = 0;
  let outputTokens = 0;
  let cacheCreationTokens = 0;
  let cacheReadTokens = 0;
  let turns = 0;
  let firstUserText = null;
  let role = null;

  for await (const rec of readJsonl(filePath)) {
    if (rec.type === "assistant" && rec.message) {
      turns++;
      if (!sessionId) sessionId = rec.sessionId;
      if (!agentId) agentId = rec.agentId;
      if (!slug) slug = rec.slug;
      if (!firstTimestamp) firstTimestamp = rec.timestamp;
      lastTimestamp = rec.timestamp;

      const msg = rec.message;
      if (msg.model) model = msg.model;

      const usage = msg.usage;
      if (usage) {
        inputTokens += usage.input_tokens || 0;
        outputTokens += usage.output_tokens || 0;
        cacheCreationTokens += usage.cache_creation_input_tokens || 0;
        cacheReadTokens += usage.cache_read_input_tokens || 0;
      }
    }

    // Capture first user message text for teammate-message detection
    if (rec.type === "user" && firstUserText === null) {
      const msg = rec.message || rec.data?.message || {};
      const content = msg.content;
      if (typeof content === "string") {
        firstUserText = content;
      } else if (Array.isArray(content)) {
        for (const block of content) {
          if (typeof block === "string") {
            firstUserText = block;
            break;
          }
          if (block?.type === "text" && block.text) {
            firstUserText = block.text;
            break;
          }
        }
      }
    }
  }

  // Detect role from first user message
  if (firstUserText) {
    // Priority 1: <teammate-message summary="...">
    const summaryMatch = firstUserText.match(
      /<teammate-message\s[^>]*summary="([^"]+)"/,
    );
    if (summaryMatch) {
      role = summaryMatch[1];
    } else if (firstUserText.includes("<teammate-message")) {
      // Priority 2: teammate-message without summary — look for JSON payload
      const jsonStart = firstUserText.indexOf("{");
      if (jsonStart !== -1) {
        try {
          const payload = JSON.parse(
            firstUserText.slice(jsonStart, firstUserText.indexOf("\n", jsonStart) || undefined),
          );
          if (payload.type === "task_assignment" && payload.subject) {
            role = `task: ${payload.subject}`;
          } else if (payload.type === "shutdown_request") {
            role = "shutdown handler";
          } else if (payload.type) {
            role = payload.type;
          }
        } catch {
          // JSON parse failed, leave role null
        }
      }
    }
  }

  return {
    sessionId,
    agentId,
    slug,
    firstTimestamp,
    lastTimestamp,
    model,
    role,
    firstUserText: firstUserText?.slice(0, 150) || null,
    inputTokens,
    outputTokens,
    cacheCreationTokens,
    cacheReadTokens,
    turns,
  };
}

// ── Discover and analyze all sessions ────────────────────────────────────────

async function discoverSessions() {
  let entries;
  try {
    entries = await fs.readdir(PROJECT_DIR, { withFileTypes: true });
  } catch (err) {
    console.error(`Cannot read project directory: ${PROJECT_DIR}`);
    console.error(err.message);
    process.exit(1);
  }

  // Find main session JSONL files (UUID.jsonl at top level)
  const sessionFiles = entries
    .filter(
      (e) =>
        e.isFile() &&
        e.name.endsWith(".jsonl") &&
        /^[0-9a-f]{8}-/.test(e.name),
    )
    .map((e) => ({
      sessionId: e.name.replace(".jsonl", ""),
      mainPath: path.join(PROJECT_DIR, e.name),
    }));

  if (SESSION_FILTER) {
    const filtered = sessionFiles.filter((s) =>
      s.sessionId.startsWith(SESSION_FILTER),
    );
    if (filtered.length === 0) {
      console.error(`No session found matching: ${SESSION_FILTER}`);
      process.exit(1);
    }
    return filtered;
  }

  return sessionFiles;
}

async function analyzeSession(sessionInfo) {
  const { sessionId, mainPath } = sessionInfo;

  // Build role map from main session progress records and Task tool_use entries
  const { roleMap, taskCalls } = await buildRoleMap(mainPath);

  // Analyze main session
  const mainResult = await analyzeFile(mainPath);
  mainResult.role = "[lead]";
  mainResult.isLead = true;

  // Find subagent files
  const subagentDir = path.join(PROJECT_DIR, sessionId, "subagents");
  let subagentFiles = [];
  try {
    const subEntries = await fs.readdir(subagentDir);
    subagentFiles = subEntries
      .filter((f) => f.startsWith("agent-") && f.endsWith(".jsonl"))
      .map((f) => ({
        agentId: f.replace("agent-", "").replace(".jsonl", ""),
        path: path.join(subagentDir, f),
      }));
  } catch {
    // No subagents directory
  }

  // Analyze each subagent
  const subResults = [];
  for (const sub of subagentFiles) {
    const result = await analyzeFile(sub.path);
    if (result.turns === 0) continue; // Skip empty files

    // Detect context compaction agents by filename
    if (sub.agentId.startsWith("acompact-")) {
      result.role = "[compaction]";
    }

    // Apply role detection priority:
    // 1. teammate-message summary (set by analyzeFile)
    // 2. teammate-message JSON payload (set by analyzeFile)
    // 3. Context compaction agent (set above)
    // 4. progress record agentId → roleMap
    // 5. Match first user text against Task tool_use prompts
    // 6. "unknown"
    if (!result.role && roleMap.has(sub.agentId)) {
      result.role = roleMap.get(sub.agentId).role;
    }
    if (!result.role && result.firstUserText && taskCalls.length > 0) {
      const match = matchPromptToTask(result.firstUserText, taskCalls);
      if (match) {
        result.role = formatTaskRole(match);
      }
    }
    if (!result.role) {
      result.role = "unknown";
    }

    subResults.push(result);
  }

  // Sort subagents by total tokens (highest first)
  subResults.sort(
    (a, b) =>
      b.inputTokens +
      b.outputTokens -
      (a.inputTokens + a.outputTokens),
  );

  // Compute session totals
  const allAgents = [mainResult, ...subResults];
  const totals = allAgents.reduce(
    (acc, a) => ({
      inputTokens: acc.inputTokens + a.inputTokens,
      outputTokens: acc.outputTokens + a.outputTokens,
      cacheCreationTokens: acc.cacheCreationTokens + a.cacheCreationTokens,
      cacheReadTokens: acc.cacheReadTokens + a.cacheReadTokens,
      turns: acc.turns + a.turns,
    }),
    {
      inputTokens: 0,
      outputTokens: 0,
      cacheCreationTokens: 0,
      cacheReadTokens: 0,
      turns: 0,
    },
  );

  return {
    sessionId,
    slug: mainResult.slug,
    firstTimestamp: mainResult.firstTimestamp,
    lead: mainResult,
    agents: subResults,
    agentCount: subResults.length,
    totals,
  };
}

// ── Formatting helpers ───────────────────────────────────────────────────────

function fmt(n) {
  return n.toLocaleString("en-US");
}

function pad(s, len, align = "left") {
  const str = String(s);
  if (align === "right") return str.padStart(len);
  return str.padEnd(len);
}

function truncate(s, len) {
  if (!s) return "";
  return s.length > len ? s.slice(0, len - 3) + "..." : s;
}

// ── Console output ───────────────────────────────────────────────────────────

function printSessionSummary(sessions) {
  console.log("\n" + "=".repeat(100));
  console.log("  SESSION SUMMARY");
  console.log("=".repeat(100));

  const header = [
    pad("Session", 38),
    pad("Slug", 28),
    pad("Input", 12, "right"),
    pad("Output", 12, "right"),
    pad("Turns", 7, "right"),
    pad("Agents", 7, "right"),
  ].join("  ");
  console.log(header);
  console.log("-".repeat(100));

  for (const s of sessions) {
    const row = [
      pad(s.sessionId, 38),
      pad(truncate(s.slug || "", 26), 28),
      pad(fmt(s.totals.inputTokens), 12, "right"),
      pad(fmt(s.totals.outputTokens), 12, "right"),
      pad(fmt(s.totals.turns), 7, "right"),
      pad(fmt(s.agentCount), 7, "right"),
    ].join("  ");
    console.log(row);
  }
}

function printAgentBreakdown(sessions) {
  console.log("\n" + "=".repeat(110));
  console.log("  AGENT BREAKDOWN");
  console.log("=".repeat(110));

  for (const s of sessions) {
    console.log(
      `\n  Session: ${s.sessionId} (${s.slug || "no slug"})`,
    );

    const header = [
      pad("Role", 32),
      pad("Model", 28),
      pad("Input", 12, "right"),
      pad("Output", 12, "right"),
      pad("Turns", 7, "right"),
    ].join("  ");
    console.log("  " + header);
    console.log("  " + "-".repeat(106));

    const allAgents = [s.lead, ...s.agents];
    for (const a of allAgents) {
      const row = [
        pad(truncate(a.role || "unknown", 30), 32),
        pad(truncate(a.model || "?", 26), 28),
        pad(fmt(a.inputTokens), 12, "right"),
        pad(fmt(a.outputTokens), 12, "right"),
        pad(fmt(a.turns), 7, "right"),
      ].join("  ");
      console.log("  " + row);
    }
  }
}

function printModelTotals(sessions) {
  // Aggregate by model
  const byModel = new Map();

  for (const s of sessions) {
    const allAgents = [s.lead, ...s.agents];
    for (const a of allAgents) {
      const m = a.model || "unknown";
      if (!byModel.has(m)) {
        byModel.set(m, {
          inputTokens: 0,
          outputTokens: 0,
          cacheCreationTokens: 0,
          cacheReadTokens: 0,
          turns: 0,
          agents: 0,
        });
      }
      const totals = byModel.get(m);
      totals.inputTokens += a.inputTokens;
      totals.outputTokens += a.outputTokens;
      totals.cacheCreationTokens += a.cacheCreationTokens;
      totals.cacheReadTokens += a.cacheReadTokens;
      totals.turns += a.turns;
      totals.agents++;
    }
  }

  console.log("\n" + "=".repeat(120));
  console.log("  MODEL TOTALS");
  console.log("=".repeat(120));

  const header = [
    pad("Model", 32),
    pad("Input", 12, "right"),
    pad("Output", 12, "right"),
    pad("Cache-W", 12, "right"),
    pad("Cache-R", 12, "right"),
    pad("Turns", 8, "right"),
    pad("Agents", 8, "right"),
  ].join("  ");
  console.log(header);
  console.log("-".repeat(120));

  // Sort by total tokens desc
  const sorted = [...byModel.entries()].sort(
    (a, b) =>
      b[1].inputTokens + b[1].outputTokens -
      (a[1].inputTokens + a[1].outputTokens),
  );

  let grandTotal = {
    inputTokens: 0,
    outputTokens: 0,
    cacheCreationTokens: 0,
    cacheReadTokens: 0,
    turns: 0,
    agents: 0,
  };

  for (const [model, t] of sorted) {
    const row = [
      pad(truncate(model, 30), 32),
      pad(fmt(t.inputTokens), 12, "right"),
      pad(fmt(t.outputTokens), 12, "right"),
      pad(fmt(t.cacheCreationTokens), 12, "right"),
      pad(fmt(t.cacheReadTokens), 12, "right"),
      pad(fmt(t.turns), 8, "right"),
      pad(fmt(t.agents), 8, "right"),
    ].join("  ");
    console.log(row);
    grandTotal.inputTokens += t.inputTokens;
    grandTotal.outputTokens += t.outputTokens;
    grandTotal.cacheCreationTokens += t.cacheCreationTokens;
    grandTotal.cacheReadTokens += t.cacheReadTokens;
    grandTotal.turns += t.turns;
    grandTotal.agents += t.agents;
  }

  console.log("-".repeat(120));
  const totalRow = [
    pad("TOTAL", 32),
    pad(fmt(grandTotal.inputTokens), 12, "right"),
    pad(fmt(grandTotal.outputTokens), 12, "right"),
    pad(fmt(grandTotal.cacheCreationTokens), 12, "right"),
    pad(fmt(grandTotal.cacheReadTokens), 12, "right"),
    pad(fmt(grandTotal.turns), 8, "right"),
    pad(fmt(grandTotal.agents), 8, "right"),
  ].join("  ");
  console.log(totalRow);
}

// ── JSON report ──────────────────────────────────────────────────────────────

async function saveReport(sessions) {
  await fs.mkdir(REPORT_DIR, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = path.join(REPORT_DIR, `${timestamp}.json`);
  await fs.writeFile(reportPath, JSON.stringify(sessions, null, 2));
  console.log(`\nReport saved: ${reportPath}`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Scanning:", PROJECT_DIR);

  const sessionInfos = await discoverSessions();
  console.log(`Found ${sessionInfos.length} session(s)`);

  const sessions = [];
  for (const info of sessionInfos) {
    const result = await analyzeSession(info);
    if (result.totals.turns > 0) {
      sessions.push(result);
    }
  }

  // Sort by timestamp (newest first)
  sessions.sort((a, b) => {
    const ta = a.firstTimestamp || "";
    const tb = b.firstTimestamp || "";
    return tb.localeCompare(ta);
  });

  if (sessions.length === 0) {
    console.log("No sessions with token data found.");
    return;
  }

  if (!JSON_ONLY) {
    printSessionSummary(sessions);
    printAgentBreakdown(sessions);
    printModelTotals(sessions);
  }

  await saveReport(sessions);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
