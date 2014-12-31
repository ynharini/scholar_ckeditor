﻿
CKEDITOR.dialog.add('flvPlayerAudio', 　
function(editor) {
    var getPlaceHolderImageUrl = function(dialog) {
        var url = dialog.getValueOf('info', 'place_holder_src');
        if (!url || url == "")
            url = CKEDITOR.basePath + "plugins/multimedia/thumb_audio.png";
        return url;
    };
    var movieUrl = function(dialog) {
        var mysrc = dialog.getValueOf('info', 'src');
        var url = escape(mysrc);
        if (url.indexOf('http') != 0)
            url　 = window.location.protocol + "//" + window.location.host + url;
        return url;
    };
    var parseAssetID = function(src) {
        return src.match(/audio\/[0-9]*(?=\/)/).pop().split('/')[1]
    };
    var refreshPreview = function(dialog) {
        var shouldShowPreview = false;
        shouldShowPreview = (dialog.getValueOf('info', 'src') != '');
        if (shouldShowPreview) {
            var mywidth = "350px";
            var myheight = "100px";
            var mysrc　 = 　dialog.getContentElement("info", "src").getValue();
            var media_url　 = movieUrl(dialog);　
                var playList = [];
            playList.push({
                url: getPlaceHolderImageUrl(dialog)
            });
            playList.push({
                autoPlay: false,
                url: dialog.getValueOf('info', 'src'),
                coverImage: {
                    url: getPlaceHolderImageUrl(dialog)
                }
            });
            var flashvars = JSON.stringify({
                'playlist': playList
            });
            var src = "<img src='" + getPlaceHolderImageUrl(dialog) + "' class='audio_placeholder' /><br/>";
            src += "<audio src='" + dialog.getValueOf('info', 'src') + "' controls preload class='audiojs' />";
            var loader = CKEDITOR.document.getById('FlashAudioPreviewBox');
            loader.setHtml(src);
            CKEDITOR.document.getById('FlashAudioPreviewBox').setStyle('display', 'block');
        } else {
            CKEDITOR.document.getById('FlashAudioPreviewBox').setStyle('display', 'none');
        }
    };　　　　
        var　 escape　 = function(value) {
        return　 value;　　　　
    };
    var previewAreaHtml = '<div>' + "<span style='font-weight:bold'>Audio Player Preview</span>" + '<br><br>' + '<div id="FlashPreviewLoader" style="display:none"><div class="loading">&nbsp;</div></div>' + '<div style="text-align:center;" id="FlashAudioPreviewBox"></div></div>';
    return　 {
        title: 　 'Insert Audio',
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
                html: '<span style="font-weight:bold">' + "Audio File" + '</span>'
            }, {
                type: 'hbox',
                widths: ['20%', '80%'],
                children: [{
                    type: 'button',
                    id: 'browse',
                    filebrowser: {
                        target: 'info:src',
                        action: 'Browse',
                        onSelect: function() {
                            var i = 2;
                            this.getDialog().getName();
                        }
                    },
                    hidden: true,
                    align: 'center',
                    label: 'Browse Files'
                }, {
                    id: 'src',
                    type: 'text',
                    disabled: 'disabled',
                    label: '',
                    onChange: function() {
                        refreshPreview(this.getDialog());
                    },
                    setup: function(setupHash) {
                        this.setValue(setupHash['media_url']);
                    },
                    commit: function(commitHash) {}
                }]
            }]
        }, {
            type: 'vbox',
            padding: 4,
            children: [{
                type: 'html',
                html: '<span style="font-weight:bold">' + "Custom Placeholder Image" + '</span>'
            }, {
                type: 'hbox',
                widths: ['20%', '80%'],
                children: [{
                    type: 'button',
                    id: 'browse_place_holder',
                    filebrowser: {
                        target: 'info:place_holder_src',
                        action: 'Browse',
                        url: editor.config.filebrowserSimpleImageBrowseUrl
                    },
                    hidden: true,
                    align: 'center',
                    label: 'Browse Files'
                }, {
                    id: 'place_holder_src',
                    type: 'text',
                    disabled: 'disabled',
                    label: '',
                    onChange: function() {
                        refreshPreview(this.getDialog());
                    },
                    setup: function(setupHash) {
                        this.setValue(setupHash['placeholder_url']);
                    },
                    commit: function(commitHash) {}
                }],
            }]
        }, {
            id: 'caption',
            type: 'text',
            label: 'Caption',
            required: true,
            setup: function(setupHash) {
                this.setValue(setupHash['caption']);
            },
            commit: function(commitHash) {
                commitHash['caption'] = this.getValue()
            }
        }, {　
                    type: 'vbox',
                        children: [{
            type: 'html',
            style: 'width:100%',
            id: 'preview',
            html: previewAreaHtml
        }]
    }]
}],
onLoad: function() {
    var loader = CKEDITOR.document.getById('FlashAudioPreviewBox');
    loader.setHtml("");
},
onShow: function() {
    var selectedElement = editor.getSelection().getStartElement(),
        audioDiv, setupHash = {};
    this.oldMediaDiv = CgCk.getRootElement(selectedElement, 'div');
    if (this.oldMediaDiv != null) {
        if (this.oldMediaDiv.getChildCount() == 2)
            setupHash['caption'] = this.oldMediaDiv.getChild(1).getText();
        else
            setupHash['caption'] = "";
        audioDiv = this.oldMediaDiv.getChild(0);
        setupHash['width'] = audioDiv.getAttribute('width');
        setupHash['height'] = audioDiv.getAttribute('height');
        setupHash['media_url'] = audioDiv.getAttribute('media_url');
        setupHash['placeholder_url'] = audioDiv.getAttribute('placeholder_url');
        this.setupContent(setupHash);
        refreshPreview(this.getDialog());
    } else {　
                    var loader = CKEDITOR.document.getById('FlashAudioPreviewBox');
        loader.setHtml("");
    }
},
onHide: function() {},
onOk: function() {
    var dialog = this,
        newMediaDiv = null,
        audioDiv = null,
        placeholderImg = null,
        captionDiv = null,
        mywidth　 = "350px",
        myheight = "100px",
        commitHash = {};
    if (this.getValueOf('info', 'src') == "") {
        alert("File name cannot be empty");
        return false;
    }
    if (isNaN(mywidth.indexOf("px") > 0 ? mywidth.substring(0, mywidth.indexOf("px")) : mywidth)) {
        alert("Video width must be a valid number.");
        return false;
    }
    if (isNaN(myheight.indexOf("px") > 0 ? myheight.substring(0, myheight.indexOf("px")) : myheight)) {
        alert("Video height must be a valid number");
        return false;
    }
    this.commitContent(commitHash);
    asset_id = parseAssetID(movieUrl(dialog));
    newMediaDiv = CKEDITOR.dom.element.createFromHtml('<div class="figure cg_audio embedded_asset" id="asset_' + asset_id + '"></div>', editor.document);
    audioDiv = CKEDITOR.dom.element.createFromHtml('<div class="media_container"></div>', editor.document);
    var audioDivAttrs = {
        width: mywidth,
        height: myheight,
        media_url: movieUrl(dialog),
        placeholder_url: getPlaceHolderImageUrl(dialog)
    };
    audioDiv.setAttributes(audioDivAttrs);
    placeholderImg = CKEDITOR.dom.element.createFromHtml('<img src="' + getPlaceHolderImageUrl(dialog) + '" />', editor.document);
    placeholderImg.appendTo(audioDiv);
    audioDiv.appendTo(newMediaDiv);
    if (commitHash['caption'] != null && commitHash['caption'].length > 0) {
        captionDiv = CKEDITOR.dom.element.createFromHtml('<div class=caption>' + commitHash['caption'] + '</ div>', editor.document);
        captionDiv.appendTo(newMediaDiv);
    }
    if (this.oldMediaDiv) {
        newMediaDiv.replace(this.oldMediaDiv);
    } else {
        editor.insertElement(newMediaDiv);
    }
    var selection = editor.getSelection();
    var caret = selection.getRanges()[0];
    caret.moveToPosition(newMediaDiv, CKEDITOR.POSITION_AFTER_END);
    selection.selectRanges([caret]);
    delete this['oldMediaDiv'];
}
};
});