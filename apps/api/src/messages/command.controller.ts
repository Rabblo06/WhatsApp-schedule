import { Body, Controller, Post } from "@nestjs/common";
import { parseTomCommand } from "@tom/shared";
import { z } from "zod";

const commandSchema = z.object({
  text: z.string().optional(),
});

@Controller("messages")
export class CommandController {
  @Post("classify")
  classify(@Body() body: unknown) {
    const input = commandSchema.parse(body);
    const command = parseTomCommand(input.text);

    return {
      ...command,
      invokesAi: command.kind === "TOM",
    };
  }
}
