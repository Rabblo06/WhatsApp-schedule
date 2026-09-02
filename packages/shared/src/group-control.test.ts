import { describe, expect, it } from "vitest";
import {
  formatGroupsResponse,
  listAuthorizedTomGroups,
  parseGroupSelectionCommand,
  parseGroupsCommand,
  resolveDisplayedGroupReference,
  type GroupControlRepository,
} from "./group-control.js";

function repository(records: Awaited<ReturnType<GroupControlRepository["findGroupsForUser"]>>) {
  return {
    async findGroupsForUser() {
      return records;
    },
  } satisfies GroupControlRepository;
}

describe("group control", () => {
  it("parses /groups filters", () => {
    expect(parseGroupsCommand("/groups")).toEqual({ matched: true, filter: "ALL" });
    expect(parseGroupsCommand("/groups active")).toEqual({ matched: true, filter: "ACTIVE" });
    expect(parseGroupsCommand("/groups disabled")).toEqual({
      matched: true,
      filter: "DISABLED",
    });
    expect(parseGroupsCommand("/groups other")).toEqual({ matched: false, filter: "ALL" });
    expect(parseGroupSelectionCommand("/group 2")).toEqual({ matched: true, reference: "2" });
    expect(parseGroupSelectionCommand("/group immutable-id")).toEqual({
      matched: false,
      reference: "",
    });
  });

  it("lists only groups the trusted user may view or manage", async () => {
    const groups = await listAuthorizedTomGroups(
      repository([
        {
          groupId: "group-a",
          displayName: "Family Group",
          status: "ACTIVE",
          tomEnabled: true,
          tomAuthorized: true,
          userCanView: true,
          userCanManage: false,
        },
        {
          groupId: "group-b",
          displayName: "Other User Group",
          status: "ACTIVE",
          tomEnabled: true,
          tomAuthorized: true,
          userCanView: false,
          userCanManage: false,
        },
        {
          groupId: "group-c",
          displayName: "Not Enabled",
          status: "ACTIVE",
          tomEnabled: false,
          tomAuthorized: true,
          userCanView: true,
          userCanManage: true,
        },
      ]),
      "user-a",
    );

    expect(groups).toEqual([
      { groupId: "group-a", displayName: "Family Group", status: "ACTIVE" },
    ]);
  });

  it("proves User A cannot list User B unauthorized groups", async () => {
    const userARepo = repository([
      {
        groupId: "user-a-group",
        displayName: "A Friends",
        status: "ACTIVE",
        tomEnabled: true,
        tomAuthorized: true,
        userCanView: true,
        userCanManage: true,
      },
    ]);

    const userBRepo = repository([
      {
        groupId: "user-b-group",
        displayName: "B Family",
        status: "ACTIVE",
        tomEnabled: true,
        tomAuthorized: true,
        userCanView: true,
        userCanManage: true,
      },
    ]);

    const userAGroups = await listAuthorizedTomGroups(userARepo, "user-a");
    const userBGroups = await listAuthorizedTomGroups(userBRepo, "user-b");

    expect(userAGroups.map((group) => group.groupId)).toEqual(["user-a-group"]);
    expect(userAGroups.map((group) => group.groupId)).not.toContain(userBGroups[0]?.groupId);
  });

  it("filters active and disabled groups", async () => {
    const records = repository([
      {
        groupId: "active-group",
        displayName: "Active",
        status: "ACTIVE",
        tomEnabled: true,
        tomAuthorized: true,
        userCanView: true,
        userCanManage: false,
      },
      {
        groupId: "disabled-group",
        displayName: "Disabled",
        status: "DISABLED",
        tomEnabled: true,
        tomAuthorized: true,
        userCanView: true,
        userCanManage: false,
      },
    ]);

    expect((await listAuthorizedTomGroups(records, "user-a", "ACTIVE")).map((group) => group.groupId)).toEqual([
      "active-group",
    ]);
    expect((await listAuthorizedTomGroups(records, "user-a", "DISABLED")).map((group) => group.groupId)).toEqual([
      "disabled-group",
    ]);
  });

  it("does not expose immutable group IDs in normal responses", () => {
    const groups = [
      { groupId: "immutable-family-id", displayName: "Family Group", status: "ACTIVE" as const },
      { groupId: "immutable-uni-id", displayName: "Uni Friends", status: "DISABLED" as const },
    ];

    expect(formatGroupsResponse(groups)).toContain("1. Family Group");
    expect(formatGroupsResponse(groups)).not.toContain("immutable-family-id");
  });

  it("resolves displayed numeric references through the trusted list only", () => {
    const groups = [
      { groupId: "authorized-family-id", displayName: "Family Group", status: "ACTIVE" as const },
      { groupId: "authorized-uni-id", displayName: "Uni Friends", status: "DISABLED" as const },
    ];

    expect(resolveDisplayedGroupReference(groups, "2")).toBe("authorized-uni-id");
    expect(resolveDisplayedGroupReference(groups, "3")).toBeNull();
    expect(resolveDisplayedGroupReference(groups, "unauthorized-group-id")).toBeNull();
  });

  it("prevents numeric reference manipulation from escaping the authorized list", () => {
    const userAVisibleGroups = [
      { groupId: "group-a", displayName: "A Group", status: "ACTIVE" as const },
    ];

    expect(resolveDisplayedGroupReference(userAVisibleGroups, "2")).toBeNull();
    expect(resolveDisplayedGroupReference(userAVisibleGroups, "999")).toBeNull();
    expect(resolveDisplayedGroupReference(userAVisibleGroups, "group-b")).toBeNull();
  });
});
