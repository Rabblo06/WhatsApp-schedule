import { describe, expect, it } from "vitest";
import { formatGroupsResponse, listAuthorizedTomGroups, type GroupControlRepository } from "@tom/shared";

const records = [
  {
    groupId: "group-user-a-family",
    displayName: "Family Group",
    status: "ACTIVE" as const,
    tomEnabled: true,
    tomAuthorized: true,
    userCanView: true,
    userCanManage: false,
  },
  {
    groupId: "group-user-a-uni",
    displayName: "Uni Friends",
    status: "DISABLED" as const,
    tomEnabled: true,
    tomAuthorized: true,
    userCanView: true,
    userCanManage: true,
  },
  {
    groupId: "group-user-b-private",
    displayName: "B Only",
    status: "ACTIVE" as const,
    tomEnabled: true,
    tomAuthorized: true,
    userCanView: false,
    userCanManage: false,
  },
];

describe("/groups authorization", () => {
  it("User A cannot list User B unauthorized groups", async () => {
    const repository: GroupControlRepository = {
      async findGroupsForUser(userId: string) {
        expect(userId).toBe("user-a");
        return records;
      },
    };

    const groups = await listAuthorizedTomGroups(repository, "user-a");

    expect(groups.map((group) => group.groupId)).toEqual([
      "group-user-a-family",
      "group-user-a-uni",
    ]);
    expect(groups.map((group) => group.groupId)).not.toContain("group-user-b-private");
  });

  it("does not expose immutable group IDs in the private response", async () => {
    const response = formatGroupsResponse([
      {
        groupId: "immutable-group-id",
        displayName: "Friends",
        status: "ACTIVE",
      },
    ]);

    expect(response).toContain("Friends");
    expect(response).not.toContain("immutable-group-id");
  });
});
