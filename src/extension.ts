import * as vscode from 'vscode';

// CSS 处理对象，来自你提供的代码
const lCSSCoder = {
    format: function (s: string): string {
        s = s.replace(/\s*([\{\}\:\;\,])\s*/g, "$1");
        s = s.replace(/;\s*;/g, ";");
        s = s.replace(/\,[\s\.\#\d]*{/g, "{");
        s = s.replace(/([^\s])\{([^\s])/g, "$1 {\n\t$2");
        s = s.replace(/([^\s])\}([^\n]*)/g, "$1\n}\n$2");
        s = s.replace(/([^\s]);([^\s\}])/g, "$1;\n\t$2");
        return s;
    },
    packAdv: function (s: string): string {
        s = s.replace(/\/\*(.|\n)*?\*\//g, "");
        s = s.replace(/\s*([\{\}\:\;\,])\s*/g, "$1");
        s = s.replace(/\,[\s\.\#\d]*\{/g, "{");
        s = s.replace(/;\s*;/g, ";");
        const match = s.match(/^\s*(\S+(\s+\S+)*)\s*$/);
        return (match == null) ? "" : match[1];
    },
    pack: function (s: string): string {
        s = s.replace(/\/\*(.|\n)*?\*\//g, "");
        s = s.replace(/\s*([\{\}\:\;\,])\s*/g, "$1");
        s = s.replace(/\,[\s\.\#\d]*\{/g, "{");
        s = s.replace(/;\s*;/g, ";");
        s = s.replace(/;\s*}/g, "}");
        s = s.replace(/([^\s])\{([^\s])/g, "$1{$2");
        s = s.replace(/([^\s])\}([^\n]s*)/g, "$1}\n$2");
        return s;
    }
};

// 插件激活函数
export function activate(context: vscode.ExtensionContext) {
    // 注册 Format 命令
    context.subscriptions.push(vscode.commands.registerCommand('cssCoder.format', () => {
        processCSS('format');
    }));

    // 注册 Pack Advanced 命令
    context.subscriptions.push(vscode.commands.registerCommand('cssCoder.packAdv', () => {
        processCSS('packAdv');
    }));

    // 注册 Pack 命令
    context.subscriptions.push(vscode.commands.registerCommand('cssCoder.pack', () => {
        processCSS('pack');
    }));
}

// 处理 CSS 代码的通用函数
function processCSS(mode: 'format' | 'packAdv' | 'pack') {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor found.');
        return;
    }

    const document = editor.document;
    if (document.languageId !== 'css') {
        vscode.window.showErrorMessage('This command is only available for CSS files.');
        return;
    }

    const text = document.getText();
    let processedText: string;

    // 根据模式调用不同的处理函数
    switch (mode) {
        case 'format':
            processedText = lCSSCoder.format(text);
            break;
        case 'packAdv':
            processedText = lCSSCoder.packAdv(text);
            break;
        case 'pack':
            processedText = lCSSCoder.pack(text);
            break;
        default:
            vscode.window.showErrorMessage('Invalid mode.');
            return;
    }

    // 替换编辑器中的文本
    editor.edit(editBuilder => {
        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(text.length)
        );
        editBuilder.replace(fullRange, processedText);
    }).then(success => {
        if (success) {
            vscode.window.showInformationMessage(`CSS ${mode}d successfully!`);
        } else {
            vscode.window.showErrorMessage(`Failed to ${mode} CSS.`);
        }
    });
}

// 插件卸载函数
export function deactivate() {}
