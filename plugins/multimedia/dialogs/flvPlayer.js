﻿
CKEDITOR.dialog.add('flvPlayer', 　
function(editor) {　　　　
        var getPlaceHolderImageUrl = function(dialog) {
            var url = dialog.getValueOf('info', 'src');
            var place_holder_index = dialog.getValueOf('info', 'place_holder');
            var customPlaceHolderUrl = dialog.getValueOf('info', 'custom_place_holder');
            var placeHolderImageUrl = null;
            if (place_holder_index != '0') {
                placeHolderImageUrl = dialog.getContentElement('info', 'place_holder').items[place_holder_index - 1][2]
            } else {
                placeHolderImageUrl = customPlaceHolderUrl;
            }
            return placeHolderImageUrl;
        };
    var movieUrl = function(dialog) {
        var mysrc = dialog.getValueOf('info', 'src');
        var url = escape(mysrc);
        if (url.indexOf('http') != 0)
            url　 = window.location.protocol + "//" + window.location.host + url;
        return url;
    };
    var parseFilename = function(dialog, scale) {
        var mysrc = dialog.getContentElement("info", "src").getValue();
        if (scale == undefined)
            scale = dialog.getContentElement("info", "scale").getValue();
        var filename = mysrc.split('/').pop();
        filename = filename.split('?')[0];
        var filenamePeriodSplitArray = filename.split('.');
        var basename = filenamePeriodSplitArray[filenamePeriodSplitArray.length - 2];
        var parts = basename.split('_')
        var height = parts.pop();
        height = height * parseInt(scale) / 100;
        var width = parts.pop();
        width = width * parseInt(scale) / 100;
        return {
            height: height,
            width: width
        };
    };
    var parseAssetID = function(src) {
        return src.match(/video\/[0-9]*(?=\/)/).pop().split('/')[1]
    };
    var getScaledHeight = function(dialog, scale) {
        return parseFilename(dialog, scale).height + "px";
    };
    var getScaledWidth = function(dialog, scale) {
        return parseFilename(dialog, scale).width + "px";
    };
    var showHideBrowseCustomPlaceHolderButton = function(dialog) {
        if (dialog.getValueOf('info', 'place_holder') == '0') {
            dialog.getContentElement('info', 'browse_place_holder').getElement().setStyle('visibility', 'visible');
        } else {
            dialog.getContentElement('info', 'browse_place_holder').getElement().setStyle('visibility', 'hidden');
        }
    };
    var refreshPreview = function(dialog) {
        var shouldShowPreview = false;
        shouldShowPreview = (dialog.getValueOf('info', 'src') != '');
        var customPlaceHolderInfoValid = (dialog.getValueOf('info', 'place_holder') != '0' || dialog.getValueOf('info', 'custom_place_holder') != '');
        shouldShowPreview = shouldShowPreview && customPlaceHolderInfoValid;
        if (shouldShowPreview) {
            var filenameMetadata = parseFilename(dialog);
            var mywidth = filenameMetadata['width'];
            var myheight = filenameMetadata['height']
            var placeHolderImageIndex = dialog.getContentElement("info", "place_holder").getValue();
            var html = movieUrl(dialog);
            var src = "<div id='player' class='fixed-controls' style='width: 100%; height:180px;'>";
            src += "</div>";
            var loader = CKEDITOR.document.getById('FlashPreviewBox');
            loader.setHtml(src);
            CKEDITOR.document.getById('FlashPreviewBox').setStyle('display', 'block');
            CKEDITOR.document.getById('FlashPreviewBox').setStyle('position', 'relative');
            $("#player").flowplayer({
                // one video: a one-member playlist
                playlist: [
                    // a list of type-url mappings in picking order
                    [
                        { mp4:  html}
                    ]
                ],
                splash: true  // a splash setup
            });
        } else {
            CKEDITOR.document.getById('FlashPreviewBox').setStyle('display', 'none');
        }
    };　　　　
        var　 escape　 = function(value) {
        return　 value;　　　　
    };
    var previewAreaHtml = '<div>' + "<span style='font-weight:bold'>Video Player Preview</span>" + '<br><br>' + '<div id="FlashPreviewLoader" style="display:none"><div class="loading">&nbsp;</div></div>' + '<div style="text-align:center;" id="FlashPreviewBox"></div></div>';
    return {
        title: 　 'Insert Video',
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
            html: '<span style="font-weight:bold">' + "Video File" + '</span>'
        }, {
            type: 'hbox',
            widths: ['20%', '80%'],
            children: [{
                type: 'button',
                id: 'browse',
                filebrowser: {
                    target: 'info:src',
                    action: 'Browse',
                    onSelect: function(flvUrl, placeholderUrls) {
                        placeholderArray = this.getDialog().getContentElement("info", "place_holder").items;
                        placeholderArray[0][2] = placeholderUrls['placeholder1']
                        placeholderArray[1][2] = placeholderUrls['placeholder2']
                        placeholderArray[2][2] = placeholderUrls['placeholder3']
                    }
                },
                hidden: true,
                align: 'center',
                label: "Browse Files"
            }, {
                id: 'src',
                type: 'text',
                disabled: 'disabled',
                label: '',
                onChange: function() {
                    var mysrc = this.getDialog().getContentElement("info", "src").getValue();
                    var filename = mysrc.split('/').pop();
                    var filename = filename.split('?')[0];
                    var filenamePeriodSplitArray = filename.split('.');
                    var basename = filenamePeriodSplitArray[filenamePeriodSplitArray.length - 2];
                    var parts = basename.split('_')
                    var height = parts.pop();
                    var width = parts.pop();
                    refreshPreview(this.getDialog());
                },
                setup: function(setupHash) {
                    this.setValue(setupHash.media_url);
                },
                commit: function(commitHash) {
                    commitHash.media_url = this.getValue();
                }
            }]
        }]
    }, {
        id: 'caption',
        type: 'text',
        label: 'Caption',
        required: true,
        setup: function(setupHash) {
            this.setValue(setupHash.caption);
        },
        commit: function(commitHash) {
            commitHash.caption = this.getValue();
        }
    }, {
        type: 'hbox',
        widths: ['40%, 40%, 20%'],
        children: [{
            type: 　 'select',
        label: 　 'Player Size',
        required: true,
        id: 　 'scale',
        'default': '100',
                        　　　　　items: 　[
        ['Same as Source', 　'100'],
    ['80% of Source', 　'80'],
    ['60% of Source', 　'60'],
    ['40% of Source', 　'40'],
    ['20% of Source', 　'20']
],
    onChange: function() {
        refreshPreview(this.getDialog());
    },
    setup: function(setupHash) {}
}, {
    type: 　 'select',
        label: 　 'Placeholder Image',
        required: true,
                        　　　　　id: 　 'place_holder',
        'default': '1',
        items: 　[
        ['First Frame', 1],
        ['Second Frame', 2],
        ['Third Frame', 3],
        ['Custom Frame', 0]
    ],
                        　　　　　'default': '1',
        onChange: function() {
        showHideBrowseCustomPlaceHolderButton(this.getDialog());
        refreshPreview(this.getDialog());
    },
    setup: function(setupHash) {
        var placeHolderImageIndex = 0;
        var match = /placeholder_(\d{1})_/.exec(setupHash['placeholder_url']);
        if (match != null)
            placeHolderImageIndex = match[1];
        this.setValue(placeHolderImageIndex);
        showHideBrowseCustomPlaceHolderButton(this.getDialog());
    },
    commit: function(commitHash) {
        var url = this.getDialog().getValueOf('info', 'src');
        var placeholder_image_url = getPlaceHolderImageUrl(this.getDialog());
        if (placeholder_image_url.indexOf("http") != 0)
            placeholder_image_url = window.location.protocol + "//" + window.location.host + '' + placeholder_image_url　 + 　'';
        commitHash['placeholder_url'] = placeholder_image_url;
    }
}, {
    type: 'vbox',
        padding: 12,
        children: [{
        type: 'button',
        id: 'browse_place_holder',
        filebrowser: {
            target: 'info:custom_place_holder',
            action: 'Browse',
            url: editor.config.filebrowserSimpleImageBrowseUrl
        },
        hidden: true,
        align: 'center',
        label: 'Browse Files'
    }]
}, {
    id: 'custom_place_holder',
        type: 'text',
        hidden: true,
        label: 'Source',
        onChange: function() {
        refreshPreview(this.getDialog());
    },
    setup: function(setupHash) {
        var match = /placeholder_(\d{1})_/.exec(setupHash['placeholder_url']);
        if (!match) {
            this.setValue(setupHash['placeholder_url']);
        }
    }
}]
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
    var loader = CKEDITOR.document.getById('FlashPreviewBox');
    loader.setHtml("");
},
onShow: function() {
    var selectedElement = editor.getSelection().getStartElement(),
        videoDiv, setupHash = {};
    this.oldMediaDiv = CgCk.getRootElement(selectedElement, 'div');
    if (this.oldMediaDiv != null) {
        if (this.oldMediaDiv.getChildCount() == 2)
            setupHash['caption'] = this.oldMediaDiv.getChild(1).getText();
        else
            setupHash['caption'] = "";
        videoDiv = this.oldMediaDiv.getChild(0);
        setupHash['width'] = videoDiv.getAttribute('width');
        setupHash['height'] = videoDiv.getAttribute('height');
        setupHash['media_url'] = videoDiv.getAttribute('media_url');
        setupHash['placeholder_url'] = videoDiv.getAttribute('placeholder_url');
        this.setupContent(setupHash);
        var scale_element = this.getContentElement("info", "scale");
        for (var i = 0; i < scale_element.items.length; i++) {
            var actualWidth = getScaledWidth(this, scale_element.items[i][1]);
            if (setupHash['width'] == actualWidth) {
                scale_element.setValue(scale_element.items[i][1]);
                break;
            }
        }
    } else {　
                    showHideBrowseCustomPlaceHolderButton(this);
        var loader = CKEDITOR.document.getById('FlashPreviewBox');
        loader.setHtml("");
    }
},
onHide: function() {},
onOk: function() {
    var dialog = this,
        newMediaDiv = null,
        captionDiv = null,
        mywidth　 = getScaledWidth(this),
        myheight = getScaledHeight(this),
        commitHash = {
            media_url: '',
            placeholder_url: '',
            caption: ''
        };
    this.commitContent(commitHash);
    if (commitHash.media_url == '') {
        alert("File name cannot be empty");
        return false;
    }
    if (isNaN(mywidth.indexOf("px") > 0 ? mywidth.substring(0, mywidth.indexOf("px")) : mywidth)) {
        alert("Video width must be a valid number.");
        return false;
    } else if (mywidth.substring(0, mywidth.indexOf("px")) == 0) {
        var mywidth = 400
    }
    if (isNaN(myheight.indexOf("px") > 0 ? myheight.substring(0, myheight.indexOf("px")) : myheight)) {
        alert("Video height must be a valid number");
        return false;
    } else if (myheight.substring(0, myheight.indexOf("px")) == 0) {
        var myheight = 300
    }
    if (commitHash.placeholder_url == '') {
        alert("Custom Placeholder image is not selected");
        return false;
    }
    asset_id = parseAssetID(commitHash.media_url);
    newMediaDiv = CKEDITOR.dom.element.createFromHtml('<div class="figure cg_video embedded_asset" id="asset_' + asset_id + '"></div>', editor.document);
    videoDiv = CKEDITOR.dom.element.createFromHtml('<div class="media_container"></div>', editor.document);
    var videoDivAttrs = {
        width: mywidth,
        height: myheight,
        media_url: movieUrl(dialog),
        placeholder_url: commitHash['placeholder_url']
    };
    videoDiv.setAttributes(videoDivAttrs);
    placeholderImg = CKEDITOR.dom.element.createFromHtml('<img src="' + commitHash.placeholder_url + '" />', editor.document);
    placeholderImg.appendTo(videoDiv);
    videoDiv.appendTo(newMediaDiv);
    if (commitHash['caption'].length > 0) {
        captionDiv = CKEDITOR.dom.element.createFromHtml('<div class=caption>' + commitHash.caption + '</ div>', editor.document);
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