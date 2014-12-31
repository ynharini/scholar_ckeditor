(function() {
    var attachmentCmd = {
        exec: function(editor) {
            editor.openDialog('attachment', setAttachmentTypeAll);
            return;
        }
    };

    function setAttachmentTypeAll(dialog) {
        dialog.attachmentType = null;
    };
    var attachmentCmdPdf = {
        exec: function(editor) {
            editor.openDialog('attachment', setAttachmentTypePdf);
            return;
        }
    };

    function setAttachmentTypePdf(dialog) {
        dialog.attachmentType = "application/pdf";
    };
    var attachmentCmdDoc = {
        exec: function(editor) {
            editor.openDialog('attachment', setAttachmentTypeDoc);
            return;
        }
    };

    function setAttachmentTypeDoc(dialog) {
        dialog.attachmentType = "application/msword";
    };
    var attachmentCmdTxt = {
        exec: function(editor) {
            editor.openDialog('attachment', setAttachmentTypeTxt);
            return;
        }
    };

    function setAttachmentTypeTxt(dialog) {
        dialog.attachmentType = "text/plain";
    };
    CKEDITOR.plugins.add('attachment', {
        lang: ['en', 'ru', 'uk'],
        requires: ['dialog'],
        init: function(editor) {
            var commandName = 'attachment';
            editor.addCommand(commandName, attachmentCmd);
            editor.ui.addButton('Attachment', {
                label: editor.lang.attachment.button,
                command: commandName,
                icon: "plugins/multimedia/icons/attachment.png"
            });
            CKEDITOR.dialog.add(commandName, CKEDITOR.getUrl(this.path + 'dialogs/attachment.js'))
            editor.on('doubleclick', function(evt) {
                var div = CgCk.getRootElement(evt.data.element, 'div');
                if (div != null && !div.isReadOnly()) {
                    if (div.hasAttribute('class') && _.intersection(div.getAttribute('class').split(' '), ['cg_attachment', 'figure']).length === 2)
                        evt.data.dialog = 'attachment';
                }
            });
        }
    })
})();