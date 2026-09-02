import { Body, Controller, ForbiddenException, Post } from "@nestjs/common";
import { parseGroupSelectionCommand, parseGroupsCommand } from "@tom/shared";
import { z } from "zod";
import { GroupsService } from "./groups.service.js";

const groupsCommandSchema = z.object({
  text: z.string(),
  trustedUserId: z.string().min(1),
  trustedConversationType: z.enum(["PRIVATE_TOM", "GROUP"]),
});

@Controller("groups")
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post("control")
  async control(@Body() body: unknown) {
    const input = groupsCommandSchema.parse(body);
    if (input.trustedConversationType !== "PRIVATE_TOM") {
      throw new ForbiddenException("/groups is only available in a private Tom chat");
    }

    const command = parseGroupsCommand(input.text);
    const selection = parseGroupSelectionCommand(input.text);

    if (selection.matched) {
      const resolved = await this.groupsService.resolveGroupReferenceForTrustedUser(
        input.trustedUserId,
        selection.reference,
      );

      if (!resolved) {
        throw new ForbiddenException("Group reference is not available to this user");
      }

      return {
        handled: true,
        response: `Group ${selection.reference} selected.`,
      };
    }

    if (!command.matched) {
      return {
        handled: false,
        response: "Unknown group command.",
      };
    }

    return {
      handled: true,
      response: await this.groupsService.listGroupsForTrustedUser(
        input.trustedUserId,
        command.filter,
      ),
    };
  }
}
