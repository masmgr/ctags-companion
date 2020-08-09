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
exports.CtagsDefinitionProvider = void 0;
const vscode = __importStar(require("vscode"));
const helpers_1 = require("../helpers");
const index_1 = require("../index");
class CtagsDefinitionProvider {
    constructor(stash) {
        this.stash = stash;
    }
    async provideDefinition(document, position) {
        const symbol = document.getText(document.getWordRangeAtPosition(position));
        const scope = helpers_1.determineScope(document);
        const { symbolIndex } = await index_1.getIndexForScope(this.stash, scope);
        const definitions = symbolIndex[symbol];
        if (!definitions)
            return;
        return definitions.map(({ file, line }) => new vscode.Location(vscode.Uri.joinPath(scope.uri, file), new vscode.Position(line, 0)));
    }
}
exports.CtagsDefinitionProvider = CtagsDefinitionProvider;
//# sourceMappingURL=ctags_definition_provider.js.map