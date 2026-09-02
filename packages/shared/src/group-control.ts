import type { AuthorizedTomGroup, DisplayedTomGroup, GroupListFilter } from "@tom/types";

export interface ParsedGroupsCommand {
  matched: boolean;
  filter: GroupListFilter;
}

export interface GroupMembershipRecord {
  groupId: string;
  displayName: string | null;
  status: "ACTIVE" | "DISABLED";
  tomEnabled: boolean;
  tomAuthorized: boolean;
  userCanView: boolean;
  userCanManage: boolean;
}

export interface GroupControlRepository {
  findGroupsForUser(userId: string): Promise<GroupMembershipRecord[]>;
}

export interface ParsedGroupSelectionCommand {
  matched: boolean;
  reference: string;
}

export function parseGroupsCommand(text: string | null | undefined): ParsedGroupsCommand {
  const value = text?.trim() ?? "";
  const match = /^\/groups(?:\s+(active|disabled))?$/i.exec(value);

  if (!match) {
    return { matched: false, filter: "ALL" };
  }

  const [, filter] = match;
  if (filter?.toLowerCase() === "active") {
    return { matched: true, filter: "ACTIVE" };
  }

  if (filter?.toLowerCase() === "disabled") {
    return { matched: true, filter: "DISABLED" };
  }

  return { matched: true, filter: "ALL" };
}

export function parseGroupSelectionCommand(
  text: string | null | undefined,
): ParsedGroupSelectionCommand {
  const value = text?.trim() ?? "";
  const match = /^\/group\s+([1-9]\d{0,2})$/i.exec(value);

  if (!match?.[1]) {
    return { matched: false, reference: "" };
  }

  return { matched: true, reference: match[1] };
}

export async function listAuthorizedTomGroups(
  repository: GroupControlRepository,
  trustedUserId: string,
  filter: GroupListFilter = "ALL",
): Promise<AuthorizedTomGroup[]> {
  const memberships = await repository.findGroupsForUser(trustedUserId);

  return memberships
    .filter((record) => record.tomEnabled && record.tomAuthorized)
    .filter((record) => record.userCanView || record.userCanManage)
    .filter((record) => filter === "ALL" || record.status === filter)
    .map((record) => ({
      groupId: record.groupId,
      displayName: record.displayName?.trim() || "Unnamed group",
      status: record.status,
    }));
}

export function formatGroupsResponse(groups: AuthorizedTomGroup[]): string {
  if (groups.length === 0) {
    return "Your Tom Groups\n\nNo groups available.";
  }

  const lines = toDisplayedGroups(groups).flatMap((group) => [
    `${group.reference}. ${group.displayName}`,
    `   ${titleCase(group.status)}`,
    "",
  ]);

  return ["Your Tom Groups", "", ...lines].join("\n").trimEnd();
}

export function toDisplayedGroups(groups: AuthorizedTomGroup[]): DisplayedTomGroup[] {
  return groups.map((group, index) => ({
    reference: String(index + 1),
    displayName: group.displayName,
    status: group.status,
  }));
}

export function resolveDisplayedGroupReference(
  groups: AuthorizedTomGroup[],
  reference: string,
): string | null {
  const index = Number(reference);
  if (!Number.isInteger(index) || index < 1 || index > groups.length) {
    return null;
  }

  return groups[index - 1]?.groupId ?? null;
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}
