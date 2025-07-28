import * as __typia_transform__validateReport from "typia/lib/internal/_validateReport.js";
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
    apiKey: process.env.OPENAI_API_KEY,
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
            application: {
                model: "chatgpt",
                options: {
                    reference: true,
                    strict: false,
                    separate: null
                },
                functions: [
                    {
                        name: "summarizeFeedback",
                        parameters: {
                            type: "object",
                            properties: {
                                feedbackText: {
                                    type: "string"
                                },
                                projectId: {
                                    type: "number"
                                },
                                leadId: {
                                    type: "number"
                                },
                                emailId: {
                                    type: "number"
                                }
                            },
                            required: [
                                "feedbackText",
                                "projectId",
                                "leadId",
                                "emailId"
                            ],
                            additionalProperties: false,
                            $defs: {}
                        },
                        output: {
                            type: "object",
                            properties: {
                                summary: {
                                    type: "string"
                                },
                                responseType: {
                                    type: "string"
                                },
                                status: {
                                    type: "string"
                                }
                            },
                            required: [
                                "summary",
                                "responseType",
                                "status"
                            ]
                        },
                        validate: (() => { const _io0 = input => "string" === typeof input.feedbackText && "number" === typeof input.projectId && "number" === typeof input.leadId && "number" === typeof input.emailId; const _vo0 = (input, _path, _exceptionable = true) => ["string" === typeof input.feedbackText || _report(_exceptionable, {
                                path: _path + ".feedbackText",
                                expected: "string",
                                value: input.feedbackText
                            }), "number" === typeof input.projectId || _report(_exceptionable, {
                                path: _path + ".projectId",
                                expected: "number",
                                value: input.projectId
                            }), "number" === typeof input.leadId || _report(_exceptionable, {
                                path: _path + ".leadId",
                                expected: "number",
                                value: input.leadId
                            }), "number" === typeof input.emailId || _report(_exceptionable, {
                                path: _path + ".emailId",
                                expected: "number",
                                value: input.emailId
                            })].every(flag => flag); const __is = input => "object" === typeof input && null !== input && _io0(input); let errors; let _report; return input => {
                            if (false === __is(input)) {
                                errors = [];
                                _report = __typia_transform__validateReport._validateReport(errors);
                                ((input, _path, _exceptionable = true) => ("object" === typeof input && null !== input || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                })) && _vo0(input, _path + "", true) || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                }))(input, "$input", true);
                                const success = 0 === errors.length;
                                return success ? {
                                    success,
                                    data: input
                                } : {
                                    success,
                                    errors,
                                    data: input
                                };
                            }
                            return {
                                success: true,
                                data: input
                            };
                        }; })()
                    },
                    {
                        name: "analyzeEmailIssues",
                        parameters: {
                            type: "object",
                            properties: {
                                emailContent: {
                                    type: "object",
                                    properties: {
                                        subject: {
                                            type: "string"
                                        },
                                        body: {
                                            type: "string"
                                        }
                                    },
                                    required: [
                                        "subject",
                                        "body"
                                    ]
                                },
                                userFeedback: {
                                    type: "string"
                                }
                            },
                            required: [
                                "emailContent",
                                "userFeedback"
                            ],
                            additionalProperties: false,
                            $defs: {}
                        },
                        output: {
                            type: "object",
                            properties: {
                                issues: {
                                    type: "array",
                                    items: {
                                        type: "string"
                                    }
                                },
                                suggestions: {
                                    type: "array",
                                    items: {
                                        type: "string"
                                    }
                                },
                                priority: {
                                    type: "string",
                                    "enum": [
                                        "high",
                                        "medium",
                                        "low"
                                    ]
                                }
                            },
                            required: [
                                "issues",
                                "suggestions",
                                "priority"
                            ]
                        },
                        validate: (() => { const _io0 = input => "object" === typeof input.emailContent && null !== input.emailContent && _io1(input.emailContent) && "string" === typeof input.userFeedback; const _io1 = input => "string" === typeof input.subject && "string" === typeof input.body; const _vo0 = (input, _path, _exceptionable = true) => [("object" === typeof input.emailContent && null !== input.emailContent || _report(_exceptionable, {
                                path: _path + ".emailContent",
                                expected: "__type.o1",
                                value: input.emailContent
                            })) && _vo1(input.emailContent, _path + ".emailContent", true && _exceptionable) || _report(_exceptionable, {
                                path: _path + ".emailContent",
                                expected: "__type.o1",
                                value: input.emailContent
                            }), "string" === typeof input.userFeedback || _report(_exceptionable, {
                                path: _path + ".userFeedback",
                                expected: "string",
                                value: input.userFeedback
                            })].every(flag => flag); const _vo1 = (input, _path, _exceptionable = true) => ["string" === typeof input.subject || _report(_exceptionable, {
                                path: _path + ".subject",
                                expected: "string",
                                value: input.subject
                            }), "string" === typeof input.body || _report(_exceptionable, {
                                path: _path + ".body",
                                expected: "string",
                                value: input.body
                            })].every(flag => flag); const __is = input => "object" === typeof input && null !== input && _io0(input); let errors; let _report; return input => {
                            if (false === __is(input)) {
                                errors = [];
                                _report = __typia_transform__validateReport._validateReport(errors);
                                ((input, _path, _exceptionable = true) => ("object" === typeof input && null !== input || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                })) && _vo0(input, _path + "", true) || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                }))(input, "$input", true);
                                const success = 0 === errors.length;
                                return success ? {
                                    success,
                                    data: input
                                } : {
                                    success,
                                    errors,
                                    data: input
                                };
                            }
                            return {
                                success: true,
                                data: input
                            };
                        }; })()
                    },
                    {
                        name: "regenerateEmailWithFeedback",
                        parameters: {
                            type: "object",
                            properties: {
                                projectId: {
                                    type: "number"
                                },
                                leadInfo: {
                                    $ref: "#/$defs/Lead"
                                },
                                originalEmail: {
                                    type: "object",
                                    properties: {
                                        subject: {
                                            type: "string"
                                        },
                                        body: {
                                            type: "string"
                                        }
                                    },
                                    required: [
                                        "subject",
                                        "body"
                                    ]
                                },
                                userFeedback: {
                                    type: "string"
                                },
                                emailType: {
                                    type: "string",
                                    "enum": [
                                        "initial",
                                        "followup"
                                    ]
                                }
                            },
                            required: [
                                "projectId",
                                "leadInfo",
                                "originalEmail",
                                "userFeedback"
                            ],
                            additionalProperties: false,
                            $defs: {
                                Lead: {
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "number"
                                        },
                                        name: {
                                            type: "string"
                                        },
                                        industry: {
                                            type: "string"
                                        },
                                        size: {
                                            type: "string"
                                        },
                                        language: {
                                            type: "string",
                                            "enum": [
                                                "KO",
                                                "EN",
                                                "JP"
                                            ]
                                        },
                                        contactName: {
                                            type: "string"
                                        },
                                        contactEmail: {
                                            type: "string"
                                        },
                                        createdAt: {
                                            type: "string"
                                        },
                                        isActive: {
                                            type: "boolean"
                                        }
                                    },
                                    required: [
                                        "id",
                                        "name",
                                        "industry",
                                        "contactEmail",
                                        "createdAt"
                                    ]
                                },
                                EmailResult: {
                                    type: "object",
                                    properties: {
                                        subject: {
                                            type: "string"
                                        },
                                        body: {
                                            type: "string"
                                        },
                                        lead: {
                                            $ref: "#/$defs/Lead"
                                        },
                                        status: {
                                            type: "string",
                                            "enum": [
                                                "success",
                                                "error"
                                            ]
                                        },
                                        error: {
                                            type: "string"
                                        }
                                    },
                                    required: [
                                        "subject",
                                        "body",
                                        "status"
                                    ]
                                }
                            }
                        },
                        output: {
                            $ref: "#/$defs/EmailResult"
                        },
                        validate: (() => { const _io0 = input => "number" === typeof input.projectId && ("object" === typeof input.leadInfo && null !== input.leadInfo && _io1(input.leadInfo)) && ("object" === typeof input.originalEmail && null !== input.originalEmail && _io2(input.originalEmail)) && "string" === typeof input.userFeedback && (undefined === input.emailType || "initial" === input.emailType || "followup" === input.emailType); const _io1 = input => "number" === typeof input.id && "string" === typeof input.name && "string" === typeof input.industry && (undefined === input.size || "string" === typeof input.size) && (undefined === input.language || "KO" === input.language || "EN" === input.language || "JP" === input.language) && (undefined === input.contactName || "string" === typeof input.contactName) && "string" === typeof input.contactEmail && "string" === typeof input.createdAt && (undefined === input.isActive || "boolean" === typeof input.isActive); const _io2 = input => "string" === typeof input.subject && "string" === typeof input.body; const _vo0 = (input, _path, _exceptionable = true) => ["number" === typeof input.projectId || _report(_exceptionable, {
                                path: _path + ".projectId",
                                expected: "number",
                                value: input.projectId
                            }), ("object" === typeof input.leadInfo && null !== input.leadInfo || _report(_exceptionable, {
                                path: _path + ".leadInfo",
                                expected: "Lead",
                                value: input.leadInfo
                            })) && _vo1(input.leadInfo, _path + ".leadInfo", true && _exceptionable) || _report(_exceptionable, {
                                path: _path + ".leadInfo",
                                expected: "Lead",
                                value: input.leadInfo
                            }), ("object" === typeof input.originalEmail && null !== input.originalEmail || _report(_exceptionable, {
                                path: _path + ".originalEmail",
                                expected: "__type.o1",
                                value: input.originalEmail
                            })) && _vo2(input.originalEmail, _path + ".originalEmail", true && _exceptionable) || _report(_exceptionable, {
                                path: _path + ".originalEmail",
                                expected: "__type.o1",
                                value: input.originalEmail
                            }), "string" === typeof input.userFeedback || _report(_exceptionable, {
                                path: _path + ".userFeedback",
                                expected: "string",
                                value: input.userFeedback
                            }), undefined === input.emailType || "initial" === input.emailType || "followup" === input.emailType || _report(_exceptionable, {
                                path: _path + ".emailType",
                                expected: "(\"followup\" | \"initial\" | undefined)",
                                value: input.emailType
                            })].every(flag => flag); const _vo1 = (input, _path, _exceptionable = true) => ["number" === typeof input.id || _report(_exceptionable, {
                                path: _path + ".id",
                                expected: "number",
                                value: input.id
                            }), "string" === typeof input.name || _report(_exceptionable, {
                                path: _path + ".name",
                                expected: "string",
                                value: input.name
                            }), "string" === typeof input.industry || _report(_exceptionable, {
                                path: _path + ".industry",
                                expected: "string",
                                value: input.industry
                            }), undefined === input.size || "string" === typeof input.size || _report(_exceptionable, {
                                path: _path + ".size",
                                expected: "(string | undefined)",
                                value: input.size
                            }), undefined === input.language || "KO" === input.language || "EN" === input.language || "JP" === input.language || _report(_exceptionable, {
                                path: _path + ".language",
                                expected: "(\"EN\" | \"JP\" | \"KO\" | undefined)",
                                value: input.language
                            }), undefined === input.contactName || "string" === typeof input.contactName || _report(_exceptionable, {
                                path: _path + ".contactName",
                                expected: "(string | undefined)",
                                value: input.contactName
                            }), "string" === typeof input.contactEmail || _report(_exceptionable, {
                                path: _path + ".contactEmail",
                                expected: "string",
                                value: input.contactEmail
                            }), "string" === typeof input.createdAt || _report(_exceptionable, {
                                path: _path + ".createdAt",
                                expected: "string",
                                value: input.createdAt
                            }), undefined === input.isActive || "boolean" === typeof input.isActive || _report(_exceptionable, {
                                path: _path + ".isActive",
                                expected: "(boolean | undefined)",
                                value: input.isActive
                            })].every(flag => flag); const _vo2 = (input, _path, _exceptionable = true) => ["string" === typeof input.subject || _report(_exceptionable, {
                                path: _path + ".subject",
                                expected: "string",
                                value: input.subject
                            }), "string" === typeof input.body || _report(_exceptionable, {
                                path: _path + ".body",
                                expected: "string",
                                value: input.body
                            })].every(flag => flag); const __is = input => "object" === typeof input && null !== input && _io0(input); let errors; let _report; return input => {
                            if (false === __is(input)) {
                                errors = [];
                                _report = __typia_transform__validateReport._validateReport(errors);
                                ((input, _path, _exceptionable = true) => ("object" === typeof input && null !== input || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                })) && _vo0(input, _path + "", true) || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                }))(input, "$input", true);
                                const success = 0 === errors.length;
                                return success ? {
                                    success,
                                    data: input
                                } : {
                                    success,
                                    errors,
                                    data: input
                                };
                            }
                            return {
                                success: true,
                                data: input
                            };
                        }; })()
                    },
                    {
                        name: "handleEmailRejection",
                        parameters: {
                            type: "object",
                            properties: {
                                projectId: {
                                    type: "number"
                                },
                                leadInfo: {
                                    $ref: "#/$defs/Lead"
                                },
                                originalEmail: {
                                    type: "object",
                                    properties: {
                                        subject: {
                                            type: "string"
                                        },
                                        body: {
                                            type: "string"
                                        }
                                    },
                                    required: [
                                        "subject",
                                        "body"
                                    ]
                                },
                                userFeedback: {
                                    type: "string"
                                },
                                emailType: {
                                    type: "string",
                                    "enum": [
                                        "initial",
                                        "followup"
                                    ]
                                }
                            },
                            required: [
                                "projectId",
                                "leadInfo",
                                "originalEmail",
                                "userFeedback"
                            ],
                            additionalProperties: false,
                            $defs: {
                                Lead: {
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "number"
                                        },
                                        name: {
                                            type: "string"
                                        },
                                        industry: {
                                            type: "string"
                                        },
                                        size: {
                                            type: "string"
                                        },
                                        language: {
                                            type: "string",
                                            "enum": [
                                                "KO",
                                                "EN",
                                                "JP"
                                            ]
                                        },
                                        contactName: {
                                            type: "string"
                                        },
                                        contactEmail: {
                                            type: "string"
                                        },
                                        createdAt: {
                                            type: "string"
                                        },
                                        isActive: {
                                            type: "boolean"
                                        }
                                    },
                                    required: [
                                        "id",
                                        "name",
                                        "industry",
                                        "contactEmail",
                                        "createdAt"
                                    ]
                                },
                                EmailResult: {
                                    type: "object",
                                    properties: {
                                        subject: {
                                            type: "string"
                                        },
                                        body: {
                                            type: "string"
                                        },
                                        lead: {
                                            $ref: "#/$defs/Lead"
                                        },
                                        status: {
                                            type: "string",
                                            "enum": [
                                                "success",
                                                "error"
                                            ]
                                        },
                                        error: {
                                            type: "string"
                                        }
                                    },
                                    required: [
                                        "subject",
                                        "body",
                                        "status"
                                    ]
                                }
                            }
                        },
                        output: {
                            type: "object",
                            properties: {
                                action: {
                                    type: "string",
                                    "enum": [
                                        "regenerate",
                                        "improve"
                                    ]
                                },
                                newEmail: {
                                    $ref: "#/$defs/EmailResult"
                                },
                                analysis: {
                                    type: "object",
                                    properties: {
                                        issues: {
                                            type: "array",
                                            items: {
                                                type: "string"
                                            }
                                        },
                                        suggestions: {
                                            type: "array",
                                            items: {
                                                type: "string"
                                            }
                                        },
                                        priority: {
                                            type: "string"
                                        }
                                    },
                                    required: [
                                        "issues",
                                        "suggestions",
                                        "priority"
                                    ]
                                },
                                improvements: {
                                    type: "array",
                                    items: {
                                        type: "string"
                                    }
                                },
                                message: {
                                    type: "string"
                                }
                            },
                            required: [
                                "action",
                                "newEmail",
                                "analysis",
                                "improvements",
                                "message"
                            ]
                        },
                        validate: (() => { const _io0 = input => "number" === typeof input.projectId && ("object" === typeof input.leadInfo && null !== input.leadInfo && _io1(input.leadInfo)) && ("object" === typeof input.originalEmail && null !== input.originalEmail && _io2(input.originalEmail)) && "string" === typeof input.userFeedback && (undefined === input.emailType || "initial" === input.emailType || "followup" === input.emailType); const _io1 = input => "number" === typeof input.id && "string" === typeof input.name && "string" === typeof input.industry && (undefined === input.size || "string" === typeof input.size) && (undefined === input.language || "KO" === input.language || "EN" === input.language || "JP" === input.language) && (undefined === input.contactName || "string" === typeof input.contactName) && "string" === typeof input.contactEmail && "string" === typeof input.createdAt && (undefined === input.isActive || "boolean" === typeof input.isActive); const _io2 = input => "string" === typeof input.subject && "string" === typeof input.body; const _vo0 = (input, _path, _exceptionable = true) => ["number" === typeof input.projectId || _report(_exceptionable, {
                                path: _path + ".projectId",
                                expected: "number",
                                value: input.projectId
                            }), ("object" === typeof input.leadInfo && null !== input.leadInfo || _report(_exceptionable, {
                                path: _path + ".leadInfo",
                                expected: "Lead",
                                value: input.leadInfo
                            })) && _vo1(input.leadInfo, _path + ".leadInfo", true && _exceptionable) || _report(_exceptionable, {
                                path: _path + ".leadInfo",
                                expected: "Lead",
                                value: input.leadInfo
                            }), ("object" === typeof input.originalEmail && null !== input.originalEmail || _report(_exceptionable, {
                                path: _path + ".originalEmail",
                                expected: "__type.o1",
                                value: input.originalEmail
                            })) && _vo2(input.originalEmail, _path + ".originalEmail", true && _exceptionable) || _report(_exceptionable, {
                                path: _path + ".originalEmail",
                                expected: "__type.o1",
                                value: input.originalEmail
                            }), "string" === typeof input.userFeedback || _report(_exceptionable, {
                                path: _path + ".userFeedback",
                                expected: "string",
                                value: input.userFeedback
                            }), undefined === input.emailType || "initial" === input.emailType || "followup" === input.emailType || _report(_exceptionable, {
                                path: _path + ".emailType",
                                expected: "(\"followup\" | \"initial\" | undefined)",
                                value: input.emailType
                            })].every(flag => flag); const _vo1 = (input, _path, _exceptionable = true) => ["number" === typeof input.id || _report(_exceptionable, {
                                path: _path + ".id",
                                expected: "number",
                                value: input.id
                            }), "string" === typeof input.name || _report(_exceptionable, {
                                path: _path + ".name",
                                expected: "string",
                                value: input.name
                            }), "string" === typeof input.industry || _report(_exceptionable, {
                                path: _path + ".industry",
                                expected: "string",
                                value: input.industry
                            }), undefined === input.size || "string" === typeof input.size || _report(_exceptionable, {
                                path: _path + ".size",
                                expected: "(string | undefined)",
                                value: input.size
                            }), undefined === input.language || "KO" === input.language || "EN" === input.language || "JP" === input.language || _report(_exceptionable, {
                                path: _path + ".language",
                                expected: "(\"EN\" | \"JP\" | \"KO\" | undefined)",
                                value: input.language
                            }), undefined === input.contactName || "string" === typeof input.contactName || _report(_exceptionable, {
                                path: _path + ".contactName",
                                expected: "(string | undefined)",
                                value: input.contactName
                            }), "string" === typeof input.contactEmail || _report(_exceptionable, {
                                path: _path + ".contactEmail",
                                expected: "string",
                                value: input.contactEmail
                            }), "string" === typeof input.createdAt || _report(_exceptionable, {
                                path: _path + ".createdAt",
                                expected: "string",
                                value: input.createdAt
                            }), undefined === input.isActive || "boolean" === typeof input.isActive || _report(_exceptionable, {
                                path: _path + ".isActive",
                                expected: "(boolean | undefined)",
                                value: input.isActive
                            })].every(flag => flag); const _vo2 = (input, _path, _exceptionable = true) => ["string" === typeof input.subject || _report(_exceptionable, {
                                path: _path + ".subject",
                                expected: "string",
                                value: input.subject
                            }), "string" === typeof input.body || _report(_exceptionable, {
                                path: _path + ".body",
                                expected: "string",
                                value: input.body
                            })].every(flag => flag); const __is = input => "object" === typeof input && null !== input && _io0(input); let errors; let _report; return input => {
                            if (false === __is(input)) {
                                errors = [];
                                _report = __typia_transform__validateReport._validateReport(errors);
                                ((input, _path, _exceptionable = true) => ("object" === typeof input && null !== input || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                })) && _vo0(input, _path + "", true) || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                }))(input, "$input", true);
                                const success = 0 === errors.length;
                                return success ? {
                                    success,
                                    data: input
                                } : {
                                    success,
                                    errors,
                                    data: input
                                };
                            }
                            return {
                                success: true,
                                data: input
                            };
                        }; })()
                    },
                    {
                        name: "generateEmailsForMultipleLeads",
                        parameters: {
                            type: "object",
                            properties: {
                                projectId: {
                                    type: "number"
                                },
                                leadInfoList: {
                                    type: "array",
                                    items: {
                                        $ref: "#/$defs/Lead"
                                    }
                                }
                            },
                            required: [
                                "projectId",
                                "leadInfoList"
                            ],
                            additionalProperties: false,
                            $defs: {
                                Lead: {
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "number"
                                        },
                                        name: {
                                            type: "string"
                                        },
                                        industry: {
                                            type: "string"
                                        },
                                        size: {
                                            type: "string"
                                        },
                                        language: {
                                            type: "string",
                                            "enum": [
                                                "KO",
                                                "EN",
                                                "JP"
                                            ]
                                        },
                                        contactName: {
                                            type: "string"
                                        },
                                        contactEmail: {
                                            type: "string"
                                        },
                                        createdAt: {
                                            type: "string"
                                        },
                                        isActive: {
                                            type: "boolean"
                                        }
                                    },
                                    required: [
                                        "id",
                                        "name",
                                        "industry",
                                        "contactEmail",
                                        "createdAt"
                                    ]
                                },
                                EmailResult: {
                                    type: "object",
                                    properties: {
                                        subject: {
                                            type: "string"
                                        },
                                        body: {
                                            type: "string"
                                        },
                                        lead: {
                                            $ref: "#/$defs/Lead"
                                        },
                                        status: {
                                            type: "string",
                                            "enum": [
                                                "success",
                                                "error"
                                            ]
                                        },
                                        error: {
                                            type: "string"
                                        }
                                    },
                                    required: [
                                        "subject",
                                        "body",
                                        "status"
                                    ]
                                }
                            }
                        },
                        output: {
                            type: "object",
                            properties: {
                                type: {
                                    type: "string"
                                },
                                projectId: {
                                    type: "number"
                                },
                                totalLeads: {
                                    type: "number"
                                },
                                successCount: {
                                    type: "number"
                                },
                                errorCount: {
                                    type: "number"
                                },
                                emails: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            lead: {
                                                $ref: "#/$defs/Lead"
                                            },
                                            email: {
                                                $ref: "#/$defs/EmailResult"
                                            },
                                            status: {
                                                type: "string"
                                            },
                                            leadIndex: {
                                                type: "number"
                                            },
                                            error: {
                                                type: "string"
                                            }
                                        },
                                        required: [
                                            "lead",
                                            "email",
                                            "status",
                                            "leadIndex"
                                        ]
                                    }
                                }
                            },
                            required: [
                                "type",
                                "projectId",
                                "totalLeads",
                                "successCount",
                                "errorCount",
                                "emails"
                            ]
                        },
                        validate: (() => { const _io0 = input => "number" === typeof input.projectId && (Array.isArray(input.leadInfoList) && input.leadInfoList.every(elem => "object" === typeof elem && null !== elem && _io1(elem))); const _io1 = input => "number" === typeof input.id && "string" === typeof input.name && "string" === typeof input.industry && (undefined === input.size || "string" === typeof input.size) && (undefined === input.language || "KO" === input.language || "EN" === input.language || "JP" === input.language) && (undefined === input.contactName || "string" === typeof input.contactName) && "string" === typeof input.contactEmail && "string" === typeof input.createdAt && (undefined === input.isActive || "boolean" === typeof input.isActive); const _vo0 = (input, _path, _exceptionable = true) => ["number" === typeof input.projectId || _report(_exceptionable, {
                                path: _path + ".projectId",
                                expected: "number",
                                value: input.projectId
                            }), (Array.isArray(input.leadInfoList) || _report(_exceptionable, {
                                path: _path + ".leadInfoList",
                                expected: "Array<Lead>",
                                value: input.leadInfoList
                            })) && input.leadInfoList.map((elem, _index2) => ("object" === typeof elem && null !== elem || _report(_exceptionable, {
                                path: _path + ".leadInfoList[" + _index2 + "]",
                                expected: "Lead",
                                value: elem
                            })) && _vo1(elem, _path + ".leadInfoList[" + _index2 + "]", true && _exceptionable) || _report(_exceptionable, {
                                path: _path + ".leadInfoList[" + _index2 + "]",
                                expected: "Lead",
                                value: elem
                            })).every(flag => flag) || _report(_exceptionable, {
                                path: _path + ".leadInfoList",
                                expected: "Array<Lead>",
                                value: input.leadInfoList
                            })].every(flag => flag); const _vo1 = (input, _path, _exceptionable = true) => ["number" === typeof input.id || _report(_exceptionable, {
                                path: _path + ".id",
                                expected: "number",
                                value: input.id
                            }), "string" === typeof input.name || _report(_exceptionable, {
                                path: _path + ".name",
                                expected: "string",
                                value: input.name
                            }), "string" === typeof input.industry || _report(_exceptionable, {
                                path: _path + ".industry",
                                expected: "string",
                                value: input.industry
                            }), undefined === input.size || "string" === typeof input.size || _report(_exceptionable, {
                                path: _path + ".size",
                                expected: "(string | undefined)",
                                value: input.size
                            }), undefined === input.language || "KO" === input.language || "EN" === input.language || "JP" === input.language || _report(_exceptionable, {
                                path: _path + ".language",
                                expected: "(\"EN\" | \"JP\" | \"KO\" | undefined)",
                                value: input.language
                            }), undefined === input.contactName || "string" === typeof input.contactName || _report(_exceptionable, {
                                path: _path + ".contactName",
                                expected: "(string | undefined)",
                                value: input.contactName
                            }), "string" === typeof input.contactEmail || _report(_exceptionable, {
                                path: _path + ".contactEmail",
                                expected: "string",
                                value: input.contactEmail
                            }), "string" === typeof input.createdAt || _report(_exceptionable, {
                                path: _path + ".createdAt",
                                expected: "string",
                                value: input.createdAt
                            }), undefined === input.isActive || "boolean" === typeof input.isActive || _report(_exceptionable, {
                                path: _path + ".isActive",
                                expected: "(boolean | undefined)",
                                value: input.isActive
                            })].every(flag => flag); const __is = input => "object" === typeof input && null !== input && _io0(input); let errors; let _report; return input => {
                            if (false === __is(input)) {
                                errors = [];
                                _report = __typia_transform__validateReport._validateReport(errors);
                                ((input, _path, _exceptionable = true) => ("object" === typeof input && null !== input || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                })) && _vo0(input, _path + "", true) || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                }))(input, "$input", true);
                                const success = 0 === errors.length;
                                return success ? {
                                    success,
                                    data: input
                                } : {
                                    success,
                                    errors,
                                    data: input
                                };
                            }
                            return {
                                success: true,
                                data: input
                            };
                        }; })()
                    },
                    {
                        name: "generateInitialEmail",
                        parameters: {
                            type: "object",
                            properties: {
                                projectId: {
                                    type: "number"
                                },
                                leadInfo: {
                                    $ref: "#/$defs/Lead"
                                }
                            },
                            required: [
                                "projectId",
                                "leadInfo"
                            ],
                            additionalProperties: false,
                            $defs: {
                                Lead: {
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "number"
                                        },
                                        name: {
                                            type: "string"
                                        },
                                        industry: {
                                            type: "string"
                                        },
                                        size: {
                                            type: "string"
                                        },
                                        language: {
                                            type: "string",
                                            "enum": [
                                                "KO",
                                                "EN",
                                                "JP"
                                            ]
                                        },
                                        contactName: {
                                            type: "string"
                                        },
                                        contactEmail: {
                                            type: "string"
                                        },
                                        createdAt: {
                                            type: "string"
                                        },
                                        isActive: {
                                            type: "boolean"
                                        }
                                    },
                                    required: [
                                        "id",
                                        "name",
                                        "industry",
                                        "contactEmail",
                                        "createdAt"
                                    ]
                                },
                                EmailResult: {
                                    type: "object",
                                    properties: {
                                        subject: {
                                            type: "string"
                                        },
                                        body: {
                                            type: "string"
                                        },
                                        lead: {
                                            $ref: "#/$defs/Lead"
                                        },
                                        status: {
                                            type: "string",
                                            "enum": [
                                                "success",
                                                "error"
                                            ]
                                        },
                                        error: {
                                            type: "string"
                                        }
                                    },
                                    required: [
                                        "subject",
                                        "body",
                                        "status"
                                    ]
                                }
                            }
                        },
                        output: {
                            $ref: "#/$defs/EmailResult"
                        },
                        validate: (() => { const _io0 = input => "number" === typeof input.projectId && ("object" === typeof input.leadInfo && null !== input.leadInfo && _io1(input.leadInfo)); const _io1 = input => "number" === typeof input.id && "string" === typeof input.name && "string" === typeof input.industry && (undefined === input.size || "string" === typeof input.size) && (undefined === input.language || "KO" === input.language || "EN" === input.language || "JP" === input.language) && (undefined === input.contactName || "string" === typeof input.contactName) && "string" === typeof input.contactEmail && "string" === typeof input.createdAt && (undefined === input.isActive || "boolean" === typeof input.isActive); const _vo0 = (input, _path, _exceptionable = true) => ["number" === typeof input.projectId || _report(_exceptionable, {
                                path: _path + ".projectId",
                                expected: "number",
                                value: input.projectId
                            }), ("object" === typeof input.leadInfo && null !== input.leadInfo || _report(_exceptionable, {
                                path: _path + ".leadInfo",
                                expected: "Lead",
                                value: input.leadInfo
                            })) && _vo1(input.leadInfo, _path + ".leadInfo", true && _exceptionable) || _report(_exceptionable, {
                                path: _path + ".leadInfo",
                                expected: "Lead",
                                value: input.leadInfo
                            })].every(flag => flag); const _vo1 = (input, _path, _exceptionable = true) => ["number" === typeof input.id || _report(_exceptionable, {
                                path: _path + ".id",
                                expected: "number",
                                value: input.id
                            }), "string" === typeof input.name || _report(_exceptionable, {
                                path: _path + ".name",
                                expected: "string",
                                value: input.name
                            }), "string" === typeof input.industry || _report(_exceptionable, {
                                path: _path + ".industry",
                                expected: "string",
                                value: input.industry
                            }), undefined === input.size || "string" === typeof input.size || _report(_exceptionable, {
                                path: _path + ".size",
                                expected: "(string | undefined)",
                                value: input.size
                            }), undefined === input.language || "KO" === input.language || "EN" === input.language || "JP" === input.language || _report(_exceptionable, {
                                path: _path + ".language",
                                expected: "(\"EN\" | \"JP\" | \"KO\" | undefined)",
                                value: input.language
                            }), undefined === input.contactName || "string" === typeof input.contactName || _report(_exceptionable, {
                                path: _path + ".contactName",
                                expected: "(string | undefined)",
                                value: input.contactName
                            }), "string" === typeof input.contactEmail || _report(_exceptionable, {
                                path: _path + ".contactEmail",
                                expected: "string",
                                value: input.contactEmail
                            }), "string" === typeof input.createdAt || _report(_exceptionable, {
                                path: _path + ".createdAt",
                                expected: "string",
                                value: input.createdAt
                            }), undefined === input.isActive || "boolean" === typeof input.isActive || _report(_exceptionable, {
                                path: _path + ".isActive",
                                expected: "(boolean | undefined)",
                                value: input.isActive
                            })].every(flag => flag); const __is = input => "object" === typeof input && null !== input && _io0(input); let errors; let _report; return input => {
                            if (false === __is(input)) {
                                errors = [];
                                _report = __typia_transform__validateReport._validateReport(errors);
                                ((input, _path, _exceptionable = true) => ("object" === typeof input && null !== input || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                })) && _vo0(input, _path + "", true) || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                }))(input, "$input", true);
                                const success = 0 === errors.length;
                                return success ? {
                                    success,
                                    data: input
                                } : {
                                    success,
                                    errors,
                                    data: input
                                };
                            }
                            return {
                                success: true,
                                data: input
                            };
                        }; })()
                    },
                    {
                        name: "generateMultipleEmails",
                        parameters: {
                            type: "object",
                            properties: {
                                projectId: {
                                    type: "number"
                                },
                                leads: {
                                    type: "array",
                                    items: {
                                        $ref: "#/$defs/Lead"
                                    }
                                }
                            },
                            required: [
                                "projectId",
                                "leads"
                            ],
                            additionalProperties: false,
                            $defs: {
                                Lead: {
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "number"
                                        },
                                        name: {
                                            type: "string"
                                        },
                                        industry: {
                                            type: "string"
                                        },
                                        size: {
                                            type: "string"
                                        },
                                        language: {
                                            type: "string",
                                            "enum": [
                                                "KO",
                                                "EN",
                                                "JP"
                                            ]
                                        },
                                        contactName: {
                                            type: "string"
                                        },
                                        contactEmail: {
                                            type: "string"
                                        },
                                        createdAt: {
                                            type: "string"
                                        },
                                        isActive: {
                                            type: "boolean"
                                        }
                                    },
                                    required: [
                                        "id",
                                        "name",
                                        "industry",
                                        "contactEmail",
                                        "createdAt"
                                    ]
                                },
                                EmailResult: {
                                    type: "object",
                                    properties: {
                                        subject: {
                                            type: "string"
                                        },
                                        body: {
                                            type: "string"
                                        },
                                        lead: {
                                            $ref: "#/$defs/Lead"
                                        },
                                        status: {
                                            type: "string",
                                            "enum": [
                                                "success",
                                                "error"
                                            ]
                                        },
                                        error: {
                                            type: "string"
                                        }
                                    },
                                    required: [
                                        "subject",
                                        "body",
                                        "status"
                                    ]
                                }
                            }
                        },
                        output: {
                            type: "array",
                            items: {
                                $ref: "#/$defs/EmailResult"
                            }
                        },
                        validate: (() => { const _io0 = input => "number" === typeof input.projectId && (Array.isArray(input.leads) && input.leads.every(elem => "object" === typeof elem && null !== elem && _io1(elem))); const _io1 = input => "number" === typeof input.id && "string" === typeof input.name && "string" === typeof input.industry && (undefined === input.size || "string" === typeof input.size) && (undefined === input.language || "KO" === input.language || "EN" === input.language || "JP" === input.language) && (undefined === input.contactName || "string" === typeof input.contactName) && "string" === typeof input.contactEmail && "string" === typeof input.createdAt && (undefined === input.isActive || "boolean" === typeof input.isActive); const _vo0 = (input, _path, _exceptionable = true) => ["number" === typeof input.projectId || _report(_exceptionable, {
                                path: _path + ".projectId",
                                expected: "number",
                                value: input.projectId
                            }), (Array.isArray(input.leads) || _report(_exceptionable, {
                                path: _path + ".leads",
                                expected: "Array<Lead>",
                                value: input.leads
                            })) && input.leads.map((elem, _index2) => ("object" === typeof elem && null !== elem || _report(_exceptionable, {
                                path: _path + ".leads[" + _index2 + "]",
                                expected: "Lead",
                                value: elem
                            })) && _vo1(elem, _path + ".leads[" + _index2 + "]", true && _exceptionable) || _report(_exceptionable, {
                                path: _path + ".leads[" + _index2 + "]",
                                expected: "Lead",
                                value: elem
                            })).every(flag => flag) || _report(_exceptionable, {
                                path: _path + ".leads",
                                expected: "Array<Lead>",
                                value: input.leads
                            })].every(flag => flag); const _vo1 = (input, _path, _exceptionable = true) => ["number" === typeof input.id || _report(_exceptionable, {
                                path: _path + ".id",
                                expected: "number",
                                value: input.id
                            }), "string" === typeof input.name || _report(_exceptionable, {
                                path: _path + ".name",
                                expected: "string",
                                value: input.name
                            }), "string" === typeof input.industry || _report(_exceptionable, {
                                path: _path + ".industry",
                                expected: "string",
                                value: input.industry
                            }), undefined === input.size || "string" === typeof input.size || _report(_exceptionable, {
                                path: _path + ".size",
                                expected: "(string | undefined)",
                                value: input.size
                            }), undefined === input.language || "KO" === input.language || "EN" === input.language || "JP" === input.language || _report(_exceptionable, {
                                path: _path + ".language",
                                expected: "(\"EN\" | \"JP\" | \"KO\" | undefined)",
                                value: input.language
                            }), undefined === input.contactName || "string" === typeof input.contactName || _report(_exceptionable, {
                                path: _path + ".contactName",
                                expected: "(string | undefined)",
                                value: input.contactName
                            }), "string" === typeof input.contactEmail || _report(_exceptionable, {
                                path: _path + ".contactEmail",
                                expected: "string",
                                value: input.contactEmail
                            }), "string" === typeof input.createdAt || _report(_exceptionable, {
                                path: _path + ".createdAt",
                                expected: "string",
                                value: input.createdAt
                            }), undefined === input.isActive || "boolean" === typeof input.isActive || _report(_exceptionable, {
                                path: _path + ".isActive",
                                expected: "(boolean | undefined)",
                                value: input.isActive
                            })].every(flag => flag); const __is = input => "object" === typeof input && null !== input && _io0(input); let errors; let _report; return input => {
                            if (false === __is(input)) {
                                errors = [];
                                _report = __typia_transform__validateReport._validateReport(errors);
                                ((input, _path, _exceptionable = true) => ("object" === typeof input && null !== input || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                })) && _vo0(input, _path + "", true) || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                }))(input, "$input", true);
                                const success = 0 === errors.length;
                                return success ? {
                                    success,
                                    data: input
                                } : {
                                    success,
                                    errors,
                                    data: input
                                };
                            }
                            return {
                                success: true,
                                data: input
                            };
                        }; })()
                    },
                    {
                        name: "generateFollowupEmail",
                        parameters: {
                            type: "object",
                            properties: {
                                projectId: {
                                    type: "number"
                                },
                                leadId: {
                                    type: "number"
                                },
                                feedbackSummary: {
                                    type: "string"
                                }
                            },
                            required: [
                                "projectId",
                                "leadId",
                                "feedbackSummary"
                            ],
                            additionalProperties: false,
                            $defs: {
                                EmailResult: {
                                    type: "object",
                                    properties: {
                                        subject: {
                                            type: "string"
                                        },
                                        body: {
                                            type: "string"
                                        },
                                        lead: {
                                            $ref: "#/$defs/Lead"
                                        },
                                        status: {
                                            type: "string",
                                            "enum": [
                                                "success",
                                                "error"
                                            ]
                                        },
                                        error: {
                                            type: "string"
                                        }
                                    },
                                    required: [
                                        "subject",
                                        "body",
                                        "status"
                                    ]
                                },
                                Lead: {
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "number"
                                        },
                                        name: {
                                            type: "string"
                                        },
                                        industry: {
                                            type: "string"
                                        },
                                        size: {
                                            type: "string"
                                        },
                                        language: {
                                            type: "string",
                                            "enum": [
                                                "KO",
                                                "EN",
                                                "JP"
                                            ]
                                        },
                                        contactName: {
                                            type: "string"
                                        },
                                        contactEmail: {
                                            type: "string"
                                        },
                                        createdAt: {
                                            type: "string"
                                        },
                                        isActive: {
                                            type: "boolean"
                                        }
                                    },
                                    required: [
                                        "id",
                                        "name",
                                        "industry",
                                        "contactEmail",
                                        "createdAt"
                                    ]
                                }
                            }
                        },
                        output: {
                            $ref: "#/$defs/EmailResult"
                        },
                        validate: (() => { const _io0 = input => "number" === typeof input.projectId && "number" === typeof input.leadId && "string" === typeof input.feedbackSummary; const _vo0 = (input, _path, _exceptionable = true) => ["number" === typeof input.projectId || _report(_exceptionable, {
                                path: _path + ".projectId",
                                expected: "number",
                                value: input.projectId
                            }), "number" === typeof input.leadId || _report(_exceptionable, {
                                path: _path + ".leadId",
                                expected: "number",
                                value: input.leadId
                            }), "string" === typeof input.feedbackSummary || _report(_exceptionable, {
                                path: _path + ".feedbackSummary",
                                expected: "string",
                                value: input.feedbackSummary
                            })].every(flag => flag); const __is = input => "object" === typeof input && null !== input && _io0(input); let errors; let _report; return input => {
                            if (false === __is(input)) {
                                errors = [];
                                _report = __typia_transform__validateReport._validateReport(errors);
                                ((input, _path, _exceptionable = true) => ("object" === typeof input && null !== input || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                })) && _vo0(input, _path + "", true) || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                }))(input, "$input", true);
                                const success = 0 === errors.length;
                                return success ? {
                                    success,
                                    data: input
                                } : {
                                    success,
                                    errors,
                                    data: input
                                };
                            }
                            return {
                                success: true,
                                data: input
                            };
                        }; })()
                    },
                    {
                        name: "rewriteEmail",
                        parameters: {
                            type: "object",
                            properties: {
                                originalSubject: {
                                    type: "string"
                                },
                                originalBody: {
                                    type: "string"
                                },
                                userFeedback: {
                                    type: "string"
                                },
                                projectId: {
                                    type: "number"
                                },
                                leadId: {
                                    type: "number"
                                }
                            },
                            required: [
                                "originalSubject",
                                "originalBody",
                                "userFeedback",
                                "projectId",
                                "leadId"
                            ],
                            additionalProperties: false,
                            $defs: {
                                EmailResult: {
                                    type: "object",
                                    properties: {
                                        subject: {
                                            type: "string"
                                        },
                                        body: {
                                            type: "string"
                                        },
                                        lead: {
                                            $ref: "#/$defs/Lead"
                                        },
                                        status: {
                                            type: "string",
                                            "enum": [
                                                "success",
                                                "error"
                                            ]
                                        },
                                        error: {
                                            type: "string"
                                        }
                                    },
                                    required: [
                                        "subject",
                                        "body",
                                        "status"
                                    ]
                                },
                                Lead: {
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "number"
                                        },
                                        name: {
                                            type: "string"
                                        },
                                        industry: {
                                            type: "string"
                                        },
                                        size: {
                                            type: "string"
                                        },
                                        language: {
                                            type: "string",
                                            "enum": [
                                                "KO",
                                                "EN",
                                                "JP"
                                            ]
                                        },
                                        contactName: {
                                            type: "string"
                                        },
                                        contactEmail: {
                                            type: "string"
                                        },
                                        createdAt: {
                                            type: "string"
                                        },
                                        isActive: {
                                            type: "boolean"
                                        }
                                    },
                                    required: [
                                        "id",
                                        "name",
                                        "industry",
                                        "contactEmail",
                                        "createdAt"
                                    ]
                                }
                            }
                        },
                        output: {
                            $ref: "#/$defs/EmailResult"
                        },
                        validate: (() => { const _io0 = input => "string" === typeof input.originalSubject && "string" === typeof input.originalBody && "string" === typeof input.userFeedback && "number" === typeof input.projectId && "number" === typeof input.leadId; const _vo0 = (input, _path, _exceptionable = true) => ["string" === typeof input.originalSubject || _report(_exceptionable, {
                                path: _path + ".originalSubject",
                                expected: "string",
                                value: input.originalSubject
                            }), "string" === typeof input.originalBody || _report(_exceptionable, {
                                path: _path + ".originalBody",
                                expected: "string",
                                value: input.originalBody
                            }), "string" === typeof input.userFeedback || _report(_exceptionable, {
                                path: _path + ".userFeedback",
                                expected: "string",
                                value: input.userFeedback
                            }), "number" === typeof input.projectId || _report(_exceptionable, {
                                path: _path + ".projectId",
                                expected: "number",
                                value: input.projectId
                            }), "number" === typeof input.leadId || _report(_exceptionable, {
                                path: _path + ".leadId",
                                expected: "number",
                                value: input.leadId
                            })].every(flag => flag); const __is = input => "object" === typeof input && null !== input && _io0(input); let errors; let _report; return input => {
                            if (false === __is(input)) {
                                errors = [];
                                _report = __typia_transform__validateReport._validateReport(errors);
                                ((input, _path, _exceptionable = true) => ("object" === typeof input && null !== input || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                })) && _vo0(input, _path + "", true) || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                }))(input, "$input", true);
                                const success = 0 === errors.length;
                                return success ? {
                                    success,
                                    data: input
                                } : {
                                    success,
                                    errors,
                                    data: input
                                };
                            }
                            return {
                                success: true,
                                data: input
                            };
                        }; })()
                    },
                    {
                        name: "getLatestEmailForRewrite",
                        parameters: {
                            type: "object",
                            properties: {
                                projectId: {
                                    type: "number"
                                },
                                leadId: {
                                    type: "number"
                                }
                            },
                            required: [],
                            additionalProperties: false,
                            $defs: {
                                Email: {
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "number"
                                        },
                                        project: {
                                            $ref: "#/$defs/Project"
                                        },
                                        lead: {
                                            $ref: "#/$defs/Lead"
                                        },
                                        subject: {
                                            type: "string"
                                        },
                                        body: {
                                            type: "string"
                                        },
                                        createdAt: {
                                            type: "string"
                                        },
                                        status: {
                                            type: "string",
                                            "enum": [
                                                "DRAFT",
                                                "SENT",
                                                "REPLIED",
                                                "BOUNCED",
                                                "READ",
                                                "FAILED"
                                            ]
                                        }
                                    },
                                    required: [
                                        "id",
                                        "project",
                                        "lead",
                                        "subject",
                                        "body",
                                        "createdAt"
                                    ]
                                },
                                Project: {
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "number"
                                        },
                                        name: {
                                            type: "string"
                                        },
                                        description: {
                                            type: "string"
                                        },
                                        industry: {
                                            type: "string"
                                        },
                                        createdAt: {
                                            type: "string"
                                        },
                                        isActive: {
                                            type: "boolean"
                                        }
                                    },
                                    required: [
                                        "id",
                                        "name",
                                        "description",
                                        "industry",
                                        "createdAt"
                                    ]
                                },
                                Lead: {
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "number"
                                        },
                                        name: {
                                            type: "string"
                                        },
                                        industry: {
                                            type: "string"
                                        },
                                        size: {
                                            type: "string"
                                        },
                                        language: {
                                            type: "string",
                                            "enum": [
                                                "KO",
                                                "EN",
                                                "JP"
                                            ]
                                        },
                                        contactName: {
                                            type: "string"
                                        },
                                        contactEmail: {
                                            type: "string"
                                        },
                                        createdAt: {
                                            type: "string"
                                        },
                                        isActive: {
                                            type: "boolean"
                                        }
                                    },
                                    required: [
                                        "id",
                                        "name",
                                        "industry",
                                        "contactEmail",
                                        "createdAt"
                                    ]
                                }
                            }
                        },
                        output: {
                            anyOf: [
                                {
                                    type: "null"
                                },
                                {
                                    $ref: "#/$defs/Email"
                                }
                            ]
                        },
                        validate: (() => { const _io0 = input => (undefined === input.projectId || "number" === typeof input.projectId) && (undefined === input.leadId || "number" === typeof input.leadId); const _vo0 = (input, _path, _exceptionable = true) => [undefined === input.projectId || "number" === typeof input.projectId || _report(_exceptionable, {
                                path: _path + ".projectId",
                                expected: "(number | undefined)",
                                value: input.projectId
                            }), undefined === input.leadId || "number" === typeof input.leadId || _report(_exceptionable, {
                                path: _path + ".leadId",
                                expected: "(number | undefined)",
                                value: input.leadId
                            })].every(flag => flag); const __is = input => "object" === typeof input && null !== input && false === Array.isArray(input) && _io0(input); let errors; let _report; return input => {
                            if (false === __is(input)) {
                                errors = [];
                                _report = __typia_transform__validateReport._validateReport(errors);
                                ((input, _path, _exceptionable = true) => ("object" === typeof input && null !== input && false === Array.isArray(input) || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                })) && _vo0(input, _path + "", true) || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                }))(input, "$input", true);
                                const success = 0 === errors.length;
                                return success ? {
                                    success,
                                    data: input
                                } : {
                                    success,
                                    errors,
                                    data: input
                                };
                            }
                            return {
                                success: true,
                                data: input
                            };
                        }; })()
                    },
                    {
                        name: "sendEmail",
                        parameters: {
                            type: "object",
                            properties: {
                                emailId: {
                                    type: "number"
                                }
                            },
                            required: [
                                "emailId"
                            ],
                            additionalProperties: false,
                            $defs: {}
                        },
                        output: {
                            type: "object",
                            properties: {
                                status: {
                                    type: "string"
                                },
                                message: {
                                    type: "string"
                                }
                            },
                            required: [
                                "status",
                                "message"
                            ]
                        },
                        validate: (() => { const _io0 = input => "number" === typeof input.emailId; const _vo0 = (input, _path, _exceptionable = true) => ["number" === typeof input.emailId || _report(_exceptionable, {
                                path: _path + ".emailId",
                                expected: "number",
                                value: input.emailId
                            })].every(flag => flag); const __is = input => "object" === typeof input && null !== input && _io0(input); let errors; let _report; return input => {
                            if (false === __is(input)) {
                                errors = [];
                                _report = __typia_transform__validateReport._validateReport(errors);
                                ((input, _path, _exceptionable = true) => ("object" === typeof input && null !== input || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                })) && _vo0(input, _path + "", true) || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                }))(input, "$input", true);
                                const success = 0 === errors.length;
                                return success ? {
                                    success,
                                    data: input
                                } : {
                                    success,
                                    errors,
                                    data: input
                                };
                            }
                            return {
                                success: true,
                                data: input
                            };
                        }; })()
                    },
                    {
                        name: "completeEmailWorkflow",
                        parameters: {
                            type: "object",
                            properties: {
                                projectId: {
                                    type: "number"
                                },
                                leadIds: {
                                    type: "array",
                                    items: {
                                        type: "number"
                                    }
                                },
                                autoSend: {
                                    type: "boolean"
                                }
                            },
                            required: [
                                "projectId",
                                "leadIds"
                            ],
                            additionalProperties: false,
                            $defs: {
                                EmailResult: {
                                    type: "object",
                                    properties: {
                                        subject: {
                                            type: "string"
                                        },
                                        body: {
                                            type: "string"
                                        },
                                        lead: {
                                            $ref: "#/$defs/Lead"
                                        },
                                        status: {
                                            type: "string",
                                            "enum": [
                                                "success",
                                                "error"
                                            ]
                                        },
                                        error: {
                                            type: "string"
                                        }
                                    },
                                    required: [
                                        "subject",
                                        "body",
                                        "status"
                                    ]
                                },
                                Lead: {
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "number"
                                        },
                                        name: {
                                            type: "string"
                                        },
                                        industry: {
                                            type: "string"
                                        },
                                        size: {
                                            type: "string"
                                        },
                                        language: {
                                            type: "string",
                                            "enum": [
                                                "KO",
                                                "EN",
                                                "JP"
                                            ]
                                        },
                                        contactName: {
                                            type: "string"
                                        },
                                        contactEmail: {
                                            type: "string"
                                        },
                                        createdAt: {
                                            type: "string"
                                        },
                                        isActive: {
                                            type: "boolean"
                                        }
                                    },
                                    required: [
                                        "id",
                                        "name",
                                        "industry",
                                        "contactEmail",
                                        "createdAt"
                                    ]
                                }
                            }
                        },
                        output: {
                            type: "object",
                            properties: {
                                emailResults: {
                                    type: "array",
                                    items: {
                                        $ref: "#/$defs/EmailResult"
                                    }
                                },
                                sentEmails: {
                                    type: "array",
                                    items: {
                                        type: "number"
                                    }
                                },
                                errors: {
                                    type: "array",
                                    items: {
                                        type: "string"
                                    }
                                }
                            },
                            required: [
                                "emailResults",
                                "sentEmails",
                                "errors"
                            ]
                        },
                        validate: (() => { const _io0 = input => "number" === typeof input.projectId && (Array.isArray(input.leadIds) && input.leadIds.every(elem => "number" === typeof elem)) && (undefined === input.autoSend || "boolean" === typeof input.autoSend); const _vo0 = (input, _path, _exceptionable = true) => ["number" === typeof input.projectId || _report(_exceptionable, {
                                path: _path + ".projectId",
                                expected: "number",
                                value: input.projectId
                            }), (Array.isArray(input.leadIds) || _report(_exceptionable, {
                                path: _path + ".leadIds",
                                expected: "Array<number>",
                                value: input.leadIds
                            })) && input.leadIds.map((elem, _index2) => "number" === typeof elem || _report(_exceptionable, {
                                path: _path + ".leadIds[" + _index2 + "]",
                                expected: "number",
                                value: elem
                            })).every(flag => flag) || _report(_exceptionable, {
                                path: _path + ".leadIds",
                                expected: "Array<number>",
                                value: input.leadIds
                            }), undefined === input.autoSend || "boolean" === typeof input.autoSend || _report(_exceptionable, {
                                path: _path + ".autoSend",
                                expected: "(boolean | undefined)",
                                value: input.autoSend
                            })].every(flag => flag); const __is = input => "object" === typeof input && null !== input && _io0(input); let errors; let _report; return input => {
                            if (false === __is(input)) {
                                errors = [];
                                _report = __typia_transform__validateReport._validateReport(errors);
                                ((input, _path, _exceptionable = true) => ("object" === typeof input && null !== input || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                })) && _vo0(input, _path + "", true) || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                }))(input, "$input", true);
                                const success = 0 === errors.length;
                                return success ? {
                                    success,
                                    data: input
                                } : {
                                    success,
                                    errors,
                                    data: input
                                };
                            }
                            return {
                                success: true,
                                data: input
                            };
                        }; })()
                    },
                    {
                        name: "extractLeadsInfo",
                        parameters: {
                            type: "object",
                            properties: {
                                prompt: {
                                    type: "string"
                                }
                            },
                            required: [
                                "prompt"
                            ],
                            additionalProperties: false,
                            $defs: {
                                Lead: {
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "number"
                                        },
                                        name: {
                                            type: "string"
                                        },
                                        industry: {
                                            type: "string"
                                        },
                                        size: {
                                            type: "string"
                                        },
                                        language: {
                                            type: "string",
                                            "enum": [
                                                "KO",
                                                "EN",
                                                "JP"
                                            ]
                                        },
                                        contactName: {
                                            type: "string"
                                        },
                                        contactEmail: {
                                            type: "string"
                                        },
                                        createdAt: {
                                            type: "string"
                                        },
                                        isActive: {
                                            type: "boolean"
                                        }
                                    },
                                    required: [
                                        "id",
                                        "name",
                                        "industry",
                                        "contactEmail",
                                        "createdAt"
                                    ]
                                }
                            }
                        },
                        output: {
                            type: "array",
                            items: {
                                $ref: "#/$defs/Lead"
                            }
                        },
                        validate: (() => { const _io0 = input => "string" === typeof input.prompt; const _vo0 = (input, _path, _exceptionable = true) => ["string" === typeof input.prompt || _report(_exceptionable, {
                                path: _path + ".prompt",
                                expected: "string",
                                value: input.prompt
                            })].every(flag => flag); const __is = input => "object" === typeof input && null !== input && _io0(input); let errors; let _report; return input => {
                            if (false === __is(input)) {
                                errors = [];
                                _report = __typia_transform__validateReport._validateReport(errors);
                                ((input, _path, _exceptionable = true) => ("object" === typeof input && null !== input || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                })) && _vo0(input, _path + "", true) || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                }))(input, "$input", true);
                                const success = 0 === errors.length;
                                return success ? {
                                    success,
                                    data: input
                                } : {
                                    success,
                                    errors,
                                    data: input
                                };
                            }
                            return {
                                success: true,
                                data: input
                            };
                        }; })()
                    },
                    {
                        name: "createMultipleLeads",
                        parameters: {
                            type: "object",
                            properties: {
                                leads: {
                                    type: "array",
                                    items: {
                                        $ref: "#/$defs/PartialLead"
                                    }
                                }
                            },
                            required: [
                                "leads"
                            ],
                            additionalProperties: false,
                            $defs: {
                                PartialLead: {
                                    description: "Make all properties in T optional",
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "number"
                                        },
                                        name: {
                                            type: "string"
                                        },
                                        industry: {
                                            type: "string"
                                        },
                                        size: {
                                            type: "string"
                                        },
                                        language: {
                                            type: "string",
                                            "enum": [
                                                "KO",
                                                "EN",
                                                "JP"
                                            ]
                                        },
                                        contactName: {
                                            type: "string"
                                        },
                                        contactEmail: {
                                            type: "string"
                                        },
                                        createdAt: {
                                            type: "string"
                                        },
                                        isActive: {
                                            type: "boolean"
                                        }
                                    },
                                    required: []
                                },
                                Lead: {
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "number"
                                        },
                                        name: {
                                            type: "string"
                                        },
                                        industry: {
                                            type: "string"
                                        },
                                        size: {
                                            type: "string"
                                        },
                                        language: {
                                            type: "string",
                                            "enum": [
                                                "KO",
                                                "EN",
                                                "JP"
                                            ]
                                        },
                                        contactName: {
                                            type: "string"
                                        },
                                        contactEmail: {
                                            type: "string"
                                        },
                                        createdAt: {
                                            type: "string"
                                        },
                                        isActive: {
                                            type: "boolean"
                                        }
                                    },
                                    required: [
                                        "id",
                                        "name",
                                        "industry",
                                        "contactEmail",
                                        "createdAt"
                                    ]
                                }
                            }
                        },
                        output: {
                            type: "array",
                            items: {
                                $ref: "#/$defs/Lead"
                            }
                        },
                        validate: (() => { const _io0 = input => Array.isArray(input.leads) && input.leads.every(elem => "object" === typeof elem && null !== elem && false === Array.isArray(elem) && _io1(elem)); const _io1 = input => (undefined === input.id || "number" === typeof input.id) && (undefined === input.name || "string" === typeof input.name) && (undefined === input.industry || "string" === typeof input.industry) && (undefined === input.size || "string" === typeof input.size) && (undefined === input.language || "KO" === input.language || "EN" === input.language || "JP" === input.language) && (undefined === input.contactName || "string" === typeof input.contactName) && (undefined === input.contactEmail || "string" === typeof input.contactEmail) && (undefined === input.createdAt || "string" === typeof input.createdAt) && (undefined === input.isActive || "boolean" === typeof input.isActive); const _vo0 = (input, _path, _exceptionable = true) => [(Array.isArray(input.leads) || _report(_exceptionable, {
                                path: _path + ".leads",
                                expected: "Array<Partial<Lead>>",
                                value: input.leads
                            })) && input.leads.map((elem, _index2) => ("object" === typeof elem && null !== elem && false === Array.isArray(elem) || _report(_exceptionable, {
                                path: _path + ".leads[" + _index2 + "]",
                                expected: "Partial<Lead>",
                                value: elem
                            })) && _vo1(elem, _path + ".leads[" + _index2 + "]", true && _exceptionable) || _report(_exceptionable, {
                                path: _path + ".leads[" + _index2 + "]",
                                expected: "Partial<Lead>",
                                value: elem
                            })).every(flag => flag) || _report(_exceptionable, {
                                path: _path + ".leads",
                                expected: "Array<Partial<Lead>>",
                                value: input.leads
                            })].every(flag => flag); const _vo1 = (input, _path, _exceptionable = true) => [undefined === input.id || "number" === typeof input.id || _report(_exceptionable, {
                                path: _path + ".id",
                                expected: "(number | undefined)",
                                value: input.id
                            }), undefined === input.name || "string" === typeof input.name || _report(_exceptionable, {
                                path: _path + ".name",
                                expected: "(string | undefined)",
                                value: input.name
                            }), undefined === input.industry || "string" === typeof input.industry || _report(_exceptionable, {
                                path: _path + ".industry",
                                expected: "(string | undefined)",
                                value: input.industry
                            }), undefined === input.size || "string" === typeof input.size || _report(_exceptionable, {
                                path: _path + ".size",
                                expected: "(string | undefined)",
                                value: input.size
                            }), undefined === input.language || "KO" === input.language || "EN" === input.language || "JP" === input.language || _report(_exceptionable, {
                                path: _path + ".language",
                                expected: "(\"EN\" | \"JP\" | \"KO\" | undefined)",
                                value: input.language
                            }), undefined === input.contactName || "string" === typeof input.contactName || _report(_exceptionable, {
                                path: _path + ".contactName",
                                expected: "(string | undefined)",
                                value: input.contactName
                            }), undefined === input.contactEmail || "string" === typeof input.contactEmail || _report(_exceptionable, {
                                path: _path + ".contactEmail",
                                expected: "(string | undefined)",
                                value: input.contactEmail
                            }), undefined === input.createdAt || "string" === typeof input.createdAt || _report(_exceptionable, {
                                path: _path + ".createdAt",
                                expected: "(string | undefined)",
                                value: input.createdAt
                            }), undefined === input.isActive || "boolean" === typeof input.isActive || _report(_exceptionable, {
                                path: _path + ".isActive",
                                expected: "(boolean | undefined)",
                                value: input.isActive
                            })].every(flag => flag); const __is = input => "object" === typeof input && null !== input && _io0(input); let errors; let _report; return input => {
                            if (false === __is(input)) {
                                errors = [];
                                _report = __typia_transform__validateReport._validateReport(errors);
                                ((input, _path, _exceptionable = true) => ("object" === typeof input && null !== input || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                })) && _vo0(input, _path + "", true) || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                }))(input, "$input", true);
                                const success = 0 === errors.length;
                                return success ? {
                                    success,
                                    data: input
                                } : {
                                    success,
                                    errors,
                                    data: input
                                };
                            }
                            return {
                                success: true,
                                data: input
                            };
                        }; })()
                    },
                    {
                        name: "listLeads",
                        parameters: {
                            type: "object",
                            properties: {},
                            additionalProperties: false,
                            required: [],
                            $defs: {
                                Lead: {
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "number"
                                        },
                                        name: {
                                            type: "string"
                                        },
                                        industry: {
                                            type: "string"
                                        },
                                        size: {
                                            type: "string"
                                        },
                                        language: {
                                            type: "string",
                                            "enum": [
                                                "KO",
                                                "EN",
                                                "JP"
                                            ]
                                        },
                                        contactName: {
                                            type: "string"
                                        },
                                        contactEmail: {
                                            type: "string"
                                        },
                                        createdAt: {
                                            type: "string"
                                        },
                                        isActive: {
                                            type: "boolean"
                                        }
                                    },
                                    required: [
                                        "id",
                                        "name",
                                        "industry",
                                        "contactEmail",
                                        "createdAt"
                                    ]
                                }
                            }
                        },
                        output: {
                            type: "array",
                            items: {
                                $ref: "#/$defs/Lead"
                            }
                        },
                        validate: (() => { const __is = input => true; let errors; let _report; return input => {
                            if (false === __is(input)) {
                                errors = [];
                                _report = __typia_transform__validateReport._validateReport(errors);
                                ((input, _path, _exceptionable = true) => true)(input, "$input", true);
                                const success = 0 === errors.length;
                                return success ? {
                                    success,
                                    data: input
                                } : {
                                    success,
                                    errors,
                                    data: input
                                };
                            }
                            return {
                                success: true,
                                data: input
                            };
                        }; })()
                    },
                    {
                        name: "autoConnectLeads",
                        parameters: {
                            type: "object",
                            properties: {
                                projectId: {
                                    type: "number"
                                }
                            },
                            required: [
                                "projectId"
                            ],
                            additionalProperties: false,
                            $defs: {
                                Lead: {
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "number"
                                        },
                                        name: {
                                            type: "string"
                                        },
                                        industry: {
                                            type: "string"
                                        },
                                        size: {
                                            type: "string"
                                        },
                                        language: {
                                            type: "string",
                                            "enum": [
                                                "KO",
                                                "EN",
                                                "JP"
                                            ]
                                        },
                                        contactName: {
                                            type: "string"
                                        },
                                        contactEmail: {
                                            type: "string"
                                        },
                                        createdAt: {
                                            type: "string"
                                        },
                                        isActive: {
                                            type: "boolean"
                                        }
                                    },
                                    required: [
                                        "id",
                                        "name",
                                        "industry",
                                        "contactEmail",
                                        "createdAt"
                                    ]
                                }
                            }
                        },
                        output: {
                            type: "array",
                            items: {
                                $ref: "#/$defs/Lead"
                            }
                        },
                        validate: (() => { const _io0 = input => "number" === typeof input.projectId; const _vo0 = (input, _path, _exceptionable = true) => ["number" === typeof input.projectId || _report(_exceptionable, {
                                path: _path + ".projectId",
                                expected: "number",
                                value: input.projectId
                            })].every(flag => flag); const __is = input => "object" === typeof input && null !== input && _io0(input); let errors; let _report; return input => {
                            if (false === __is(input)) {
                                errors = [];
                                _report = __typia_transform__validateReport._validateReport(errors);
                                ((input, _path, _exceptionable = true) => ("object" === typeof input && null !== input || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                })) && _vo0(input, _path + "", true) || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                }))(input, "$input", true);
                                const success = 0 === errors.length;
                                return success ? {
                                    success,
                                    data: input
                                } : {
                                    success,
                                    errors,
                                    data: input
                                };
                            }
                            return {
                                success: true,
                                data: input
                            };
                        }; })()
                    },
                    {
                        name: "extractProjectInfo",
                        parameters: {
                            type: "object",
                            properties: {
                                prompt: {
                                    type: "string"
                                }
                            },
                            required: [
                                "prompt"
                            ],
                            additionalProperties: false,
                            $defs: {
                                PartialProject: {
                                    description: "Make all properties in T optional",
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "number"
                                        },
                                        name: {
                                            type: "string"
                                        },
                                        description: {
                                            type: "string"
                                        },
                                        industry: {
                                            type: "string"
                                        },
                                        createdAt: {
                                            type: "string"
                                        },
                                        isActive: {
                                            type: "boolean"
                                        }
                                    },
                                    required: []
                                }
                            }
                        },
                        output: {
                            $ref: "#/$defs/PartialProject"
                        },
                        validate: (() => { const _io0 = input => "string" === typeof input.prompt; const _vo0 = (input, _path, _exceptionable = true) => ["string" === typeof input.prompt || _report(_exceptionable, {
                                path: _path + ".prompt",
                                expected: "string",
                                value: input.prompt
                            })].every(flag => flag); const __is = input => "object" === typeof input && null !== input && _io0(input); let errors; let _report; return input => {
                            if (false === __is(input)) {
                                errors = [];
                                _report = __typia_transform__validateReport._validateReport(errors);
                                ((input, _path, _exceptionable = true) => ("object" === typeof input && null !== input || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                })) && _vo0(input, _path + "", true) || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                }))(input, "$input", true);
                                const success = 0 === errors.length;
                                return success ? {
                                    success,
                                    data: input
                                } : {
                                    success,
                                    errors,
                                    data: input
                                };
                            }
                            return {
                                success: true,
                                data: input
                            };
                        }; })()
                    },
                    {
                        name: "listProjects",
                        parameters: {
                            type: "object",
                            properties: {},
                            additionalProperties: false,
                            required: [],
                            $defs: {
                                Project: {
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "number"
                                        },
                                        name: {
                                            type: "string"
                                        },
                                        description: {
                                            type: "string"
                                        },
                                        industry: {
                                            type: "string"
                                        },
                                        createdAt: {
                                            type: "string"
                                        },
                                        isActive: {
                                            type: "boolean"
                                        }
                                    },
                                    required: [
                                        "id",
                                        "name",
                                        "description",
                                        "industry",
                                        "createdAt"
                                    ]
                                }
                            }
                        },
                        output: {
                            type: "array",
                            items: {
                                $ref: "#/$defs/Project"
                            }
                        },
                        validate: (() => { const __is = input => true; let errors; let _report; return input => {
                            if (false === __is(input)) {
                                errors = [];
                                _report = __typia_transform__validateReport._validateReport(errors);
                                ((input, _path, _exceptionable = true) => true)(input, "$input", true);
                                const success = 0 === errors.length;
                                return success ? {
                                    success,
                                    data: input
                                } : {
                                    success,
                                    errors,
                                    data: input
                                };
                            }
                            return {
                                success: true,
                                data: input
                            };
                        }; })()
                    },
                    {
                        name: "createProject",
                        parameters: {
                            type: "object",
                            properties: {
                                name: {
                                    type: "string"
                                },
                                description: {
                                    type: "string"
                                },
                                industry: {
                                    type: "string"
                                }
                            },
                            required: [
                                "name",
                                "description",
                                "industry"
                            ],
                            additionalProperties: false,
                            $defs: {
                                Project: {
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "number"
                                        },
                                        name: {
                                            type: "string"
                                        },
                                        description: {
                                            type: "string"
                                        },
                                        industry: {
                                            type: "string"
                                        },
                                        createdAt: {
                                            type: "string"
                                        },
                                        isActive: {
                                            type: "boolean"
                                        }
                                    },
                                    required: [
                                        "id",
                                        "name",
                                        "description",
                                        "industry",
                                        "createdAt"
                                    ]
                                }
                            }
                        },
                        output: {
                            $ref: "#/$defs/Project"
                        },
                        validate: (() => { const _io0 = input => "string" === typeof input.name && "string" === typeof input.description && "string" === typeof input.industry; const _vo0 = (input, _path, _exceptionable = true) => ["string" === typeof input.name || _report(_exceptionable, {
                                path: _path + ".name",
                                expected: "string",
                                value: input.name
                            }), "string" === typeof input.description || _report(_exceptionable, {
                                path: _path + ".description",
                                expected: "string",
                                value: input.description
                            }), "string" === typeof input.industry || _report(_exceptionable, {
                                path: _path + ".industry",
                                expected: "string",
                                value: input.industry
                            })].every(flag => flag); const __is = input => "object" === typeof input && null !== input && _io0(input); let errors; let _report; return input => {
                            if (false === __is(input)) {
                                errors = [];
                                _report = __typia_transform__validateReport._validateReport(errors);
                                ((input, _path, _exceptionable = true) => ("object" === typeof input && null !== input || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                })) && _vo0(input, _path + "", true) || _report(true, {
                                    path: _path + "",
                                    expected: "__type",
                                    value: input
                                }))(input, "$input", true);
                                const success = 0 === errors.length;
                                return success ? {
                                    success,
                                    data: input
                                } : {
                                    success,
                                    errors,
                                    data: input
                                };
                            }
                            return {
                                success: true,
                                data: input
                            };
                        }; })()
                    }
                ]
            },
            execute: allFunctions,
        },
    ],
});
