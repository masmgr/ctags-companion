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
exports.CtagsDocumentSymbolProvider = void 0;
const vscode = __importStar(require("vscode"));
const helpers_1 = require("../helpers");
const index_1 = require("../index");
class CtagsDocumentSymbolProvider {
    constructor(stash) {
        this.stash = stash;
    }
    async provideDocumentSymbols(document) {
        const relativePath = vscode.workspace.asRelativePath(document.uri, false);
        const scope = helpers_1.determineScope(document);
        const { documentIndex } = await index_1.getIndexForScope(this.stash, scope);
        const definitions = documentIndex[relativePath];
        if (!definitions)
            return;
        return definitions.map(({ symbol, file, line, kind, container }) => new vscode.SymbolInformation(symbol, helpers_1.toSymbolKind(kind), container, new vscode.Location(vscode.Uri.joinPath(scope.uri, file), new vscode.Position(line, 0))));
    }
}
exports.CtagsDocumentSymbolProvider = CtagsDocumentSymbolProvider;
//# sourceMappingURL=ctags_document_symbol_provider.js.map