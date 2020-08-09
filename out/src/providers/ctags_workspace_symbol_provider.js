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
exports.CtagsWorkspaceSymbolProvider = void 0;
const vscode = __importStar(require("vscode"));
const helpers_1 = require("../helpers");
const index_1 = require("../index");
class CtagsWorkspaceSymbolProvider {
    constructor(stash) {
        this.stash = stash;
    }
    async provideWorkspaceSymbols(query) {
        if (!query)
            return;
        const indexes = await Promise.all(vscode.workspace.workspaceFolders.map(async (scope) => [scope, await index_1.getIndexForScope(this.stash, scope)]));
        return indexes.flatMap(([scope, { symbolIndex }]) => {
            return Object.entries(symbolIndex)
                .filter(([symbol]) => symbol.toLowerCase().includes(query.toLowerCase()))
                .flatMap(([_, definitions]) => definitions)
                .map(({ symbol, file, line, kind, container }) => new vscode.SymbolInformation(symbol, helpers_1.toSymbolKind(kind), container, new vscode.Location(vscode.Uri.joinPath(scope.uri, file), new vscode.Position(line, 0))));
        });
    }
}
exports.CtagsWorkspaceSymbolProvider = CtagsWorkspaceSymbolProvider;
//# sourceMappingURL=ctags_workspace_symbol_provider.js.map