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
exports.reindexScope = exports.reindexAll = exports.getIndexForScope = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const readline = __importStar(require("readline"));
const vscode = __importStar(require("vscode"));
const helpers_1 = require("./helpers");
async function getIndexForScope(stash, scope) {
    const indexes = stash.context.workspaceState.get("indexes");
    const path = scope.uri.fsPath;
    const isScopeIndexed = indexes && indexes.hasOwnProperty(path);
    if (!isScopeIndexed)
        await reindexScope(stash, scope);
    return stash.context.workspaceState.get("indexes")[path];
}
exports.getIndexForScope = getIndexForScope;
async function reindexAll(stash) {
    await Promise.all(vscode.workspace.workspaceFolders.map(scope => reindexScope(stash, scope)));
}
exports.reindexAll = reindexAll;
function reindexScope(stash, scope) {
    const tagsPath = path.join(scope.uri.fsPath, helpers_1.getConfiguration(scope).get("path"));
    if (!fs.existsSync(tagsPath)) {
        stash.statusBarItem.text = (`$(warning) Ctags Companion: file ${helpers_1.getConfiguration(scope).get("path")} not found, ` +
            'you may need rerun "rebuild ctags" task');
        stash.statusBarItem.show();
        return;
    }
    return new Promise(resolve => {
        stash.statusBarItem.text = `$(refresh) Ctags Companion: reindexing ${scope.name}...`;
        stash.statusBarItem.show();
        const input = fs.createReadStream(tagsPath);
        const reader = readline.createInterface({ input, terminal: false, crlfDelay: Infinity });
        const symbolIndex = {};
        const documentIndex = {};
        reader.on("line", (line) => {
            if (line.startsWith("!"))
                return;
            const [symbol, file, ...rest] = line.split("\t");
            const lineNumberStr = rest.find(value => value.startsWith("line:")).substring(5);
            const lineNumber = parseInt(lineNumberStr, 10) - 1;
            const kind = rest.find(value => value.startsWith("kind:")).substring(5);
            const container = rest.find(value => value.startsWith("class:"));
            const containerName = container && container.substring(6);
            const definition = { symbol, file, line: lineNumber, kind, container: containerName };
            if (!symbolIndex.hasOwnProperty(symbol))
                symbolIndex[symbol] = [];
            symbolIndex[symbol].push(definition);
            if (!documentIndex.hasOwnProperty(file))
                documentIndex[file] = [];
            documentIndex[file].push(definition);
        });
        reader.on("close", () => {
            const indexes = stash.context.workspaceState.get("indexes") || {};
            indexes[scope.uri.fsPath] = { symbolIndex, documentIndex };
            stash.context.workspaceState.update("indexes", indexes);
            stash.statusBarItem.hide();
            resolve();
        });
    });
}
exports.reindexScope = reindexScope;
//# sourceMappingURL=index.js.map