﻿
(function() {
    CKEDITOR.dialog.add('attachment', function(editor) {
        var selectableTargets = /^(_(?:self|top|parent|blank))$/;
        var parseAttachment = function(editor, attachmentDiv) {
            var retval = {};
            if (attachmentDiv) {
                retval.url = attachmentDiv.getChild(0).getAttribute('media_url');
                if (attachmentDiv.getChildCount() == 2)
                    retval.title = attachmentDiv.getChild(1).getText();
                else
                    retval.title = "";
            }
            this.oldMediaDiv = attachmentDiv;
            return retval;
        };

        function parseUrl(url) {
            var attachedFileName = url.match(/[^\/]*(?=\?)/i).pop(),
                fileParts = attachedFileName.split('.'),
                defaultExtName = 'misc',
                extName = null,
                iconSrc = null;
            var extTypes = ['aac', 'flv', 'mp4', 'ppt', 'tif', 'xlf', 'aiff', 'gif', 'mpeg', 'pptx', 'txt', 'xlfx', 'avi', 'jpg', 'mpeg4', 'rar', 'url', 'xls', 'bmp', 'odf', 'rtf', 'wav', 'zip', 'doc', 'mov', 'pdf', 'sit', 'wma', 'docx', 'mp3', 'png', 'tar', 'wmv']
            if (fileParts.length === 0) {
                extName = defaultExtName;
            } else {
                extName = fileParts.pop();
                if (!_.include(extTypes, extName)) {
                    extName = defaultExtName;
                }
            }
            return {
                filename: attachedFileName,
                className: "attach attach_" + extName,
                iconBasePath: CKEDITOR.basePath + 'plugins/attachment/icons/',
                knownIcon: extName + '.png',
                defaultIcon: defaultExtName + '.png'
            }
        };
        var parseAssetID = function(src) {
            return src.match(/attachment\/[0-9]*(?=\/)/).pop().split('/')[1]
        };
        return {
            title: editor.lang.attachment.title,
            minWidth: 420,
            minHeight: 200,
            caption: "foo",
            onShow: function() {
                var editor = this.getParentEditor(),
                    selection = editor.getSelection(),
                    range = selection.getRanges()[0],
                    element = null,
                    me = this,
                    attachmentDiv = CgCk.getRootElement(range.startContainer, 'div');
                this.setupContent(parseAttachment.apply(this, [editor, attachmentDiv]));
            },
            onOk: function() {
                var dialogHash = {
                        url: '',
                        title: ''
                    },
                    attachmentHash, me = this,
                    editor = this.getParentEditor(),
                    attachmentDiv = null;
                this.commitContent(dialogHash);
                attachmentHash = parseUrl(dialogHash.url);
                if (dialogHash.title == '')
                    dialogHash.title = attachmentHash.filename;
                asset_id = parseAssetID(dialogHash.url);
                attachmentDiv = CKEDITOR.dom.element.createFromHtml('<div class="figure cg_attachment embedded_asset" id="asset_' + asset_id + '">' + '<div class="media_container" media_url="' + dialogHash.url + '">' + '<img class=file_icon ' + 'src="' + attachmentHash.iconBasePath + attachmentHash.knownIcon + '"' + '>' + '</img></div>' + '<div class="caption">' + dialogHash.title + '</div></div>', editor.document);
                attachmentDiv.getChild(0).setAttribute('onerror', "src='" + attachmentHash.iconBasePath +
                    attachmentHash.defaultIcon + "'");
                if (this.oldMediaDiv) {
                    attachmentDiv.replace(this.oldMediaDiv);
                } else {
                    editor.insertElement(attachmentDiv);
                }
                var selection = editor.getSelection();
                var caret = selection.getRanges()[0];
                caret.moveToPosition(attachmentDiv, CKEDITOR.POSITION_AFTER_END);
                selection.selectRanges([caret]);
            },
            contents: [{
                label: editor.lang.common.generalTab,
                id: 'general',
                accessKey: 'I',
                elements: [{
                    type: 'vbox',
                    padding: 4,
                    children: [{
                        type: 'html',
                        html: '<span style="font-weight:bold">' + CKEDITOR.tools.htmlEncode(editor.lang.attachment.url) + '</span>'
                    }, {
                        type: 'hbox',
                        widths: ['20%', '80%'],
                        align: 'right',
                        children: [{
                            type: 'button',
                            id: 'browse',
                            filebrowser: {
                                target: 'general:src',
                                action: 'Browse',
                            },
                            hidden: true,
                            align: 'center',
                            label: "Browse Files",
                            setup: function(setupHash) {}
                        }, {
                            id: 'src',
                            type: 'text',
                            disabled: 'disabled',
                            style: 'background-color: #f6f6f6;',
                            label: '',
                            validate: CKEDITOR.dialog.validate.notEmpty(),
                            setup: function(setupHash) {
                                if (setupHash.url)
                                    this.setValue(setupHash.url);
                                this.select();
                            },
                            commit: function(dialogHash) {
                                dialogHash.url = this.getValue();
                            }
                        }]
                    }]
                }, {
                    type: 'vbox',
                    padding: 0,
                    children: [{
                        id: 'name',
                        type: 'text',
                        required: true,
                        label: editor.lang.attachment.name,
                        setup: function(setupHash) {
                            if (setupHash.title) this.setValue(setupHash.title);
                        },
                        commit: function(dialogHash) {
                            dialogHash.title = this.getValue();
                        }
                    }]
                }]
            }]
        }
    });
})();