import { Agentica } from "@agentica/core";
import typia from "typia";
import dotenv from "dotenv";
import { OpenAI } from "openai";

import * as project from "./functions/projectFunctions.js";
import * as lead from "./functions/leadFunctions.js";
import * as email from "./functions/emailFunctions.js";
import * as feedback from "./functions/feedbackFunctions.js";

dotenv.config({ override: true });

const allFunctions = {
  ...project,
  ...lead,
  ...email,
  ...feedback
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const agent = new Agentica({
  model: "chatgpt",
  vendor: {
    api: openai,
    model: "gpt-4o"
  },
  controllers: [
    {
      name: "AutoSales Controller",
      protocol: "class",
      application: typia.llm.application<typeof allFunctions, "chatgpt">(),
      execute: {
        ...project,
        ...lead,
        ...email,
        ...feedback
      },
    },
  ],
});
