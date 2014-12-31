CgCkCallbacks = (function() {
    function isEmptyP(paragraph) {
        return paragraph.is('p') && !(paragraph.getText().replace(/\s+/g, '')) && !hasDescendantElement(paragraph, 'img');
    }

    function hasDescendantElement(element, descendant_string) {
        if (element.type !== 1) return false;
        var children = element.getChildren(),
            c = 0;
        while ((child = children.getItem(c++)) !== null) {
            if (child.type === 1) {
                if (child.is(descendant_string)) return true;
                if (hasDescendantElement(child, descendant_string)) return true;
            }
        }
        return false;
    }

    function getPreceedingTextInAscendant(contextElement, target, selection, currentRange) {
        var beforeRange = rangy.createRangyRange(CgCk.getIframeDoc());
        beforeRange.setEnd(target.$, currentRange.startOffset);
        beforeRange.setStart(contextElement.$, 0);
        var beforeText = beforeRange.toString();
        return beforeText;
    }

    function checkRealStartBoundary(element, range) {
        return (areEqualNodes(element, range.startContainer) && range.startOffset === 0);
    }

    function isEmptyElement(element) {
        return !(element.getText().replace(/\s+/g, '')) && !hasDescendantElement(element, 'img');
    }

    function isEmptyRange(range, count_white_space) {
        var noText = range.toString() === '';
        if (!count_white_space) {
            noText = range.toString().replace(/\s+/, '') === '';
        }
        var noImages = range.getNodes([1], function(node) {
            return node.nodeName.toLowerCase() === 'img';
        }).length === 0;
        return noText && noImages;
    }

    function checkVisibleStartBoundary(start_element, selection, count_white_space) {
        if (count_white_space === undefined) {
            count_white_space = false;
        }
        var currentRange = selection.getRanges()[0];
        var fakeCurrentRange = rangy.createRangyRange(CgCk.getIframeDoc());
        fakeCurrentRange.setEnd(currentRange.startContainer.$, currentRange.startOffset);
        fakeCurrentRange.setStart(start_element.$, 0);
        var rangeIsNotEmpty = !isEmptyRange(fakeCurrentRange, count_white_space);
        fakeCurrentRange.detach();
        if (rangeIsNotEmpty) {
            return false;
        } else {
            return true;
        }
    }

    function areEqualNodes(node1, node2) {
        if (node1 !== null && node2 !== null && _.isEqual(node1.getAddress(), node2.getAddress())) {
            return true;
        }
        return false;
    }

    function selectContents(domEvent, range, selection, node) {
        domEvent.preventDefault(true);
        range.selectNodeContents(node);
        selection.selectRanges([range]);
    }

    function keydownSpace(domEvent, editor, selection, caret, target, contextElement) {
        if (target.type === 1 && target.is('p') && !(isEmptyP(target))) {
            if (caret.checkBoundaryOfElement(target, CKEDITOR.END)) {
                do {
                    child = target.getChild(target.getChildCount() - 1);
                    if (child.type === 1 && child.is('br')) target = child.getPrevious();
                    else target = child;
                } while (target.type != 3);
                caret.moveToPosition(target, CKEDITOR.POSITION_BEFORE_END);
            } else if (caret.checkBoundaryOfElement(target, CKEDITOR.START)) {
                child = target.getChild(0);
                while (child.type != 3) {
                    if (child.type === 1 && child.is('br')) child = child.getNext();
                    else child = child.getChild();
                }
                target = child;
                caret.moveToPosition(target, CKEDITOR.POSITION_AFTER_START);
            }
            selection.selectRanges([caret]);
        }
        var startOffset = caret.startOffset;
        var lastChar, nextChar = target.getText().charAt(startOffset);
        if (startOffset) {
            lastChar = target.getText().charAt(startOffset - 1);
        } else {
            lastChar = "";
        }
        if (lastChar === "") {
            preceedingText = getPreceedingTextInAscendant(contextElement, target, selection, caret);
            if (preceedingText.length) {
                lastChar = preceedingText.charAt(preceedingText.length - 1);
            }
        }
        if (lastChar === "" || /\s/.test(lastChar)) {
            if (!(CgCk.preAlert)) {
                CgCk.preAlert = true;
            } else {}
            domEvent.preventDefault(true);
        } else if (/\s/.test(nextChar)) {
            caret.setStart(target, startOffset + 1);
            caret.collapse(true);
            selection.selectRanges([caret]);
            domEvent.preventDefault(true);
            CgCk.preAlert = false;
        } else {
            CgCk.preAlert = false;
        }
    }

    function deleteMediaDiv(domEvent, selection, range, rootDiv) {
        var newPTag = new CKEDITOR.dom.element('p');
        newPTag.$.innerHTML = '&nbsp;';
        if (checkerEntryList) {
            $('span.checker', rootDiv.$).each(function() {
                var klass = _.find($(this).attr('class').split(' '), function(klass) {
                    return /^checker_entry_\d+$/.test(klass);
                });
                if ($('span.' + klass, CgCk.getIframeDoc()).length === $('span.' + klass, rootDiv.$).length) {
                    if (checkerEntryList.get(klass)) {
                        checkerEntryList.get(klass).destroy('last');
                    }
                }
            });
        }
        newPTag.replace(rootDiv);
        range.moveToPosition(newPTag, CKEDITOR.POSITION_AFTER_START);
        selection.selectRanges([range]);
        domEvent.preventDefault(true);
    }

    function isMediaDivSelected(contextElement, caret) {
        return contextElement.is('div') && !caret.collapsed && ((!CKEDITOR.env.webkit && caret.checkBoundaryOfElement(contextElement, CKEDITOR.END) && caret.checkBoundaryOfElement(contextElement, CKEDITOR.START)) || (CKEDITOR.env.webkit && caret.checkBoundaryOfElement(contextElement.getChild(0), CKEDITOR.END) && caret.checkBoundaryOfElement(contextElement.getChild(0), CKEDITOR.START)));
    }

    function keydownBackspace(domEvent, editor, selection, caret, target, contextElement, stopEvent, cancelEvent) {
        var atBegin = checkVisibleStartBoundary(contextElement, selection);
        if (isMediaDivSelected(contextElement, caret)) {
            deleteMediaDiv(domEvent, selection, caret, contextElement);
        } else if (atBegin && contextElement.getPrevious() !== null && caret.collapsed && CgCk.isMediaDiv(contextElement.getPrevious())) {
            if (CKEDITOR.env.webkit) {
                rootDiv = CgCk.getRootElement(contextElement.getPrevious(), 'div');
                selectContents(domEvent, caret, selection, rootDiv.getChild(0));
            } else {
                rootDiv = CgCk.getRootElement(contextElement.getPrevious(), 'div');
                selectContents(domEvent, caret, selection, rootDiv);
            }
        } else if (atBegin && contextElement.getPrevious() !== null && contextElement.getPrevious().is('table')) {
            var table = contextElement.getPrevious();
            if (CKEDITOR.env.ie) {
                caret.selectNodeContents(table);
                selection.selectRanges([caret]);
            } else {
                selection.selectElement(table);
                caret.selectNodeContents(table);
            }
            domEvent.preventDefault(true);
            return;
        } else if (contextElement.is('div') && caret.collapsed && atBegin) {
            domEvent.preventDefault(true);
        } else if (target.getAscendant('table') && !caret.collapsed) {
            if (CKEDITOR.env.ie && CgCk.ieWholeTableSelected(caret.startContainer, caret.endContainer)) {
                selection.selectElement(target.getAscendant('table'));
            }
        } else if (contextElement.is('div')) {
            if (CKEDITOR.env.webkit) {
                selectContents(domEvent, caret, selection, contextElement.getChild(0));
            } else {
                selectContents(domEvent, caret, selection, contextElement);
            }
        } else if (contextElement.is('caption')) {
            if (atBegin) {
                domEvent.preventDefault(true);
            }
        } else if (contextElement.is('li') && contextElement.getPrevious() === null) {
            if (checkVisibleStartBoundary(target, selection, true)) {
                domEvent.preventDefault(true);
                var newPTag = new CKEDITOR.dom.element('p');
                newPTag.$.innerHTML = contextElement.$.innerHTML;
                contextElement.getParent().insertBeforeMe(newPTag);
                $(contextElement.$).remove();
                range = selection.getRanges()[0];
                pCon = range.startContainer = newPTag;
                newRange = new CKEDITOR.dom.range(range.document);
                newRange.moveToPosition(pCon, CKEDITOR.POSITION_BEFORE_START);
                newRange.select();
            }
        }
    }

    function keydownEnter(domEvent, editor, selection, caret, target, contextElement, cancelEvent) {
        var parentNodeNames = _.map(target.getParents(), function(e) {
            return e.$.nodeName.toLowerCase();
        });
        var supSubAPresent = _.intersection(parentNodeNames, CgCk.DO_NOT_BREAK_ARRAY).length > 0;
        var atBegin = checkVisibleStartBoundary(contextElement, selection);
        var preventAndInsertNewP = function() {
            domEvent.preventDefault(true);
            new_paragraph = new CKEDITOR.dom.element('p');
            new_paragraph.$.innerHTML = '&nbsp;';
            var insertionArgs = Array.prototype.slice.call(arguments, 1);
            new_paragraph[arguments[0]].apply(new_paragraph, insertionArgs);
            caret.moveToPosition(new_paragraph, CKEDITOR.POSITION_AFTER_START);
            selection.selectRanges([caret]);
        };
        if (contextElement.is('div') && caret.collapsed && atBegin) {
            preventAndInsertNewP('insertBefore', contextElement);
        } else if (contextElement.is('div')) {
            preventAndInsertNewP('insertAfter', contextElement);
        } else if (contextElement.is('p') && supSubAPresent && atBegin && caret.collapsed) {
            preventAndInsertNewP('insertBefore', contextElement);
        } else if (_.find(['th', 'td'], function(possibleContext) {
            return possibleContext === contextElement.getName();
        }) && supSubAPresent && atBegin && caret.collapsed) {
            preventAndInsertNewP('appendTo', contextElement, true);
        } else if (contextElement.is('li') && !contextElement.getPrevious() && supSubAPresent && caret.collapsed && atBegin) {
            preventAndInsertNewP('insertBefore', contextElement.getParent());
        } else if (contextElement.is('caption')) {
            if (atBegin) {
                preventAndInsertNewP('insertBefore', target.getAscendant('table'));
            } else {
                domEvent.preventDefault(true);
                cancelEvent();
            }
        } else {
            var t_parent = target.getParent();
            var t_parentIsElement = t_parent.type === 1;
            var doNotBreakT = t_parentIsElement && _.find(CgCk.DO_NOT_BREAK_ARRAY, function(nonBreakable) {
                if (t_parent.is(nonBreakable)) {
                    return true;
                }
            });
            var doNotBreakAncestor = t_parentIsElement && t_parent.is('span') && supSubAPresent;
            if (doNotBreakT || doNotBreakAncestor) {
                if (doNotBreakAncestor) {
                    t_parent = t_parent.getParent();
                }
                while (t_parent && _.find(CgCk.DO_NOT_BREAK_ARRAY, function(nonBreakable) {
                    return nonBreakable === t_parent.getName();
                })) {
                    target = target.getParent();
                    t_parent = target.getParent();
                }
                while (target.getNext() && target.getNext().type === 1 && _.find(CgCk.DO_NOT_BREAK_ARRAY, function(nonBreakable) {
                    return nonBreakable === target.getNext().getName();
                })) {
                    target = target.getNext();
                }
                caret.moveToPosition(target, CKEDITOR.POSITION_AFTER_END);
                selection.selectRanges([caret]);
                setTimeout(function() {
                    var oldUnbreakable = CgCk.targetElement(target);
                    if (oldUnbreakable.is('span')) {
                        var oldSpan = oldUnbreakable;
                        oldUnbreakable = oldUnbreakable.getParent();
                    }
                    if (editor.getSelection() && editor.getSelection().getRanges() && editor.getSelection().getRanges()[0]) {
                        var range = editor.getSelection().getRanges()[0];
                        unwanted = range.startContainer.getAscendant(oldUnbreakable.getName());
                        if (oldSpan && !range.startContainer.getText().replace(/\s+/g, '')) {
                            oldSpan.remove(true);
                        }
                        if (unwanted) {
                            unwanted.remove(true);
                        }
                    }
                }, 20);
            }
        }
    }

    function keyupEnter(domEvent, editor, contextElement) {
        var target = editor.getSelection().getStartElement(),
            newEmpty = false,
            target_p, previous_p;
        if (target.is('p'))
            target_p = target;
        else
            target_p = target.getAscendant('p');
        if (!target_p) {
            return;
        }
        previous_p = target_p.getPrevious();
        if (notMathFormula(previous_p)) {
            if (isEmptyP(target_p)) {
                newEmpty = target;
                previous_p !== null && previous_p.is('p') && previous_p.setHtml(previous_p.getHtml().replace(/\s+$/, '').replace(/\s+/g, ' '));
            } else if (previous_p !== null && previous_p.is('p') && isEmptyP(previous_p)) {
                newEmpty = previous_p;
            } else {
                previous_p !== null && previous_p.is('p') && previous_p.setHtml(previous_p.getHtml().replace(/\s+$/, '').replace(/\s+/g, ' '));
            }
        }
        if (newEmpty) {
            var paragraphs = editor.document.getElementsByTag('p');
            newEmpty.setAttribute('data-cke-protected', 'protected');
            for (var i = 0; i < paragraphs.count(); i++) {
                var paragraph = paragraphs.getItem(i);
                if (paragraph && isEmptyP(paragraph) && !(paragraph.hasAttribute('data-cke-protected'))) {
                    paragraph.remove();
                    i--;
                } else if (paragraph && paragraph.hasAttribute('data-cke-protected')) {
                    paragraph.removeAttribute('data-cke-protected');
                }
            }
        }
    }

    function notMathFormula(previous_p) {
        previous_p.getHtml().search('math-tex') < 0;
    }

    function keyupDeleteWrongSpans() {
        var test = function(protect) {
            return function(elem) {
                var classString = elem.getAttribute('class');
                if (classString) {
                    return _.intersection(classString.split(' '), protect).length > 0;
                } else {
                    return false;
                }
            };
        };
        var doc = CgCk.getIframeDoc();
        var spans = doc.getElementsByTagName('span');
        var spansToSquash = _.reject(spans, test(CgCk.PROTECT_SPANS_WITH_THIS_CLASS));
        var divs = doc.getElementsByTagName('div');
        var divsToSquash = _.reject(divs, test(CgCk.PROTECT_DIVS_WITH_THIS_CLASS));
        _.each(spansToSquash.concat(divsToSquash), function(s) {
            if ((s.getAttribute("data-cke-display-name") == 'math' || s.getAttribute('class') == "math-tex cke_widget_element") == false) {
                new CKEDITOR.dom.node(s).remove(true);
            }
        });
    }

    function paste(event) {
        var html = $('<div>').html(event.data);
        var pastedAnnotations = html.find('span.annotation');
        var editor = event.editor;
        var editorAnnotations = editor.getData('pageLoadAnnotations');
        if (typeof(editorAnnotations) == "object") {
            var pageLoadAnnotationClasses = _.keys(editorAnnotations);
            pastedAnnotations.each(function() {
                var self = $(this);
                var alreadyPresentClasses = _.filter(pageLoadAnnotationClasses, function(cssClass) {
                    return self.hasClass(cssClass);
                });
                self.removeAttr('class');
                if (alreadyPresentClasses.length !== 0) {
                    self.addClass('annotation');
                    _.map(alreadyPresentClasses, function(cssClass) {
                        self.addClass(cssClass);
                    });
                }
            });
        }
        event.data.html = html.html();
    }

    function afterPaste() {
        var editor = this;
        var selection = editor.getSelection(),
            caret = selection.getRanges()[0],
            target = caret.startContainer;
        var first_p = CgCk.targetElement(target);
        if (!first_p.is('p')) {
            first_p = first_p.getAscendant('p');
        }
        var outside_p = first_p;
        while (outside_p) {
            outside_p = outside_p.getAscendant('p');
            if (outside_p) {
                _.each(_.toArray(outside_p.$.childNodes), function(nativeElement) {
                    ckElement = new CKEDITOR.dom.element(nativeElement);
                    ckElement.insertBefore(outside_p);
                });
                outside_p.setHtml('');
            }
        }
    }
    CKEDITOR.plugins.add('cg_inputctrl', {
        init: function(editor) {
            CgCk.preAlert = false;
            editor.on('contentDom', function() {
                this.document.on('dragstart', function(evt) {
                    evt.data.preventDefault();
                    return false;
                });
                this.document.on('dragenter', function(evt) {
                    evt.data.preventDefault();
                    return false;
                });
                this.document.on('dragover', function(evt) {
                    evt.data.preventDefault();
                    return false;
                });
                this.document.on('drop', function(evt) {
                    evt.data.preventDefault();
                    return false;
                });
                var dragging = -1,
                    mouseStartX = -1,
                    mouseStartY = -1,
                    mouseX = -1,
                    mouseY = -1;
                this.document.on('mousedown', function(evt) {
                    dragging = 0;
                });
                this.document.on('mousemove', function(evt) {
                    dragging = 1;
                });
                this.document.on('click', function(event) {
                    var domEvent = event.data,
                        selection = editor.getSelection(),
                        currentRange = selection.getRanges()[0],
                        rootDiv;
                    rootDiv = CgCk.getRootElement(currentRange.startContainer, 'div');
                    if (currentRange.collapsed || dragging === 0) {
                        if (rootDiv !== null && !(checkVisibleStartBoundary(rootDiv, selection) && currentRange.collapsed)) {
                            if (CKEDITOR.env.webkit) {
                                selectContents(domEvent, currentRange, selection, rootDiv.getChild(0));
                            } else {
                                selectContents(domEvent, currentRange, selection, rootDiv);
                            }
                        }
                    }
                });
                this.document.on('mouseup', function(event) {
                    var domEvent = event.data,
                        selection = editor.getSelection(),
                        currentRange = selection.getRanges()[0],
                        startDiv, endDiv;
                    if (!currentRange.collapsed) {
                        startDiv = CgCk.getRootElement(currentRange.startContainer, 'div');
                        if (currentRange.endOffset === 0) {
                            endDiv = CgCk.getRootElement(currentRange.endContainer, 'div');
                        } else {
                            endDiv = CgCk.getRootElement(currentRange.endContainer, 'div');
                        }
                        if ((startDiv !== null || endDiv !== null) && !areEqualNodes(startDiv, endDiv)) {
                            if (startDiv !== null) {
                                currentRange.setStartAfter(startDiv);
                            }
                            if (endDiv !== null) {
                                newEndNode = endDiv.getPrevious();
                                currentRange.setEndAt(newEndNode, CKEDITOR.POSITION_BEFORE_END);
                            }
                            selection.selectRanges([currentRange]);
                        }
                    }
                });
                editor.on('afterPaste', afterPaste);
                editor.on('paste', paste);
                this.document.on('keydown', function(event, theEditor, data, stopEvent, cancelEvent) {
                    var domEvent = event.data,
                        selection = editor.getSelection(),
                        caret = selection.getRanges()[0],
                        target = caret.startContainer,
                        contextElement = CgCk.getContextElement(target);
                    if (contextElement.is('body') && _.indexOf([37, 38, 39, 40], domEvent.getKey()) == -1) {
                        domEvent.preventDefault(true);
                    }
                    if (contextElement.is('div') && contextElement.getId() !== 'cke_pastebin' && _.indexOf([13, 37, 38, 39, 40, 8], domEvent.getKey()) == -1) {
                        domEvent.preventDefault(true);
                        return;
                    }
                    if (domEvent.getKey() == 32) {
                        keydownSpace(domEvent, editor, selection, caret, target, contextElement);
                    }
                    if (domEvent.getKey() == 8) {
                        if ((!contextElement.is('div') && caret.collapsed) || contextElement.is('div') || target.getAscendant('table') !== null) {
                            keydownBackspace(domEvent, editor, selection, caret, target, contextElement, event.stop, event.cancel);
                        }
                    }
                    if (domEvent.getKey() == 13) {
                        keydownEnter(domEvent, editor, selection, caret, target, contextElement, event.cancel);
                    }
                }, this.document, {}, 9);
                this.document.on('keyup', function(event) {
                    var domEvent = event.data;
                    if (domEvent.getKey() == 13) {
                        keyupEnter(domEvent, editor);
                    }
                    keyupDeleteWrongSpans();
                });
            });
            editor.on('key', function(event) {
                var domEvent = event.data,
                    target = editor.getSelection().getStartElement();
                if (domEvent.keyCode == 9 && !target.is('td')) {
                    event.cancel();
                }
            }, null, null, 1);
        }
    });
    return {
        keydownEnter: keydownEnter,
        keydownBackspace: keydownBackspace,
        keydownSpace: keydownSpace,
        keyupDeleteWrongSpans: keyupDeleteWrongSpans,
        keyupEnter: keyupEnter,
        isEmptyElement: isEmptyElement,
        isEmptyP: isEmptyP,
        isEmptyRange: isEmptyRange,
        hasDescendantElement: hasDescendantElement,
        getPreceedingTextInAscendant: getPreceedingTextInAscendant,
        checkVisibleStartBoundary: checkVisibleStartBoundary,
        checkRealStartBoundary: checkRealStartBoundary,
        paste: paste
    };
})();