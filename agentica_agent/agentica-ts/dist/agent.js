import * as __typia_transform__validateReport from "typia/lib/internal/_validateReport.js";
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
        api: openai, // 여기 타입 충돌 나면 버전 문제일 가능성 큼
        model: "gpt-4o",
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
                        name: "submitFeedback",
                        parameters: {
                            type: "object",
                            properties: {
                                userPrompt: {
                                    type: "string"
                                }
                            },
                            required: [
                                "userPrompt"
                            ],
                            additionalProperties: false,
                            $defs: {}
                        },
                        output: {},
                        validate: (() => { const _io0 = input => "string" === typeof input.userPrompt; const _vo0 = (input, _path, _exceptionable = true) => ["string" === typeof input.userPrompt || _report(_exceptionable, {
                                path: _path + ".userPrompt",
                                expected: "string",
                                value: input.userPrompt
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
                        name: "summarizeFeedback",
                        parameters: {
                            type: "object",
                            properties: {
                                userPrompt: {
                                    type: "string"
                                }
                            },
                            required: [
                                "userPrompt"
                            ],
                            additionalProperties: false,
                            $defs: {}
                        },
                        output: {},
                        validate: (() => { const _io0 = input => "string" === typeof input.userPrompt; const _vo0 = (input, _path, _exceptionable = true) => ["string" === typeof input.userPrompt || _report(_exceptionable, {
                                path: _path + ".userPrompt",
                                expected: "string",
                                value: input.userPrompt
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
                                userPrompt: {
                                    type: "string"
                                }
                            },
                            required: [
                                "userPrompt"
                            ],
                            additionalProperties: false,
                            $defs: {}
                        },
                        output: {
                            anyOf: [
                                {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "string"
                                        },
                                        error: {
                                            type: "string"
                                        }
                                    },
                                    required: [
                                        "status",
                                        "error"
                                    ]
                                },
                                {
                                    type: "object",
                                    properties: {
                                        subject: {},
                                        body: {},
                                        status: {
                                            type: "string"
                                        }
                                    },
                                    required: [
                                        "subject",
                                        "body",
                                        "status"
                                    ]
                                }
                            ]
                        },
                        validate: (() => { const _io0 = input => "string" === typeof input.userPrompt; const _vo0 = (input, _path, _exceptionable = true) => ["string" === typeof input.userPrompt || _report(_exceptionable, {
                                path: _path + ".userPrompt",
                                expected: "string",
                                value: input.userPrompt
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
                                userPrompt: {
                                    type: "string"
                                }
                            },
                            required: [
                                "userPrompt"
                            ],
                            additionalProperties: false,
                            $defs: {}
                        },
                        output: {
                            anyOf: [
                                {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "string"
                                        },
                                        error: {
                                            type: "string"
                                        }
                                    },
                                    required: [
                                        "status",
                                        "error"
                                    ]
                                },
                                {
                                    type: "object",
                                    properties: {
                                        subject: {},
                                        body: {},
                                        status: {
                                            type: "string"
                                        }
                                    },
                                    required: [
                                        "subject",
                                        "body",
                                        "status"
                                    ]
                                }
                            ]
                        },
                        validate: (() => { const _io0 = input => "string" === typeof input.userPrompt; const _vo0 = (input, _path, _exceptionable = true) => ["string" === typeof input.userPrompt || _report(_exceptionable, {
                                path: _path + ".userPrompt",
                                expected: "string",
                                value: input.userPrompt
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
                                userPrompt: {
                                    type: "string"
                                }
                            },
                            required: [
                                "userPrompt"
                            ],
                            additionalProperties: false,
                            $defs: {}
                        },
                        output: {
                            anyOf: [
                                {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "string"
                                        },
                                        error: {
                                            type: "string"
                                        }
                                    },
                                    required: [
                                        "status",
                                        "error"
                                    ]
                                },
                                {
                                    type: "object",
                                    properties: {
                                        subject: {},
                                        body: {},
                                        status: {
                                            type: "string"
                                        }
                                    },
                                    required: [
                                        "subject",
                                        "body",
                                        "status"
                                    ]
                                }
                            ]
                        },
                        validate: (() => { const _io0 = input => "string" === typeof input.userPrompt; const _vo0 = (input, _path, _exceptionable = true) => ["string" === typeof input.userPrompt || _report(_exceptionable, {
                                path: _path + ".userPrompt",
                                expected: "string",
                                value: input.userPrompt
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
                                userPrompt: {
                                    type: "string"
                                }
                            },
                            required: [
                                "userPrompt"
                            ],
                            additionalProperties: false,
                            $defs: {}
                        },
                        output: {},
                        validate: (() => { const _io0 = input => "string" === typeof input.userPrompt; const _vo0 = (input, _path, _exceptionable = true) => ["string" === typeof input.userPrompt || _report(_exceptionable, {
                                path: _path + ".userPrompt",
                                expected: "string",
                                value: input.userPrompt
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
                                userPrompt: {
                                    type: "string"
                                }
                            },
                            required: [
                                "userPrompt"
                            ],
                            additionalProperties: false,
                            $defs: {}
                        },
                        output: {
                            anyOf: [
                                {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "string"
                                        },
                                        error: {
                                            type: "string"
                                        }
                                    },
                                    required: [
                                        "status",
                                        "error"
                                    ]
                                },
                                {
                                    type: "object",
                                    properties: {
                                        subject: {},
                                        body: {},
                                        status: {
                                            type: "string"
                                        }
                                    },
                                    required: [
                                        "subject",
                                        "body",
                                        "status"
                                    ]
                                },
                                {
                                    type: "object",
                                    properties: {
                                        action: {
                                            type: "string"
                                        },
                                        analysis: {},
                                        message: {
                                            type: "string"
                                        }
                                    },
                                    required: [
                                        "action",
                                        "analysis",
                                        "message"
                                    ]
                                }
                            ]
                        },
                        validate: (() => { const _io0 = input => "string" === typeof input.userPrompt; const _vo0 = (input, _path, _exceptionable = true) => ["string" === typeof input.userPrompt || _report(_exceptionable, {
                                path: _path + ".userPrompt",
                                expected: "string",
                                value: input.userPrompt
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
                                userPrompt: {
                                    type: "string"
                                }
                            },
                            required: [
                                "userPrompt"
                            ],
                            additionalProperties: false,
                            $defs: {}
                        },
                        output: {
                            anyOf: [
                                {
                                    type: "object",
                                    properties: {
                                        status: {
                                            type: "string"
                                        },
                                        error: {
                                            type: "string"
                                        }
                                    },
                                    required: [
                                        "status",
                                        "error"
                                    ]
                                },
                                {
                                    type: "object",
                                    properties: {
                                        type: {
                                            type: "string"
                                        },
                                        projectId: {},
                                        results: {
                                            type: "array",
                                            items: {
                                                anyOf: [
                                                    {
                                                        type: "object",
                                                        properties: {
                                                            leadId: {},
                                                            status: {
                                                                type: "string"
                                                            },
                                                            error: {
                                                                type: "string"
                                                            }
                                                        },
                                                        required: [
                                                            "leadId",
                                                            "status",
                                                            "error"
                                                        ]
                                                    },
                                                    {
                                                        type: "object",
                                                        properties: {
                                                            leadId: {},
                                                            subject: {},
                                                            body: {},
                                                            status: {
                                                                type: "string"
                                                            }
                                                        },
                                                        required: [
                                                            "leadId",
                                                            "subject",
                                                            "body",
                                                            "status"
                                                        ]
                                                    }
                                                ]
                                            }
                                        }
                                    },
                                    required: [
                                        "type",
                                        "projectId",
                                        "results"
                                    ]
                                }
                            ]
                        },
                        validate: (() => { const _io0 = input => "string" === typeof input.userPrompt; const _vo0 = (input, _path, _exceptionable = true) => ["string" === typeof input.userPrompt || _report(_exceptionable, {
                                path: _path + ".userPrompt",
                                expected: "string",
                                value: input.userPrompt
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
                        name: "createLead",
                        parameters: {
                            type: "object",
                            properties: {
                                userPrompt: {
                                    type: "string"
                                }
                            },
                            required: [
                                "userPrompt"
                            ],
                            additionalProperties: false,
                            $defs: {}
                        },
                        output: {},
                        validate: (() => { const _io0 = input => "string" === typeof input.userPrompt; const _vo0 = (input, _path, _exceptionable = true) => ["string" === typeof input.userPrompt || _report(_exceptionable, {
                                path: _path + ".userPrompt",
                                expected: "string",
                                value: input.userPrompt
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
                            $defs: {}
                        },
                        output: {},
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
                                userPrompt: {
                                    type: "string"
                                }
                            },
                            required: [
                                "userPrompt"
                            ],
                            additionalProperties: false,
                            $defs: {}
                        },
                        output: {},
                        validate: (() => { const _io0 = input => "string" === typeof input.userPrompt; const _vo0 = (input, _path, _exceptionable = true) => ["string" === typeof input.userPrompt || _report(_exceptionable, {
                                path: _path + ".userPrompt",
                                expected: "string",
                                value: input.userPrompt
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
                        name: "createProject",
                        parameters: {
                            type: "object",
                            properties: {
                                userPrompt: {
                                    type: "string"
                                }
                            },
                            required: [
                                "userPrompt"
                            ],
                            additionalProperties: false,
                            $defs: {}
                        },
                        output: {},
                        validate: (() => { const _io0 = input => "string" === typeof input.userPrompt; const _vo0 = (input, _path, _exceptionable = true) => ["string" === typeof input.userPrompt || _report(_exceptionable, {
                                path: _path + ".userPrompt",
                                expected: "string",
                                value: input.userPrompt
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
                            $defs: {}
                        },
                        output: {},
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
                    }
                ]
            },
            execute: allFunctions,
        },
    ],
});
