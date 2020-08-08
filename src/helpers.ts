import * as vscode from "vscode";

import { EXTENSION_ID } from "./constants";

function determineScope(document: any) {
    return vscode.workspace.workspaceFolders.find(scope => document.uri.fsPath.includes(scope.uri.fsPath));
}

function getConfiguration(scope: vscode.Uri): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration(EXTENSION_ID, scope);
}

function toSymbolKind(kind: any): vscode.SymbolKind {
    switch (kind) {
        case "class": return vscode.SymbolKind.Class;
        case "function": return vscode.SymbolKind.Function;
        case "member": return vscode.SymbolKind.Method;
        case "variable": return vscode.SymbolKind.Variable;
    }
}

export { determineScope, getConfiguration, toSymbolKind };
