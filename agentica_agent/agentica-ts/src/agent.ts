import { Agentica } from "@agentica/core";
import typia from "typia";
import dotenv from "dotenv";
import { OpenAI } from "openai";

// 함수들을 모듈로부터 가져오기
import * as project from "./functions/projectFunctions.js";
import * as lead from "./functions/leadFunctions.js";
import * as email from "./functions/emailFunctions.js";
import * as feedback from "./functions/feedbackFunctions.js";

dotenv.config({ override: true });

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
    api: openai, // 여기 타입 충돌 나면 버전 문제일 가능성 큼
    model: "gpt-4o",
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
