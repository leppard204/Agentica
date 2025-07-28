import { Agentica } from "@agentica/core";
import typia from "typia";
import dotenv from "dotenv";
import { OpenAI } from "openai";

// functions 폴더 경로 주의!
import * as project from "./functions/projectFunctions.js";
import * as lead from "./functions/leadFunctions.js";
import * as email from "./functions/emailFunctions.js";
import * as feedback from "./functions/feedbackFunctions.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// 모든 함수 통합해서 하나의 객체로 묶음
const allFunctions = {
  ...project,
  ...lead,
  ...email,
  ...feedback,
};

// Agentica 인스턴스 생성 (핵심)
export const agent = new Agentica({
  model: "chatgpt",
  vendor: {
    api: openai,
    model: "gpt-4o-mini",
  },
  controllers: [
    {
      name: "AutoSales Controller",
      protocol: "class",
      application: typia.llm.application<typeof allFunctions, "chatgpt">(),
      execute: allFunctions,
    },
  ],
});
