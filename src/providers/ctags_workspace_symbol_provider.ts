import * as vscode from "vscode";

import { toSymbolKind } from "../helpers";
import { getIndexForScope } from "../index";

class CtagsWorkspaceSymbolProvider {
    stash: any;
    
    constructor(stash: any) {
        this.stash = stash;
    }

    async provideWorkspaceSymbols(query: any) {
        if (!query) return;

        const indexes = await Promise.all(
            vscode.workspace.workspaceFolders.map(
                async scope => [scope, await getIndexForScope(this.stash, scope)]
            )
        );

        return indexes.flatMap(([scope, { symbolIndex }]) => {
            return Object.entries(symbolIndex)
                .filter(([symbol]) => symbol.toLowerCase().includes(query.toLowerCase()))
                .flatMap(([_, definitions]) => definitions)
                .map(({ symbol, file, line, kind, container }) =>
                    new vscode.SymbolInformation(
                        symbol,
                        toSymbolKind(kind),
                        container,
                        new vscode.Location(
                            vscode.Uri.joinPath(scope.uri, file),
                            new vscode.Position(line, 0)
                        )
                    )
                );
        });
    }
}

export { CtagsWorkspaceSymbolProvider };
