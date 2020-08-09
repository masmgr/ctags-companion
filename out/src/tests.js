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
exports.runTests = void 0;
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const ctags_definition_provider_1 = require("./providers/ctags_definition_provider");
const ctags_document_symbol_provider_1 = require("./providers/ctags_document_symbol_provider");
const ctags_workspace_symbol_provider_1 = require("./providers/ctags_workspace_symbol_provider");
const index_1 = require("./index");
async function runTests(stash) {
    console.log("Running tests...");
    const document = await vscode.workspace.openTextDocument(path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, "source.py"));
    testCtagsDefinitionProvider(stash, document);
    testCtagsDocumentSymbolProvider(stash, document);
    testCtagsWorkspaceSymbolProvider(stash);
    testReindexAll(stash);
}
exports.runTests = runTests;
async function testCtagsDefinitionProvider(stash, document) {
    const provider = new ctags_definition_provider_1.CtagsDefinitionProvider(stash);
    const [konstantDefinition] = await provider.provideDefinition(document, new vscode.Position(9, 21));
    assert(() => konstantDefinition.uri.path.endsWith("source.py"));
    assert(() => konstantDefinition.range.start.line === 0);
    const [funktionDefinition] = await provider.provideDefinition(document, new vscode.Position(9, 12));
    assert(() => funktionDefinition.uri.path.endsWith("source.py"));
    assert(() => funktionDefinition.range.start.line === 3);
    const [klassDefinition] = await provider.provideDefinition(document, new vscode.Position(12, 3));
    assert(() => klassDefinition.uri.path.endsWith("source.py"));
    assert(() => klassDefinition.range.start.line === 7);
    const [methodDefinition] = await provider.provideDefinition(document, new vscode.Position(12, 8));
    assert(() => methodDefinition.uri.path.endsWith("source.py"));
    assert(() => methodDefinition.range.start.line === 8);
    const printDefinitions = await provider.provideDefinition(document, new vscode.Position(4, 7));
    assert(() => printDefinitions === undefined);
}
async function testCtagsDocumentSymbolProvider(stash, document) {
    const provider = new ctags_document_symbol_provider_1.CtagsDocumentSymbolProvider(stash);
    const definitions = await provider.provideDocumentSymbols(document);
    assert(() => definitions.length == 4);
    assert(() => definitions[0].name === "KONSTANT");
    assert(() => definitions[0].kind === vscode.SymbolKind.Variable);
    assert(() => definitions[0].location.uri.path.endsWith("source.py"));
    assert(() => definitions[0].location.range.start.line === 0);
    assert(() => definitions[1].name === "Klass");
    assert(() => definitions[1].kind === vscode.SymbolKind.Class);
    assert(() => definitions[1].location.uri.path.endsWith("source.py"));
    assert(() => definitions[1].location.range.start.line === 7);
    assert(() => definitions[2].name === "funktion");
    assert(() => definitions[2].kind === vscode.SymbolKind.Function);
    assert(() => definitions[2].location.uri.path.endsWith("source.py"));
    assert(() => definitions[2].location.range.start.line === 3);
    assert(() => definitions[3].name === "method");
    assert(() => definitions[3].kind === vscode.SymbolKind.Method);
    assert(() => definitions[3].location.uri.path.endsWith("source.py"));
    assert(() => definitions[3].location.range.start.line === 8);
}
async function testCtagsWorkspaceSymbolProvider(stash) {
    const provider = new ctags_workspace_symbol_provider_1.CtagsWorkspaceSymbolProvider(stash);
    const definitionsForBlankQuery = await provider.provideWorkspaceSymbols("");
    assert(() => definitionsForBlankQuery === undefined);
    const definitionsForExactMatch = await provider.provideWorkspaceSymbols("Klass");
    assert(() => definitionsForExactMatch.length === 1);
    assert(() => definitionsForExactMatch[0].name === "Klass");
    assert(() => definitionsForExactMatch[0].kind === vscode.SymbolKind.Class);
    assert(() => definitionsForExactMatch[0].location.uri.path.endsWith("source.py"));
    assert(() => definitionsForExactMatch[0].location.range.start.line === 7);
    const definitionsForPartialMatch = await provider.provideWorkspaceSymbols("kla");
    assert(() => definitionsForPartialMatch.length === 1);
    assert(() => definitionsForPartialMatch[0].name === "Klass");
    assert(() => definitionsForPartialMatch[0].kind === vscode.SymbolKind.Class);
    assert(() => definitionsForPartialMatch[0].location.uri.path.endsWith("source.py"));
    assert(() => definitionsForPartialMatch[0].location.range.start.line === 7);
    const definitionsForMultipleMatches = await provider.provideWorkspaceSymbols("k");
    assert(() => definitionsForMultipleMatches.every(({ name }) => ["KONSTANT", "Klass", "funktion"].includes(name)));
    const definitionsForUnknownMatch = await provider.provideWorkspaceSymbols("unknown");
    assert(() => definitionsForUnknownMatch.length === 0);
}
async function testReindexAll(stash) {
    stash.context.workspaceState.update("indexes", null);
    assert(() => stash.context.workspaceState.get("indexes") === null);
    await index_1.reindexAll(stash);
    assert(() => stash.context.workspaceState.get("indexes") !== null);
}
function assert(condition) {
    if (condition()) {
        console.count("pass");
    }
    else {
        console.count("fail");
        console.error("FAIL: ", condition.toString());
        vscode.window.showErrorMessage(`FAIL: ${condition.toString()}`);
    }
}
//# sourceMappingURL=tests.js.map