CKEDITOR.plugins.add('multimedia', {
    init: function(editor) {
        CKEDITOR.dialog.add('flvPlayer', this.path + 'dialogs/flvPlayer.js');
        CKEDITOR.dialog.add('flvPlayerAudio', this.path + 'dialogs/flvPlayerAudio.js');
        CKEDITOR.dialog.add('simpleImage', this.path + 'dialogs/simpleImage.js');
        editor.addCommand('flvPlayer', new CKEDITOR.dialogCommand('flvPlayer'));
        editor.addCommand('flvPlayerAudio', new CKEDITOR.dialogCommand('flvPlayerAudio'));
        editor.addCommand('simpleImage', new CKEDITOR.dialogCommand('simpleImage'));
        editor.ui.addButton('flvPlayer', {
            label: 'Insert Video',
            command: 'flvPlayer',
            icon: "plugins/multimedia/icons/video.png"
        });
        editor.ui.addButton('flvPlayerAudio', {
            label: 'Insert Audio',
            command: 'flvPlayerAudio',
            icon: "plugins/multimedia/icons/audio.png"
        });
        editor.ui.addButton('simpleImage', {
            label: 'Insert Image',
            command: 'simpleImage',
            icon: "plugins/multimedia/icons/image.png"
        });
        editor.on('doubleclick', function(evt) {
            var rootDiv = CgCk.getRootElement(evt.data.element, 'div');
            if (rootDiv && !rootDiv.isReadOnly() && rootDiv.hasClass('figure')) {
                if (rootDiv.hasClass('cg_video')) {
                    evt.data.dialog = 'flvPlayer';
                }
                if (rootDiv.hasClass('cg_audio')) {
                    evt.data.dialog = 'flvPlayerAudio';
                }
                if (rootDiv.hasClass('cg_image')) {
                    evt.data.dialog = 'simpleImage';
                }
            }
        });
        CKEDITOR.addCss('img.cke_player{background-position: center center;' + 'background-repeat: no-repeat;' + 'border: 1px solid #a9a9a9;' + 'width: 120px;' + 'height: 80px;' + '}');
        CKEDITOR.addCss('img.cke_player_audio{background-position: center center;' + 'background-repeat: no-repeat;' + 'border: 1px solid #a9a9a9;' + 'width: 120px;' + 'height: 80px;' + '}');
        if (editor.addMenuItems) {
            editor.addMenuItems({
                flvPlayer: {
                    label: 'Video Properties',
                    command: 'flvPlayer',
                    group: 'flash',
                    icon: "plugins/multimedia/icons/video.png"
                }
            });
        }
        if (editor.contextMenu) {
            editor.contextMenu.addListener(function(element, selection) {
                if (element && element.is('img')) {
                    if (element.getAttribute('_cke_real_element_type') == "cke_player" || element.getAttribute('_cke_real_element_type') == "flvPlayer") {
                        return {
                            flvPlayer: 2
                        };
                    } else if (element.getAttribute('_cke_real_element_type') == 'citation')
                        return {
                            citation: CKEDITOR.TRISTATE_OFF
                        };
                } else return null;
            });
        }
        editor.on('flvPlayer', function() {
            var doc = editor.document;
            var allsup = doc.getElementsByTag('input');
            for (var i = 0; i < allsup.count(); i++) {
                var sup = allsup.getItem(i);
                if (sup.hasClass('supNote')) {
                    sup.on('DOMNodeRemoved', editor.notesUpdate);
                }
            }
        });
    },
    afterInit: function(editor) {
        CKEDITOR.config.toolbar = CKEDITOR.config.toolbar_Full;
    }
});