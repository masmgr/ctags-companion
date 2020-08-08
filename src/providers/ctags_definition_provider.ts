import * as vscode from "vscode";

import { determineScope } from "../helpers";
import { getIndexForScope } from "../index";

class CtagsDefinitionProvider {
    stash: any;

    constructor(stash: any) {
        this.stash = stash;
    }

    async provideDefinition(document: any, position: any) {
        const symbol = document.getText(document.getWordRangeAtPosition(position));
        const scope = determineScope(document);
        const { symbolIndex } = await getIndexForScope(this.stash, scope);

        const definitions = symbolIndex[symbol];
        if (!definitions) return;

        return definitions.map(({ file, line }) =>
            new vscode.Location(
                vscode.Uri.joinPath(scope.uri, file),
                new vscode.Position(line, 0)
            )
        );
    }
}

export { CtagsDefinitionProvider };
