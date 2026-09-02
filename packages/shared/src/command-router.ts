import type { TomCommandKind } from "@tom/types";
import { parseGroupSelectionCommand, parseGroupsCommand } from "./group-control.js";

export interface ParsedCommand {
  kind: TomCommandKind;
  prompt: string;
}

const naturalTomPattern = /^tom(?:\s+|[:,.!?]\s*)(?<prompt>[\s\S]*)$/i;

export function parseTomCommand(text: string | null | undefined): ParsedCommand {
  const value = text?.trim() ?? "";

  if (value.length === 0) {
    return { kind: "ORDINARY", prompt: "" };
  }

  if (/^\/store(?:\s|$)/i.test(value)) {
    return { kind: "STORE", prompt: value.replace(/^\/store/i, "").trim() };
  }

  const groupsCommand = parseGroupsCommand(value);
  if (groupsCommand.matched) {
    return { kind: "GROUPS", prompt: groupsCommand.filter.toLowerCase() };
  }

  const groupSelection = parseGroupSelectionCommand(value);
  if (groupSelection.matched) {
    return { kind: "GROUP_SELECT", prompt: groupSelection.reference };
  }

  if (/^\/tom(?:\s|$)/i.test(value)) {
    return { kind: "TOM", prompt: value.replace(/^\/tom/i, "").trim() };
  }

  const natural = naturalTomPattern.exec(value);
  if (natural?.groups?.prompt !== undefined) {
    return { kind: "TOM", prompt: natural.groups.prompt.trim() };
  }

  return { kind: "ORDINARY", prompt: value };
}

export function shouldInvokeAi(text: string | null | undefined): boolean {
  return parseTomCommand(text).kind === "TOM";
}
