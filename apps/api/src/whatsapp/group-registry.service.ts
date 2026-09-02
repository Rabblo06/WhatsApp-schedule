import { Injectable } from "@nestjs/common";
import { prisma } from "@tom/database";

export interface RegisterVerifiedGroupInput {
  providerExternalId: string;
  name?: string;
  tomAuthorized: boolean;
  tomEnabled?: boolean;
  members?: Array<{
    userId: string;
    canView?: boolean;
    canManage?: boolean;
  }>;
}

@Injectable()
export class GroupRegistryService {
  async registerVerifiedGroup(input: RegisterVerifiedGroupInput): Promise<{ groupId: string }> {
    const group = await prisma.group.upsert({
      where: { externalId: input.providerExternalId },
      update: {
        name: input.name,
        tomAuthorized: input.tomAuthorized,
        tomEnabled: input.tomEnabled ?? input.tomAuthorized,
      },
      create: {
        externalId: input.providerExternalId,
        name: input.name,
        tomAuthorized: input.tomAuthorized,
        tomEnabled: input.tomEnabled ?? input.tomAuthorized,
      },
    });

    for (const member of input.members ?? []) {
      await prisma.groupMember.upsert({
        where: {
          groupId_userId: {
            groupId: group.id,
            userId: member.userId,
          },
        },
        update: {
          canView: member.canView ?? true,
          canManage: member.canManage ?? false,
          leftAt: null,
        },
        create: {
          groupId: group.id,
          userId: member.userId,
          canView: member.canView ?? true,
          canManage: member.canManage ?? false,
        },
      });
    }

    return { groupId: group.id };
  }
}
