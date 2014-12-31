CKEDITOR.dialog.add('simpleImage', 　
function(editor) {
    var parseAssetID = function(src) {
        return src.match(/image\/[0-9]*(?=\/)/).pop().split('/')[1]
    };　　　　
        return　 {
        title: 　 'Insert Image',
            resizable: 　CKEDITOR.DIALOG_RESIZE_BOTH,
            minWidth: 400,
            minHeight: 300,
            contents: 　[{　　　　　　　　　　
                id: 'info',
                    label: 'Properties',
            accessKey: 'P',
            elements: [{
            type: 'vbox',
            padding: 4,
            children: [{
                type: 'html',
                html: '<span style="font-weight:bold">' + "Image File" + '</span>'
            }, {
                type: 'hbox',
                widths: ['20%', '80%'],
                children: [{
                    type: 'button',
                    id: 'browse',
                    filebrowser: {
                        target: 'info:src',
                        action: 'Browse'
                    },
                    hidden: true,
                    align: 'center',
                    label: 'Browse Files'
                }, {
                    id: 'src',
                    type: 'text',
                    disabled: 'disabled',
                    label: '',
                    setup: function(contentHash) {
                        this.setValue(contentHash.src);
                    },
                    commit: function(commitHash) {
                        commitHash.src = this.getValue();
                    }
                }]
            }]
        }, {
            id: 'caption',
            type: 'text',
            label: 'Caption',
            required: true,
            setup: function(contentHash) {
                this.setValue(contentHash.caption);
            },
            commit: function(commitHash) {
                commitHash['caption'] = this.getValue();
            }
        }]
    }],
    onLoad: function() {
        var autoplay　 = 　false;
    },
    onShow: function() {
        var selectedElement = editor.getSelection().getStartElement(),
            imgDiv, contentHash = {
                src: '',
                caption: ''
            };
        this.oldMediaDiv = CgCk.getRootElement(selectedElement, 'div');
        if (this.oldMediaDiv != null) {
            imgDiv = this.oldMediaDiv.getChild(0);
            if (imgDiv && imgDiv.getChild(0) && _.include(['img'], imgDiv.getChild(0).getName())) {
                contentHash.src = imgDiv.getChild(0).getAttribute('src');
            }
            if (this.oldMediaDiv.getChildCount() == 2)
                contentHash.caption = this.oldMediaDiv.getChild(1).getText();
            else
                contentHash.caption = "";
            this.setupContent(contentHash);
        }
    },
    onHide: function() {},
    onOk: function() {
        var dialog = this,
            newMediaDiv, imgDiv, img, imgAttributes, captionDiv, commitHash = {
                src: 'plugins/multimedia/icons/icons.png',
                caption: ''
            };
        dialog.commitContent(commitHash);
        if (commitHash.src == '') {
            alert("File name cannot be empty");
            return false;
        }
        asset_id = parseAssetID(commitHash.src);
        newMediaDiv = CKEDITOR.dom.element.createFromHtml('<div class="figure cg_image embedded_asset" id="asset_' + asset_id + '"></div>', editor.document);
        imgDiv = CKEDITOR.dom.element.createFromHtml('<div class="media_container"></div>', editor.document);
        img = CKEDITOR.dom.element.createFromHtml('<img></img>', editor.document);
        imgAttributes = {
            src: commitHash.src
        };
        img.setAttributes(imgAttributes);
        img.appendTo(imgDiv);
        imgDiv.appendTo(newMediaDiv);
        if (commitHash.caption.length > 0) {
            captionDiv = CKEDITOR.dom.element.createFromHtml('<div class=caption>' + commitHash.caption + '</ div>', editor.document);
            captionDiv.appendTo(newMediaDiv);
        }
        if (dialog.oldMediaDiv) {
            newMediaDiv.replace(dialog.oldMediaDiv);
        } else {
            editor.insertElement(newMediaDiv);
        }
        var selection = editor.getSelection();
        var caret = selection.getRanges()[0];
        caret.moveToPosition(newMediaDiv, CKEDITOR.POSITION_AFTER_END);
        selection.selectRanges([caret]);
        delete dialog['oldMediaDiv'];
    }
};
});