const vscode = require('vscode');
const fs = require('fs');
const readline = require('readline');

// TODO
// [2020-02-22 17:34:57.024] [exthost] [warning] [Deprecation Warning] 'workspace.rootPath' is deprecated. Please use 'workspace.workspaceFolders' instead. More details: https://aka.ms/vscode-eliminating-rootpath
// ctags on save
// maintain multiple tag files: one for .venv (slow, ctagged once) and one for project (fast, ctagged on every file save), and merge them into a single index
// enable for languages
// SymbolInformation containerName
// non-python specific symbol kinds

function activate(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand('ctags-companion.reindex', () => reindex(context))
    );

    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(
            { scheme: "file" },
            {
                provideDefinition: async (document, position) => {
                    const symbol = document.getText(document.getWordRangeAtPosition(position));
                    const index = await getIndex(context);
                    const results = index[symbol];

                    if (!results) return;

                    return results.map(({ file, line }) =>
                        new vscode.Location(
                            vscode.Uri.file(vscode.workspace.rootPath + "/" + file),
                            new vscode.Position(line, 0)
                        )
                    );
                }
            }
        )
    );

    context.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider(
            { scheme: "file" },
            {
                provideDocumentSymbols: async (document) => {
                    const relativePath = vscode.workspace.asRelativePath(document.uri);
                    const definitions = (await getDocumentIndex(context))[relativePath];
                    if (!definitions) return;
                    return definitions.map(({ symbol, file, line, kind }) =>
                        new vscode.SymbolInformation(
                            symbol,
                            toSymbolKind(kind),
                            null,
                            new vscode.Location(
                                vscode.Uri.file(vscode.workspace.rootPath + "/" + file),
                                new vscode.Position(line, 0)
                            )
                        )
                    );
                }
            },
            { label: "Ctags Companion" }
        )
    );

    context.subscriptions.push(
        vscode.languages.registerWorkspaceSymbolProvider(
            {
                provideWorkspaceSymbols: async (query) => {
                    if (!query) return;

                    const index = await getIndex(context);
                    return Object.entries(index)
                        .filter(([symbol]) => symbol.toLowerCase().includes(query.toLowerCase()))
                        .flatMap(([_, definitions]) => definitions)
                        .map(({ symbol, file, line, kind }) =>
                            new vscode.SymbolInformation(
                                symbol,
                                toSymbolKind(kind),
                                null,
                                new vscode.Location(
                                    vscode.Uri.file(vscode.workspace.rootPath + "/" + file),
                                    new vscode.Position(line, 0)
                                )
                            )
                        );
                }
            }
        )
    );

    context.subscriptions.push(
        vscode.tasks.registerTaskProvider("shell", {
            provideTasks: () => {
                const task = new vscode.Task(
                    { type: "shell" },
                    vscode.TaskScope.Workspace,
                    "ctags",
                    "Ctags Companion",
                    new vscode.ShellExecution("ctags -R --python-kinds=-i --fields=+nKz -f .tags"),
                    []
                );
                task.presentationOptions.reveal = false;
                return [task];
            },
            resolveTask: (task) => task
        })
    );
}

async function getIndex(context) {
    const index = context.workspaceState.get("index");
    if (!index) await reindex(context);
    return context.workspaceState.get("index");
}

async function getDocumentIndex(context) {
    const index = context.workspaceState.get("documentIndex");
    if (!index) await reindex(context);
    return context.workspaceState.get("documentIndex");
}

function reindex(context) {
    return new Promise(resolve => {
        const input = fs.createReadStream(vscode.workspace.rootPath + "/.tags");
        const reader = readline.createInterface({ input, terminal: false, crlfDelay: Infinity });

        const index = {};
        const documentIndex = {};

        reader.on("line", (line) => {
            if (line.startsWith("!")) return;

            const [symbol, file, ...rest] = line.split("\t");
            const lineNumberStr = rest.find(value => value.startsWith("line:")).substring(5);
            const lineNumber = parseInt(lineNumberStr, 10) - 1;
            const kind = rest.find(value => value.startsWith("kind:")).substring(5);
            const definition = { symbol, file, line: lineNumber, kind };

            if (!index.hasOwnProperty(symbol)) index[symbol] = [];
            index[symbol].push(definition);

            if (!documentIndex.hasOwnProperty(file)) documentIndex[file] = [];
            documentIndex[file].push(definition);
        });

        reader.on("close", () => {
            vscode.window.showInformationMessage("Ctags Companion: reindex complete!");
            context.workspaceState.update("index", index);
            context.workspaceState.update("documentIndex", documentIndex);
            resolve();
        });
    });
}

function toSymbolKind(kind) {
    switch (kind) {
        case "class": return vscode.SymbolKind.Class;
        case "function": return vscode.SymbolKind.Function;
        case "member": return vscode.SymbolKind.Method;
        case "variable": return vscode.SymbolKind.Variable;
    }
}

exports.activate = activate;

module.exports = {
    activate
};
