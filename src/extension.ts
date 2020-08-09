import * as vscode from 'vscode';

import { CtagsDefinitionProvider } from "./providers/ctags_definition_provider";
import { CtagsDocumentSymbolProvider } from "./providers/ctags_document_symbol_provider";
import { CtagsWorkspaceSymbolProvider } from "./providers/ctags_workspace_symbol_provider";
import { EXTENSION_ID, EXTENSION_NAME, TASK_NAME } from "./constants";
import { getConfiguration } from "./helpers";
import { reindexAll, reindexScope } from "./index";
import { runTests } from "./tests";

class Stash {
    context: any;
    statusBarItem: any;

    constructor(context: any) {
        this.context = context;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    }
}

function activate(context: any) {
    const stash = new Stash(context);

    if (process.env.CTAGS_COMPANION_TEST) runTests(stash);

    const documentSelector = vscode.workspace.getConfiguration(EXTENSION_ID).get("documentSelector");

    context.subscriptions.push(stash.statusBarItem);

    context.subscriptions.push(vscode.commands.registerCommand(`${EXTENSION_ID}.reindex`, () => reindexAll(stash)));

    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(
            documentSelector,
            new CtagsDefinitionProvider(stash)
        )
    );

    context.subscriptions.push(
        vscode.languages.registerDocumentSymbolProvider(
            documentSelector,
            new CtagsDocumentSymbolProvider(stash),
            { label: EXTENSION_NAME }
        )
    );

    context.subscriptions.push(
        vscode.languages.registerWorkspaceSymbolProvider(
            new CtagsWorkspaceSymbolProvider(stash)
        )
    );

    vscode.workspace.workspaceFolders.forEach(scope =>
        context.subscriptions.push(
            vscode.tasks.registerTaskProvider("shell", {
                provideTasks: () => {
                    const command = getConfiguration(scope).get("command");
                    const task = new vscode.Task(
                        { type: "shell" },
                        scope,
                        TASK_NAME,
                        EXTENSION_NAME,
                        new vscode.ShellExecution(command),
                        []
                    );
                    task.presentationOptions.reveal = false;
                    return [task];
                },
                resolveTask: (task: any) => task
            })
        ));

    vscode.tasks.onDidEndTask(event => {
        const { source, name, scope } = event.execution.task;
        if (source == EXTENSION_NAME && name == TASK_NAME) reindexScope(stash, scope);
    });
}

exports.activate = activate;
export { activate };
