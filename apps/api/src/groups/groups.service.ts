import { Injectable } from "@nestjs/common";
import { prisma, type Prisma } from "@tom/database";
import {
  formatGroupsResponse,
  listAuthorizedTomGroups,
  resolveDisplayedGroupReference,
  type GroupControlRepository,
  type GroupMembershipRecord,
} from "@tom/shared";
import type { GroupListFilter } from "@tom/types";

type GroupMemberWithGroup = Prisma.GroupMemberGetPayload<{
  include: { group: true };
}>;

@Injectable()
export class GroupsService {
  private readonly repository: GroupControlRepository = {
    async findGroupsForUser(userId: string): Promise<GroupMembershipRecord[]> {
      const memberships: GroupMemberWithGroup[] = await prisma.groupMember.findMany({
        where: {
          userId,
          leftAt: null,
          OR: [{ canView: true }, { canManage: true }],
          group: {
            tomEnabled: true,
            tomAuthorized: true,
          },
        },
        include: {
          group: true,
        },
        orderBy: {
          joinedAt: "asc",
        },
      });

      return memberships.map((membership) => ({
        groupId: membership.group.id,
        displayName: membership.group.name,
        status: membership.group.status,
        tomEnabled: membership.group.tomEnabled,
        tomAuthorized: membership.group.tomAuthorized,
        userCanView: membership.canView,
        userCanManage: membership.canManage,
      }));
    },
  };

  async listGroupsForTrustedUser(
    trustedUserId: string,
    filter: GroupListFilter = "ALL",
  ): Promise<string> {
    const groups = await listAuthorizedTomGroups(this.repository, trustedUserId, filter);
    return formatGroupsResponse(groups);
  }

  async resolveGroupReferenceForTrustedUser(
    trustedUserId: string,
    reference: string,
  ): Promise<string | null> {
    const groups = await listAuthorizedTomGroups(this.repository, trustedUserId, "ALL");
    return resolveDisplayedGroupReference(groups, reference);
  }
}
