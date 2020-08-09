import * as vscode from "vscode";

import { determineScope, toSymbolKind } from "../helpers";
import { getIndexForScope } from "../index";

class CtagsDocumentSymbolProvider {
    stash: any;

    constructor(stash: any) {
        this.stash = stash;
    }

    async provideDocumentSymbols(document: any) {
        const relativePath = vscode.workspace.asRelativePath(document.uri, false);
        const scope = determineScope(document);
        const { documentIndex } = await getIndexForScope(this.stash, scope);

        const definitions = documentIndex[relativePath];
        if (!definitions) return;

        return definitions.map(({ symbol, file, line, kind, container }) =>
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
    }
}

export { CtagsDocumentSymbolProvider };
