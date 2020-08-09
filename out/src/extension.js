"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const ctags_definition_provider_1 = require("./providers/ctags_definition_provider");
const ctags_document_symbol_provider_1 = require("./providers/ctags_document_symbol_provider");
const ctags_workspace_symbol_provider_1 = require("./providers/ctags_workspace_symbol_provider");
const constants_1 = require("./constants");
const helpers_1 = require("./helpers");
const index_1 = require("./index");
const tests_1 = require("./tests");
class Stash {
    constructor(context) {
        this.context = context;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    }
}
function activate(context) {
    const stash = new Stash(context);
    if (process.env.CTAGS_COMPANION_TEST)
        tests_1.runTests(stash);
    const documentSelector = vscode.workspace.getConfiguration(constants_1.EXTENSION_ID).get("documentSelector");
    context.subscriptions.push(stash.statusBarItem);
    context.subscriptions.push(vscode.commands.registerCommand(`${constants_1.EXTENSION_ID}.reindex`, () => index_1.reindexAll(stash)));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(documentSelector, new ctags_definition_provider_1.CtagsDefinitionProvider(stash)));
    context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(documentSelector, new ctags_document_symbol_provider_1.CtagsDocumentSymbolProvider(stash), { label: constants_1.EXTENSION_NAME }));
    context.subscriptions.push(vscode.languages.registerWorkspaceSymbolProvider(new ctags_workspace_symbol_provider_1.CtagsWorkspaceSymbolProvider(stash)));
    vscode.workspace.workspaceFolders.forEach(scope => context.subscriptions.push(vscode.tasks.registerTaskProvider("shell", {
        provideTasks: () => {
            const command = helpers_1.getConfiguration(scope).get("command");
            const task = new vscode.Task({ type: "shell" }, scope, constants_1.TASK_NAME, constants_1.EXTENSION_NAME, new vscode.ShellExecution(command), []);
            task.presentationOptions.reveal = false;
            return [task];
        },
        resolveTask: (task) => task
    })));
    vscode.tasks.onDidEndTask(event => {
        const { source, name, scope } = event.execution.task;
        if (source == constants_1.EXTENSION_NAME && name == constants_1.TASK_NAME)
            index_1.reindexScope(stash, scope);
    });
}
exports.activate = activate;
exports.activate = activate;
//# sourceMappingURL=extension.js.map